import { useWallet } from '../hooks/useWallet'

export default function Header() {
  const { address } = useWallet()
  
  return (
    <header className="bg-white shadow">
      <div className="px-4 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Octra Wallet</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {address ? `${address.substring(0, 10)}...${address.substring(address.length - 4)}` : 'Not connected'}
          </span>
        </div>
      </div>
    </header>
  )
}
