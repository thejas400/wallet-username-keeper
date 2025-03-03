
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
    const encryptedData = localStorage.getItem(`credentials_${walletAddress}`);
    
    if (!encryptedData) {
      return [];
    }
    
    const decryptedData = decryptData(encryptedData, walletAddress);
    return JSON.parse(decryptedData);
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
    // Get existing credentials
    const credentials = getCredentials(walletAddress);
    
    // Check if credential for this platform already exists
    const existingCredentialIndex = credentials.findIndex(
      (cred) => cred.platform === credential.platform
    );
    
    if (existingCredentialIndex >= 0) {
      return null; // Credential for this platform already exists
    }
    
    // Create new credential with ID
    const newCredential: CredentialEntry = {
      ...credential,
      id: `${credential.platform}_${Date.now()}`
    };
    
    // Add new credential
    const updatedCredentials = [...credentials, newCredential];
    
    // Encrypt and save
    const dataToEncrypt = JSON.stringify(updatedCredentials);
    const encryptedData = encryptData(dataToEncrypt, walletAddress);
    
    localStorage.setItem(`credentials_${walletAddress}`, encryptedData);
    
    return newCredential;
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
  const credentials = getCredentials(walletAddress);
  return credentials.some((cred) => cred.platform === platform);
};
