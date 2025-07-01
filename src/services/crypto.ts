import * as nacl from 'tweetnacl'
import { decode as decodeBase64, encode as encodeBase64 } from 'js-base64'

export const signTransaction = async (txData: any, privateKey: string): Promise<string> => {
  try {
    // Create the message to sign
    const message = JSON.stringify(txData)
    const messageBytes = new TextEncoder().encode(message)
    
    // Decode the private key - handle both 32-byte and 64-byte formats
    const privateKeyBytes = decodeBase64(privateKey)
    
    let secretKey: Uint8Array
    if (privateKeyBytes.length === 32) {
      // If it's a 32-byte seed, generate the full keypair
      const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes)
      secretKey = keyPair.secretKey
    } else if (privateKeyBytes.length === 64) {
      // If it's already a 64-byte secret key, use it directly
      secretKey = privateKeyBytes
    } else {
      throw new Error('Invalid private key length')
    }
    
    // Sign the message
    const signature = nacl.sign.detached(messageBytes, secretKey)
    
    // Return base64 encoded signature
    return encodeBase64(signature)
  } catch (error) {
    throw new Error('Failed to sign transaction')
  }
}

export const getPublicKeyFromPrivate = (privateKey: string): string => {
  try {
    if (!privateKey) {
      return ''
    }
    
    const privateKeyBytes = decodeBase64(privateKey)
    
    let publicKey: Uint8Array
    if (privateKeyBytes.length === 32) {
      // If it's a 32-byte seed, generate the keypair and extract public key
      const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes)
      publicKey = keyPair.publicKey
    } else if (privateKeyBytes.length === 64) {
      // If it's a 64-byte secret key, extract the public key from the last 32 bytes
      publicKey = privateKeyBytes.slice(32)
    } else {
      throw new Error('Invalid private key length')
    }
    
    return encodeBase64(publicKey)
  } catch (error) {
    console.error('Error extracting public key:', error)
    return ''
  }
}

export const generateKeyPair = () => {
  const keyPair = nacl.sign.keyPair()
  return {
    privateKey: encodeBase64(keyPair.secretKey.slice(0, 32)), // Store only the seed (32 bytes)
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey) // Full 64-byte secret key
  }
}