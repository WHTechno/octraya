import { WalletData } from '../hooks/useWallet'

export const loadWallet = async (): Promise<WalletData> => {
  const walletJson = localStorage.getItem('octra_wallet')
  if (!walletJson) {
    throw new Error('No wallet found')
  }
  return JSON.parse(walletJson)
}

export const saveWallet = async (wallet: WalletData): Promise<void> => {
  localStorage.setItem('octra_wallet', JSON.stringify(wallet))
}

export const clearWallet = async (): Promise<void> => {
  localStorage.removeItem('octra_wallet')
}
