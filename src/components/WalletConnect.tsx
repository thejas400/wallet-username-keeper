
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { LockKeyhole, Wallet, LogOut } from 'lucide-react';

export const WalletConnect = () => {
  const { address, isConnecting, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in">
      {!address ? (
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="w-full px-8 py-6 text-lg rounded-xl button-hover transition-all duration-300 bg-primary/90 hover:bg-primary"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-2 w-full">
          <div className="glass p-4 rounded-xl w-full flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              <span className="font-medium">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={disconnectWallet}
              className="h-9 w-9 rounded-full hover:bg-red-100 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
