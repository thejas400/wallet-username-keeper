
import CryptoJS from 'crypto-js';

/**
 * Encrypts data using AES with the wallet address as key
 */
export const encryptData = (data: string, walletAddress: string): string => {
  // Use the wallet address as the encryption key (hashed for security)
  const key = CryptoJS.SHA256(walletAddress).toString();
  
  // Encrypt the data
  const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
  
  return encryptedData;
};

/**
 * Decrypts data using AES with the wallet address as key
 */
export const decryptData = (encryptedData: string, walletAddress: string): string => {
  try {
    // Use the wallet address as the encryption key (hashed for security)
    const key = CryptoJS.SHA256(walletAddress).toString();
    
    // Decrypt the data
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedData) {
      throw new Error('Decryption failed');
    }
    
    return decryptedData;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};
