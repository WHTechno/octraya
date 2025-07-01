import * as nacl from 'tweetnacl'
import { decode as decodeBase64, encode as encodeBase64 } from 'js-base64'

export const signTransaction = async (txData: any, privateKey: string): Promise<string> => {
  try {
    // Create the message to sign - exclude message field like in CLI
    const { message, ...txForSigning } = txData
    const messageToSign = JSON.stringify(txForSigning, null, 0).replace(/\s/g, '')
    const messageBytes = new TextEncoder().encode(messageToSign)
    
    // Decode the private key
    const privateKeyBytes = decodeBase64(privateKey)
    
    if (privateKeyBytes.length !== 64) {
      throw new Error('Invalid private key length')
    }
    
    // Sign the message
    const signature = nacl.sign.detached(messageBytes, privateKeyBytes)
    
    // Return base64 encoded signature
    return encodeBase64(signature)
  } catch (error) {
    console.error('Signing error:', error)
    throw new Error('Failed to sign transaction')
  }
}

export const getPublicKeyFromPrivate = (privateKey: string): string => {
  try {
    if (!privateKey) {
      return ''
    }
    
    const privateKeyBytes = decodeBase64(privateKey)
    
    if (privateKeyBytes.length !== 64) {
      throw new Error('Invalid private key length')
    }
    
    // Extract the public key from the last 32 bytes of the secret key
    const publicKey = privateKeyBytes.slice(32)
    
    return encodeBase64(publicKey)
  } catch (error) {
    console.error('Error extracting public key:', error)
    throw new Error('Invalid private key length')
  }
}

export const generateKeyPair = () => {
  const keyPair = nacl.sign.keyPair()
  return {
    privateKey: encodeBase64(keyPair.secretKey), // Store full 64-byte secret key like CLI
    publicKey: encodeBase64(keyPair.publicKey),
    address: `oct${encodeBase64(keyPair.publicKey)}`
  }
}