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

interface HistoryTableProps {
  transactions: Transaction[]
}

export default function HistoryTable({ transactions }: HistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To/From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.hash}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(tx.time, 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${tx.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tx.amount.toFixed(6)} OCT
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {tx.type === 'in' ? tx.from.substring(0, 10) + '...' : tx.to.substring(0, 10) + '...'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.epoch ? `Epoch ${tx.epoch}` : 'Pending'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
