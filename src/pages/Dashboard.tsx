import BalanceInfo from '../components/BalanceInfo'
import HistoryTable from '../components/HistoryTable'
import { useOctra } from '../hooks/useOctra'
import { useWallet } from '../hooks/useWallet'
import { useEffect } from 'react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { balance, nonce, transactions, stagingCount, refreshBalance } = useOctra()
  const { address } = useWallet()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceInfo 
          balance={balance} 
          nonce={nonce} 
          stagingCount={stagingCount}
          address={address || ''}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <HistoryTable transactions={transactions} />
      </div>
    </div>
  )
}
