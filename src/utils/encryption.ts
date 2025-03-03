
import CryptoJS from 'crypto-js';

/**
 * Standardizes the encryption key to ensure consistent encryption/decryption
 */
const standardizeKey = (walletAddress: string): string => {
  // Create a consistent key by hashing the wallet address
  return CryptoJS.SHA256(walletAddress.toLowerCase()).toString();
};

/**
 * Encrypts data using AES with the wallet address as key
 */
export const encryptData = (data: string, walletAddress: string): string => {
  // Use the standardized wallet address as the encryption key
  const key = standardizeKey(walletAddress);
  
  // Encrypt the data
  const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
  
  return encryptedData;
};

/**
 * Decrypts data using AES with the wallet address as key
 */
export const decryptData = (encryptedData: string, walletAddress: string): string => {
  try {
    // Use the standardized wallet address as the encryption key
    const key = standardizeKey(walletAddress);
    
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
