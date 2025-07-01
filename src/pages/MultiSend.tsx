import { useState } from 'react'
import { useOctra } from '../hooks/useOctra'
import { useNavigate } from 'react-router-dom'
import { validateAddress } from '../utils/validation'

interface Recipient {
  address: string
  amount: string
  error?: string
}

export default function MultiSend() {
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', amount: '' }])
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { send } = useOctra()
  const navigate = useNavigate()

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }])
  }

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) return
    const newRecipients = [...recipients]
    newRecipients.splice(index, 1)
    setRecipients(newRecipients)
  }

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const newRecipients = [...recipients]
    newRecipients[index] = { ...newRecipients[index], [field]: value }
    
    // Validate address
    if (field === 'address' && value && !validateAddress(value)) {
      newRecipients[index].error = 'Invalid address'
    } else if (field === 'address') {
      delete newRecipients[index].error
    }
    
    setRecipients(newRecipients)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate all recipients
    let isValid = true
    const validatedRecipients = recipients.map(r => {
      const amountNum = parseFloat(r.amount)
      if (!validateAddress(r.address) {
        isValid = false
        return { ...r, error: 'Invalid address' }
      }
      if (isNaN(amountNum) || amountNum <= 0) {
        isValid = false
        return { ...r, error: 'Invalid amount' }
      }
      return r
    })
    
    if (!isValid) {
      setRecipients(validatedRecipients)
      setError('Please fix all errors before submitting')
      return
    }
    
    try {
      setIsSending(true)
      // Send transactions sequentially
      for (const recipient of recipients) {
        await send(recipient.address, parseFloat(recipient.amount))
      }
      navigate('/')
    } catch (err) {
      setError('Failed to send one or more transactions')
    } finally {
      setIsSending(false)
    }
  }

  const totalAmount = recipients.reduce((sum, r) => {
    const amount = parseFloat(r.amount) || 0
    return sum + amount
  }, 0)

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Multi Send</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-6">
                <label htmlFor={`address-${index}`} className="block text-sm font-medium text-gray-700">
                  Recipient {index + 1}
                </label>
                <input
                  type="text"
                  id={`address-${index}`}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                  placeholder="oct..."
                  required
                />
                {recipient.error && (
                  <p className="mt-1 text-sm text-red-600">{recipient.error}</p>
                )}
              </div>
              
              <div className="col-span-4">
                <label htmlFor={`amount-${index}`} className="block text-sm font-medium text-gray-700">
                  Amount (OCT)
                </label>
                <input
                  type="number"
                  id={`amount-${index}`}
                  step="0.000001"
                  min="0.000001"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={recipient.amount}
                  onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                  required
                />
              </div>
              
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="inline-flex justify-center py-2 px-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={recipients.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addRecipient}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Recipient
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Total Recipients:</span>
            <span className="text-sm font-semibold text-gray-900">{recipients.length}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-sm font-semibold text-gray-900">{totalAmount.toFixed(6)} OCT</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send All'}
          </button>
        </div>
      </form>
    </div>
  )
}
