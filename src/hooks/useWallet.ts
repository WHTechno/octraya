import { useState, useEffect } from 'react'
import { loadWallet, saveWallet, clearWallet } from '../services/wallet'
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
          // Check if the private key has the correct length (64 bytes for tweetnacl secret key)
          if (privBytes.length !== 64) {
            throw new Error('Invalid private key length')
          }
          // Try to create a key pair to further validate the private key
          nacl.sign.keyPair.fromSecretKey(privBytes)
          
          setWallet(loadedWallet)
        } catch (validationErr) {
          // Private key is corrupted, clear the wallet and create a new one
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
      const keyPair = nacl.sign.keyPair()
      const priv = encodeBase64(keyPair.secretKey)
      const pub = encodeBase64(keyPair.publicKey)
      const addr = `oct${pub}`
      
      const newWallet = {
        priv,
        addr,
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