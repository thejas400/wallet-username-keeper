
import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { PlatformSelector } from '@/components/PlatformSelector';
import { CredentialForm } from '@/components/CredentialForm';
import { Dashboard } from '@/components/Dashboard';
import { getCredentials } from '@/utils/storage';
import { Separator } from '@/components/ui/separator';

type Platform = 'instagram' | 'discord' | 'linkedin';

const MainApp = () => {
  const { address } = useWallet();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  
  // Reset selected platform when wallet changes
  useEffect(() => {
    setSelectedPlatform(null);
    
    if (address) {
      const credentials = getCredentials(address);
      setHasCredentials(credentials.length > 0);
    } else {
      setHasCredentials(false);
    }
  }, [address]);
  
  const handleCredentialSaved = () => {
    setSelectedPlatform(null);
    setHasCredentials(true);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="glass max-w-md w-full rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 animate-scale-in">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center space-x-2 mb-1">
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">Decentralized</span>
            </div>
            <h1 className="text-2xl font-bold">Secure Credentials Vault</h1>
            <p className="text-sm text-muted-foreground">
              Store your social platform credentials securely with wallet-based encryption
            </p>
          </div>
          
          <WalletConnect />
          
          {address && (
            <div className="space-y-6 pt-2">
              {selectedPlatform ? (
                <CredentialForm 
                  platform={selectedPlatform} 
                  walletAddress={address}
                  onCredentialSaved={handleCredentialSaved}
                />
              ) : (
                <>
                  <PlatformSelector
                    selectedPlatform={selectedPlatform}
                    onSelectPlatform={setSelectedPlatform}
                    walletAddress={address}
                  />
                  
                  {hasCredentials && (
                    <>
                      <Separator className="my-4" />
                      <Dashboard walletAddress={address} />
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-secondary/50 px-8 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Your credentials are encrypted and can only be decrypted with your wallet
          </p>
        </div>
      </div>
      
      <div className="text-center mt-6 text-xs text-muted-foreground">
        <p>Connect your wallet to get started • Fully decentralized</p>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <WalletProvider>
      <MainApp />
    </WalletProvider>
  );
};

export default Index;
