import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import copy from 'copy-to-clipboard'
import { encodeBase64 } from 'js-base64'

export default function ExportKeys() {
  const { address, privateKey, wallet } = useWallet()
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState('')

  const handleCopy = (text: string, type: string) => {
    copy(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const downloadWallet = () => {
    if (!wallet) return
    
    const blob = new Blob([JSON.stringify(wallet, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `octra_wallet_${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Export Wallet</h3>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={address || ''}
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
            />
            <button
              onClick={() => handleCopy(address || '', 'address')}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {copied === 'address' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={privateKey ? encodeBase64(privateKey.slice(32)) : ''}
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
            />
            <button
              onClick={() => handleCopy(privateKey ? encodeBase64(privateKey.slice(32)) : '', 'public')}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {copied === 'public' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Private Key</label>
          <div className="flex">
            <input
              type={showPrivateKey ? "text" : "password"}
              readOnly
              value={privateKey || ''}
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
            />
            <button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {showPrivateKey ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() => handleCopy(privateKey || '', 'private')}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {copied === 'private' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-sm text-red-600">
            Warning: Never share your private key! Anyone with your private key can access your funds.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={downloadWallet}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download Wallet File
          </button>
        </div>
      </div>
    </div>
  )
}
