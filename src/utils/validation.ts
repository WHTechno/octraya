const OCTRA_ADDRESS_REGEX = /^oct[1-9A-HJ-NP-Za-km-z]{44}$/

export const validateAddress = (address: string): boolean => {
  return OCTRA_ADDRESS_REGEX.test(address)
}

export const validateAmount = (amount: string): boolean => {
  const amountNum = parseFloat(amount)
  return !isNaN(amountNum) && amountNum > 0
}
