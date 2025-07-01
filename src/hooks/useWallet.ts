import { useState, useEffect } from 'react'
import { loadWallet, saveWallet } from '../services/wallet'
import * as nacl from 'tweetnacl'
import { encodeBase64 } from 'js-base64'

export interface WalletData {
  priv: string
  addr: string
  rpc: string
}

export default function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initWallet = async () => {
      try {
        const loadedWallet = await loadWallet()
        setWallet(loadedWallet)
      } catch (err) {
        setError('Failed to load wallet')
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
