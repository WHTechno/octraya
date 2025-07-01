import axios from 'axios'

const api = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to handle CORS
api.interceptors.request.use(
  (config) => {
    // Ensure we're making proper requests
    if (config.url && !config.url.startsWith('http')) {
      config.url = config.baseURL + config.url
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle different response formats
api.interceptors.response.use(
  (response) => {
    // If the response is text/plain, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data)
      } catch (e) {
        // If it's not valid JSON, keep it as string
      }
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

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
    if (axios.isAxiosError(error)) {
      // Handle 404 errors
      if (error.response?.status === 404) {
        return { staged_transactions: [] }
      }
      // Handle network errors (no response received)
      if (!error.response) {
        return { staged_transactions: [] }
      }
    }
    throw error
  }
}

export const sendTransaction = async (tx: any, rpcUrl: string) => {
  const response = await api.post(`${rpcUrl}/send-tx`, tx)
  return response.data
}