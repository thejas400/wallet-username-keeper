
// This is a simplified version of the encryption.ts file
// adapted for use in the Chrome extension

/**
 * Standardizes the encryption key to ensure consistent encryption/decryption
 * Uses consistent hashing to create a reliable key from wallet address
 */
function standardizeKey(walletAddress) {
  // Ensure we're using a lowercase wallet address to avoid case sensitivity issues
  const normalizedAddress = walletAddress.toLowerCase().trim();
  
  // Since we can't use CryptoJS directly in content scripts,
  // we'll use a simpler approach for the extension
  // This is just a placeholder - in a real extension, you'd want to use 
  // a proper crypto library or the Web Crypto API
  
  // For demonstration, we'll use a simple hash
  let hash = 0;
  for (let i = 0; i < normalizedAddress.length; i++) {
    const char = normalizedAddress.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to string and pad to ensure consistent length
  let hashStr = Math.abs(hash).toString(16);
  while (hashStr.length < 32) {
    hashStr = '0' + hashStr;
  }
  
  return hashStr;
}

/**
 * Simple XOR encryption/decryption for demonstration
 * Note: In a real extension, use a proper crypto library
 */
function xorEncryptDecrypt(text, key) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Encrypts data using the wallet address as key
 */
function encryptData(data, walletAddress) {
  if (!data || !walletAddress) {
    throw new Error('Data and wallet address must be provided for encryption');
  }
  
  try {
    const key = standardizeKey(walletAddress);
    const encrypted = xorEncryptDecrypt(data, key);
    return btoa(encrypted); // Base64 encode for storage
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data using the wallet address as key
 */
function decryptData(encryptedData, walletAddress) {
  if (!encryptedData || !walletAddress) {
    throw new Error('Encrypted data and wallet address must be provided for decryption');
  }
  
  try {
    const key = standardizeKey(walletAddress);
    const decoded = atob(encryptedData); // Base64 decode
    const decrypted = xorEncryptDecrypt(decoded, key);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Checks if data can be properly decrypted with the provided wallet address
 */
function testDecryption(encryptedData, walletAddress) {
  try {
    const decryptedData = decryptData(encryptedData, walletAddress);
    return decryptedData !== null && decryptedData !== undefined && decryptedData !== '';
  } catch (error) {
    return false;
  }
}
