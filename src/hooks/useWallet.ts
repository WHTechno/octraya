import { useState, useEffect } from 'react'
import { loadWallet, saveWallet, clearWallet } from '../services/wallet'
import { generateKeyPair } from '../services/crypto'
import * as nacl from 'tweetnacl'
import { encode as encodeBase64, decode as decodeBase64 } from 'js-base64'

export interface WalletData {
  priv: string
  addr: string
  rpc: string
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initWallet = async () => {
      try {
        const loadedWallet = await loadWallet()
        
        // Validate the private key integrity
        try {
          const privBytes = decodeBase64(loadedWallet.priv)
          
          // Check if the private key has the correct length
          if (privBytes.length !== 64) {
            throw new Error('Invalid private key length')
          }
          
          // Try to create a key pair to further validate the private key
          nacl.sign.keyPair.fromSecretKey(privBytes)
          
          setWallet(loadedWallet)
        } catch (validationErr) {
          // Private key is corrupted, clear the wallet and create a new one
          console.warn('Private key validation failed, creating new wallet:', validationErr)
          await clearWallet()
          const newWallet = await createWallet()
          setWallet(newWallet)
        }
      } catch (err) {
        // If no wallet exists, create a new one
        try {
          const newWallet = await createWallet()
          setWallet(newWallet)
        } catch (createErr) {
          setError('Failed to create wallet')
        }
      } finally {
        setLoading(false)
      }
    }
    initWallet()
  }, [])

  const createWallet = async (rpcUrl = 'https://octra.network') => {
    try {
      const { privateKey, publicKey, address } = generateKeyPair()
      
      const newWallet = {
        priv: privateKey,
        addr: address,
        rpc: rpcUrl
      }
      
      await saveWallet(newWallet)
      setWallet(newWallet)
      return newWallet
    } catch (err) {
      setError('Failed to create wallet')
      throw err
    }
  }

  const importWallet = async (privateKey: string, rpcUrl = 'https://octra.network') => {
    try {
      const privBytes = decodeBase64(privateKey)
      
      // Validate private key length before proceeding
      if (privBytes.length !== 64) {
        throw new Error('Invalid private key length')
      }
      
      const keyPair = nacl.sign.keyPair.fromSecretKey(privBytes)
      const pub = encodeBase64(keyPair.publicKey)
      const addr = `oct${pub}`
      
      const importedWallet = {
        priv: privateKey,
        addr,
        rpc: rpcUrl
      }
      
      await saveWallet(importedWallet)
      setWallet(importedWallet)
      return importedWallet
    } catch (err) {
      setError('Invalid private key')
      throw err
    }
  }

  return {
    wallet,
    address: wallet?.addr || null,
    privateKey: wallet?.priv || null,
    rpc: wallet?.rpc || 'https://octra.network',
    loading,
    error,
    createWallet,
    importWallet,
    setRpc: (rpc: string) => {
      if (!wallet) return
      const updated = { ...wallet, rpc }
      setWallet(updated)
      saveWallet(updated)
    }
  }
}