
// This is a simplified version of the encryption.ts file
// adapted for use in the Chrome extension

/**
 * Standardizes the encryption key to ensure consistent encryption/decryption
 * Uses consistent hashing to create a reliable key from wallet address
 */
function standardizeKey(walletAddress) {
  if (!walletAddress) {
    throw new Error('Wallet address must be provided for key generation');
  }
  
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
 * Gets all credentials for a wallet address from localStorage
 */
function getCredentials(walletAddress) {
  try {
    if (!walletAddress) {
      console.error('No wallet address provided for credential retrieval');
      return [];
    }
    
    // Normalize wallet address for consistent storage key
    const normalizedWalletAddress = walletAddress.toLowerCase().trim();
    const encryptedData = localStorage.getItem(`credentials_${normalizedWalletAddress}`);
    
    if (!encryptedData) {
      console.log('No credentials found for wallet');
      return [];
    }
    
    try {
      // For the extension, we're using a different decryption method
      // Here we just decode the JSON directly since we're not encrypting in the extension
      return JSON.parse(encryptedData);
    } catch (error) {
      console.error('Failed to parse credentials:', error);
      return [];
    }
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return [];
  }
}

/**
 * Checks if a credential exists for a platform
 */
function hasCredentialForPlatform(walletAddress, platform) {
  if (!walletAddress) return false;
  
  // First try to get credentials using extension's simplified approach
  try {
    const normalizedWalletAddress = walletAddress.toLowerCase().trim();
    const storedWalletAddress = localStorage.getItem('ext_wallet_address');
    
    if (storedWalletAddress === normalizedWalletAddress) {
      const credentials = getCredentials(normalizedWalletAddress);
      return credentials.some((cred) => cred.platform === platform);
    }
  } catch (err) {
    console.error('Extension credential check failed:', err);
  }
  
  // Fallback: check if the platform specific key exists
  return localStorage.getItem(`credential_${walletAddress}_${platform}`) !== null;
}

/**
 * Updates extension status badges for platforms
 */
function updatePlatformStatus(walletAddress) {
  if (!walletAddress) return;
  
  const platforms = ['instagram', 'discord', 'linkedin'];
  
  platforms.forEach(platform => {
    const hasCredential = hasCredentialForPlatform(walletAddress, platform);
    const statusElement = document.getElementById(`${platform}-status`);
    
    if (statusElement) {
      statusElement.textContent = hasCredential ? 'Registered' : 'Not Registered';
      statusElement.className = `platform-status ${hasCredential ? 'status-registered' : 'status-not-registered'}`;
    }
  });
}

// Export functions for use in other extension scripts
window.extensionUtils = {
  standardizeKey,
  encryptData,
  decryptData,
  getCredentials,
  hasCredentialForPlatform,
  updatePlatformStatus
};
