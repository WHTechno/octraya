import axios from 'axios';

const api = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk parse jika response adalah string JSON (CLI-style)
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch (e) {
        // Not JSON? Leave it as string
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function validateRpcUrl(rpcUrl: string) {
  if (!rpcUrl || !rpcUrl.startsWith('http')) {
    throw new Error(`Invalid rpcUrl: "${rpcUrl}"`);
  }
}

export const getBalance = async (address: string, rpcUrl: string) => {
  validateRpcUrl(rpcUrl);
  try {
    const response = await api.get(`${rpcUrl}/balance/${address}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { balance: 0, nonce: 0 };
    }
    console.error("Balance fetch error:", error);
    throw error;
  }
};

export const getAddressInfo = async (address: string, rpcUrl: string) => {
  validateRpcUrl(rpcUrl);
  try {
    const response = await api.get(`${rpcUrl}/address/${address}?limit=20`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || !error.response) {
        return { recent_transactions: [] };
      }
    }
    throw error;
  }
};

export const getTransaction = async (hash: string, rpcUrl: string) => {
  validateRpcUrl(rpcUrl);
  const response = await api.get(`${rpcUrl}/tx/${hash}`);
  return response.data;
};

export const getStaging = async (rpcUrl: string) => {
  validateRpcUrl(rpcUrl);
  try {
    const response = await api.get(`${rpcUrl}/staging`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || !error.response) {
        return { staged_transactions: [] };
      }
    }
    throw error;
  }
};

export const sendTransaction = async (tx: any, rpcUrl: string) => {
  validateRpcUrl(rpcUrl);
  const response = await api.post(`${rpcUrl}/send-tx`, tx);
  return response.data;
};
