import BalanceInfo from '../components/BalanceInfo'
import HistoryTable from '../components/HistoryTable'
import { useOctra } from '../hooks/useOctra'
import { useWallet } from '../hooks/useWallet'

export default function Dashboard() {
  const { balance, nonce, transactions, stagingCount, refreshBalance, clearHistory } = useOctra()
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
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          <div className="space-x-2">
            <button
              onClick={refreshBalance}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh
            </button>
            <button
              onClick={clearHistory}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear History
            </button>
          </div>
        </div>
        <HistoryTable transactions={transactions} />
      </div>
      
      {stagingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Pending Transactions
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You have {stagingCount} transaction(s) waiting to be processed.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}