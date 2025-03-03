
import CryptoJS from 'crypto-js';

/**
 * Standardizes the encryption key to ensure consistent encryption/decryption
 * Uses consistent hashing to create a reliable key from wallet address
 */
const standardizeKey = (walletAddress: string): string => {
  // Make sure we're using a lowercase wallet address to avoid case sensitivity issues
  const normalizedAddress = walletAddress.toLowerCase().trim();
  
  // Create a consistent key by double hashing the wallet address
  // This ensures that the key is always the same length and format
  return CryptoJS.SHA256(normalizedAddress).toString();
};

/**
 * Encrypts data using AES with the wallet address as key
 */
export const encryptData = (data: string, walletAddress: string): string => {
  if (!data || !walletAddress) {
    throw new Error('Data and wallet address must be provided for encryption');
  }
  
  try {
    // Use the standardized wallet address as the encryption key
    const key = standardizeKey(walletAddress);
    
    // Encrypt the data with AES
    const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
    
    return encryptedData;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts data using AES with the wallet address as key
 */
export const decryptData = (encryptedData: string, walletAddress: string): string => {
  if (!encryptedData || !walletAddress) {
    throw new Error('Encrypted data and wallet address must be provided for decryption');
  }
  
  try {
    // Use the standardized wallet address as the encryption key
    const key = standardizeKey(walletAddress);
    
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Decryption failed');
    }
    
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Checks if data can be properly decrypted with the provided wallet address
 * Used to validate credentials before saving
 */
export const testDecryption = (encryptedData: string, walletAddress: string): boolean => {
  try {
    const decryptedData = decryptData(encryptedData, walletAddress);
    return decryptedData !== null && decryptedData !== undefined && decryptedData !== '';
  } catch (error) {
    return false;
  }
};
