import * as nacl from 'tweetnacl'
import { decode as decodeBase64, encode as encodeBase64 } from 'js-base64'

export const signTransaction = async (txData: any, privateKey: string): Promise<string> => {
  try {
    // Create the message to sign
    const message = JSON.stringify(txData)
    const messageBytes = new TextEncoder().encode(message)
    
    // Decode the private key
    const privateKeyBytes = decodeBase64(privateKey)
    
    // Sign the message
    const signature = nacl.sign.detached(messageBytes, privateKeyBytes)
    
    // Return base64 encoded signature
    return encodeBase64(signature)
  } catch (error) {
    throw new Error('Failed to sign transaction')
  }
}

export const getPublicKeyFromPrivate = (privateKey: string): string => {
  try {
    const privateKeyBytes = decodeBase64(privateKey)
    const keyPair = nacl.sign.keyPair.fromSecretKey(privateKeyBytes)
    return encodeBase64(keyPair.publicKey)
  } catch (error) {
    throw new Error('Failed to extract public key')
  }
}