import { format } from 'date-fns'

interface BalanceInfoProps {
  balance: number | null
  nonce: number | null
  stagingCount: number
  address: string
}

export default function BalanceInfo({ balance, nonce, stagingCount, address }: BalanceInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Wallet Information</h3>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Address</label>
          <p className="mt-1 text-sm text-gray-900 font-mono break-all">{address}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Balance</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {balance !== null ? `${balance.toFixed(6)} OCT` : 'Loading...'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Nonce</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {nonce !== null ? nonce : 'Loading...'}
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500">Pending Transactions</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {stagingCount}
          </p>
        </div>
      </div>
    </div>
  )
}
