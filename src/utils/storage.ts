
import { encryptData, decryptData } from './encryption';

export interface Credential {
  platform: 'instagram' | 'discord' | 'linkedin';
  username: string;
  password: string;
}

export interface CredentialEntry extends Credential {
  id: string;
}

/**
 * Gets all credentials for a wallet address
 */
export const getCredentials = (walletAddress: string): CredentialEntry[] => {
  try {
    if (!walletAddress) {
      console.error('No wallet address provided for credential retrieval');
      return [];
    }
    
    // Normalize wallet address for consistent storage key
    const normalizedWalletAddress = walletAddress.toLowerCase().trim();
    const encryptedData = localStorage.getItem(`credentials_${normalizedWalletAddress}`);
    
    if (!encryptedData) {
      console.log('No credentials found for wallet:', 
        `${normalizedWalletAddress.substring(0, 6)}...${normalizedWalletAddress.substring(normalizedWalletAddress.length - 4)}`);
      return [];
    }
    
    try {
      // Attempt to decrypt the data
      const decryptedData = decryptData(encryptedData, normalizedWalletAddress);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      // If decryption fails, try with the original non-normalized wallet address as fallback
      // This handles the case where credentials were saved with non-normalized address
      const fallbackEncryptedData = localStorage.getItem(`credentials_${walletAddress}`);
      if (fallbackEncryptedData && fallbackEncryptedData !== encryptedData) {
        try {
          const fallbackDecryptedData = decryptData(fallbackEncryptedData, walletAddress);
          return JSON.parse(fallbackDecryptedData);
        } catch (fallbackError) {
          console.error('Fallback decryption also failed:', fallbackError);
        }
      }
      return [];
    }
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return [];
  }
};

/**
 * Saves a credential for a wallet address
 */
export const saveCredential = (
  walletAddress: string, 
  credential: Credential
): CredentialEntry | null => {
  try {
    if (!walletAddress) {
      console.error('No wallet address provided for credential saving');
      return null;
    }
    
    // Normalize wallet address for consistent storage
    const normalizedWalletAddress = walletAddress.toLowerCase().trim();
    
    // Get existing credentials
    const credentials = getCredentials(normalizedWalletAddress);
    
    // Check if credential for this platform already exists
    const existingCredentialIndex = credentials.findIndex(
      (cred) => cred.platform === credential.platform
    );
    
    if (existingCredentialIndex >= 0) {
      console.log(`Credential for ${credential.platform} already exists`);
      return null; // Credential for this platform already exists
    }
    
    // Create new credential with ID
    const newCredential: CredentialEntry = {
      ...credential,
      id: `${credential.platform}_${Date.now()}`
    };
    
    // Password should be a string, encrypt it
    const passwordToEncrypt = typeof credential.password === 'string' 
      ? credential.password 
      : JSON.stringify(credential.password);
    
    // Encrypt the password
    const encryptedPassword = encryptData(passwordToEncrypt, normalizedWalletAddress);
    
    // Update the new credential with the encrypted password
    const secureCredential: CredentialEntry = {
      ...newCredential,
      password: encryptedPassword
    };
    
    // Add new credential
    const updatedCredentials = [...credentials, secureCredential];
    
    // Encrypt and save
    const dataToEncrypt = JSON.stringify(updatedCredentials);
    const encryptedData = encryptData(dataToEncrypt, normalizedWalletAddress);
    
    localStorage.setItem(`credentials_${normalizedWalletAddress}`, encryptedData);
    console.log(`Credential for ${credential.platform} saved successfully`);
    
    return secureCredential;
  } catch (error) {
    console.error('Error saving credential:', error);
    return null;
  }
};

/**
 * Checks if a credential exists for a platform
 */
export const hasCredentialForPlatform = (
  walletAddress: string,
  platform: string
): boolean => {
  if (!walletAddress) return false;
  
  // Normalize wallet address for consistent checking
  const normalizedWalletAddress = walletAddress.toLowerCase().trim();
  const credentials = getCredentials(normalizedWalletAddress);
  
  const hasCredential = credentials.some((cred) => cred.platform === platform);
  console.log(`Platform ${platform} credential check:`, hasCredential ? 'Exists' : 'Not found');
  
  return hasCredential;
};

/**
 * Updates browser extension's local storage with the same credentials
 * This allows the extension to access the same credentials
 */
export const syncCredentialsWithExtension = (walletAddress: string): void => {
  if (!walletAddress) return;
  
  try {
    const normalizedWalletAddress = walletAddress.toLowerCase().trim();
    const credentials = getCredentials(normalizedWalletAddress);
    
    if (credentials.length > 0) {
      // Create a special key for the extension
      localStorage.setItem('ext_wallet_address', normalizedWalletAddress);
      console.log('Synced credentials with extension');
    }
  } catch (error) {
    console.error('Failed to sync credentials with extension:', error);
  }
};
