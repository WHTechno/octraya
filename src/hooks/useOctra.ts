import { useState, useEffect } from 'react'
import { 
  getBalance, 
  getAddressInfo, 
  getTransaction, 
  getStaging,
  sendTransaction 
} from '../services/api'
import { useWallet } from './useWallet'
import { format } from 'date-fns'

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

export default function useOctra() {
  const { address, rpc } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [nonce, setNonce] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stagingCount, setStagingCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = async () => {
    if (!address) return
    setLoading(true)
    try {
      const data = await getBalance(address, rpc)
      setBalance(data.balance || 0)
      setNonce(data.nonce || 0)
    } catch (err) {
      setError('Failed to fetch balance')
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
      
      const txDetails = await Promise.all(
        txHashes.map((hash: string) => getTransaction(hash, rpc))
      
      const newTransactions = txDetails.map((detail: any) => {
        const tx = detail.parsed_tx
        const isIncoming = tx.to === address
        return {
          hash: detail.hash,
          time: new Date(tx.timestamp * 1000),
          amount: isIncoming ? tx.amount : -tx.amount,
          to: tx.to,
          from: tx.from,
          type: isIncoming ? 'in' : 'out',
          nonce: tx.nonce,
          epoch: detail.epoch,
          message: detail.message
        }
      })
      
      setTransactions(newTransactions)
    } catch (err) {
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
      setError('Failed to fetch staging transactions')
    }
  }

  const send = async (to: string, amount: number, message?: string) => {
    if (!address || !nonce) throw new Error('Wallet not ready')
    
    const tx = {
      from: address,
      to_: to,
      amount: amount.toString(),
      nonce: nonce + 1,
      ou: amount < 1000 ? "1" : "3",
      timestamp: Date.now() / 1000
    }
    
    const signature = await signTransaction(tx)
    
    const response = await sendTransaction({
      ...tx,
      signature,
      public_key: getPublicKey()
    }, rpc)
    
    await refreshBalance()
    await refreshTransactions()
    await refreshStaging()
    
    return response
  }

  const signTransaction = async (txData: any) => {
    // Implement signing logic using wallet private key
    // This is a placeholder - actual signing should use tweetnacl
    return 'signature-placeholder'
  }

  const getPublicKey = () => {
    // Implement getting public key from wallet
    return 'public-key-placeholder'
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
    send
  }
}
