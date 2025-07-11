import { useState, useEffect } from 'react'
import { 
  getBalance, 
  getAddressInfo, 
  getTransaction, 
  getStaging,
  sendTransaction 
} from '../services/api'
import { useWallet } from './useWallet'
import { signTransaction, getPublicKeyFromPrivate } from '../services/crypto'

interface Transaction {
  hash: string
  time: Date
  amount: number
  to: string
  from: string
  type: 'in' | 'out'
  nonce: number
  epoch?: number
  message?: string
}

export function useOctra() {
  const { address, rpc, privateKey } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [nonce, setNonce] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stagingCount, setStagingCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = async () => {
    if (!address) return
    setLoading(true)
    setError(null)
    try {
      const data = await getBalance(address, rpc)
      
      // Handle different possible response formats like CLI
      if (typeof data === 'object' && data !== null) {
        // Parse balance as string or number
        const balanceValue = typeof data.balance === 'string' 
          ? parseFloat(data.balance) 
          : (data.balance || 0)
        
        // Parse nonce as string or number
        const nonceValue = typeof data.nonce === 'string'
          ? parseInt(data.nonce, 10)
          : (data.nonce || 0)
        
        setBalance(isNaN(balanceValue) ? 0 : balanceValue)
        setNonce(isNaN(nonceValue) ? 0 : nonceValue)
      } else if (typeof data === 'string') {
        // Handle plain text response like CLI does
        try {
          const parts = data.trim().split()
          if (parts.length >= 2) {
            const balanceValue = parseFloat(parts[0])
            const nonceValue = parseInt(parts[1], 10)
            setBalance(isNaN(balanceValue) ? 0 : balanceValue)
            setNonce(isNaN(nonceValue) ? 0 : nonceValue)
          } else {
            setBalance(0)
            setNonce(0)
          }
        } catch {
          setBalance(0)
          setNonce(0)
        }
      } else {
        setBalance(0)
        setNonce(0)
      }
    } catch (err) {
      console.error('Balance fetch error:', err)
      setError('Failed to fetch balance')
      setBalance(0)
      setNonce(0)
    } finally {
      setLoading(false)
    }
  }

  const refreshTransactions = async () => {
    if (!address) return
    setLoading(true)
    try {
      const addressInfo = await getAddressInfo(address, rpc)
      const txHashes = addressInfo.recent_transactions?.map((tx: any) => tx.hash) || []
      
      if (txHashes.length === 0) {
        setTransactions([])
        return
      }

      const txDetails = await Promise.all(
        txHashes.map(async (hash: string) => {
          try {
            return await getTransaction(hash, rpc)
          } catch (err) {
            console.error(`Failed to fetch transaction ${hash}:`, err)
            return null
          }
        })
      )
      
      const newTransactions = txDetails
        .filter(detail => detail !== null)
        .map((detail: any) => {
          const tx = detail.parsed_tx || detail
          const isIncoming = tx.to === address
          
          // Handle amount like CLI - check for amount_raw first
          let amount = 0
          if (tx.amount_raw) {
            amount = parseFloat(tx.amount_raw) / 1000000 // Convert from raw to OCT
          } else if (tx.amount) {
            amount = parseFloat(tx.amount)
          }
          
          return {
            hash: detail.hash || tx.hash,
            time: new Date((tx.timestamp || Date.now() / 1000) * 1000),
            amount: Math.abs(amount),
            to: tx.to || '',
            from: tx.from || '',
            type: isIncoming ? 'in' : 'out' as 'in' | 'out',
            nonce: parseInt(tx.nonce) || 0,
            epoch: detail.epoch,
            message: tx.message || detail.message
          }
        })
      
      setTransactions(newTransactions)
    } catch (err) {
      console.error('Transaction fetch error:', err)
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const refreshStaging = async () => {
    if (!address) return
    try {
      const staging = await getStaging(rpc)
      const ourTxs = staging.staged_transactions?.filter((tx: any) => tx.from === address) || []
      setStagingCount(ourTxs.length)
    } catch (err) {
      console.error('Staging fetch error:', err)
      setStagingCount(0)
    }
  }

  const send = async (to: string, amount: number, message?: string) => {
    if (!address || nonce === null || !privateKey) {
      throw new Error('Wallet not ready')
    }
    
    // Create transaction object like CLI
    const tx = {
      from: address,
      to_: to,
      amount: Math.floor(amount * 1000000).toString(), // Convert to raw amount like CLI
      nonce: nonce + 1,
      ou: amount < 1000 ? "1" : "3",
      timestamp: Math.floor(Date.now() / 1000) + Math.random() * 0.01
    }
    
    // Add message if provided
    if (message) {
      (tx as any).message = message
    }
    
    try {
      const signature = await signTransaction(tx, privateKey)
      const publicKey = getPublicKeyFromPrivate(privateKey)
      
      const response = await sendTransaction({
        ...tx,
        signature,
        public_key: publicKey
      }, rpc)
      
      // Refresh data after sending
      setTimeout(() => {
        refreshBalance()
        refreshTransactions()
        refreshStaging()
      }, 1000)
      
      return response
    } catch (err) {
      console.error('Send transaction error:', err)
      throw err
    }
  }

  const clearHistory = () => {
    setTransactions([])
  }

  useEffect(() => {
    if (address) {
      refreshBalance()
      refreshTransactions()
      refreshStaging()
    }
  }, [address, rpc])

  return {
    balance,
    nonce,
    transactions,
    stagingCount,
    loading,
    error,
    refreshBalance,
    refreshTransactions,
    refreshStaging,
    send,
    clearHistory
  }
}