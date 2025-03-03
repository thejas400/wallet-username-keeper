
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check localStorage for a previously connected wallet
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (accounts.length > 0) {
            const connectedAddress = accounts[0];
            setAddress(connectedAddress);
            localStorage.setItem('walletAddress', connectedAddress);
            
            // Subscribe to account changes
            window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
              if (newAccounts.length === 0) {
                disconnectWallet();
              } else {
                setAddress(newAccounts[0]);
                localStorage.setItem('walletAddress', newAccounts[0]);
              }
            });
            
            toast.success('Wallet connected successfully');
          }
        } catch (error) {
          console.error('Error connecting wallet:', error);
          toast.error('Failed to connect wallet');
        }
      } else {
        toast.error('MetaMask not installed. Please install MetaMask to connect.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    localStorage.removeItem('walletAddress');
    toast.info('Wallet disconnected');
  };

  return (
    <WalletContext.Provider value={{ address, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// Add Ethereum to the window object for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
