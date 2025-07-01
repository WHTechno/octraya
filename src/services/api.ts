import axios from 'axios'

const api = axios.create({
  timeout: 10000
})

export const getBalance = async (address: string, rpcUrl: string) => {
  try {
    const response = await api.get(`${rpcUrl}/balance/${address}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { balance: 0, nonce: 0 }
    }
    throw error
  }
}

export const getAddressInfo = async (address: string, rpcUrl: string) => {
  try {
    const response = await api.get(`${rpcUrl}/address/${address}?limit=20`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle 404 errors
      if (error.response?.status === 404) {
        return { recent_transactions: [] }
      }
      // Handle network errors (no response received)
      if (!error.response) {
        return { recent_transactions: [] }
      }
    }
    throw error
  }
}

export const getTransaction = async (hash: string, rpcUrl: string) => {
  const response = await api.get(`${rpcUrl}/tx/${hash}`)
  return response.data
}

export const getStaging = async (rpcUrl: string) => {
  try {
    const response = await api.get(`${rpcUrl}/staging`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { staged_transactions: [] }
    }
    throw error
  }
}

export const sendTransaction = async (tx: any, rpcUrl: string) => {
  const response = await api.post(`${rpcUrl}/send-tx`, tx)
  return response.data
}