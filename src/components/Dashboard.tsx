
import React, { useState } from 'react';
import { CredentialEntry, getCredentials } from '@/utils/storage';
import { decryptData } from '@/utils/encryption';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  walletAddress: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
  const [credentials, setCredentials] = useState<CredentialEntry[]>(() => 
    getCredentials(walletAddress)
  );
  
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedFields, setCopiedFields] = useState<Record<string, string>>({});
  const [decryptionErrors, setDecryptionErrors] = useState<Record<string, boolean>>({});
  
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const getDecryptedPassword = (credential: CredentialEntry): string => {
    try {
      const decryptedPassword = decryptData(credential.password, walletAddress);
      
      // Clear any previous error for this credential
      if (decryptionErrors[credential.id]) {
        setDecryptionErrors(prev => {
          const updated = { ...prev };
          delete updated[credential.id];
          return updated;
        });
      }
      
      return decryptedPassword;
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      
      // Mark this credential as having a decryption error
      if (!decryptionErrors[credential.id]) {
        setDecryptionErrors(prev => ({
          ...prev,
          [credential.id]: true
        }));
      }
      
      return '*** DECRYPTION ERROR ***';
    }
  };
  
  const copyToClipboard = (text: string, id: string, field: string) => {
    if (text === '*** DECRYPTION ERROR ***') {
      toast.error('Cannot copy decryption error');
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedFields({ ...copiedFields, [id]: field });
        toast.success(`${field} copied to clipboard`);
        
        // Reset the copied status after 2 seconds
        setTimeout(() => {
          setCopiedFields(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
        }, 2000);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };
  
  const platformIcons: Record<string, { icon: string, bgColor: string }> = {
    instagram: {
      icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      bgColor: 'bg-gradient-to-tr from-purple-500 to-pink-500'
    },
    discord: {
      icon: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
      bgColor: 'bg-[#5865F2]'
    },
    linkedin: {
      icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
      bgColor: 'bg-[#0077B5]'
    }
  };
  
  if (credentials.length === 0) {
    return (
      <div className="py-8 text-center space-y-4 animate-fade-in">
        <h2 className="text-lg font-medium">No Credentials Saved</h2>
        <p className="text-sm text-muted-foreground">
          Select a platform and register your credentials
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-blur-in">
      <h2 className="text-xl font-medium text-center">Your Saved Credentials</h2>
      
      <div className="space-y-4">
        {credentials.map((credential) => {
          const isPasswordVisible = visiblePasswords[credential.id] || false;
          const decryptedPassword = isPasswordVisible ? getDecryptedPassword(credential) : '••••••••';
          const hasDecryptionError = decryptedPassword === '*** DECRYPTION ERROR ***';
          const platformInfo = platformIcons[credential.platform] || { icon: '', bgColor: 'bg-gray-500' };
          
          return (
            <Card key={credential.id} className="overflow-hidden transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${platformInfo.bgColor} flex items-center justify-center`}>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="white"
                      className="w-5 h-5"
                    >
                      <path d={platformInfo.icon} />
                    </svg>
                  </div>
                  
                  <div className="flex-grow space-y-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium capitalize">{credential.platform}</div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col space-y-2 flex-grow">
                          <div className="relative group">
                            <div className="text-xs text-muted-foreground mb-1">Username</div>
                            <div className="flex items-center space-x-2">
                              <div className="font-mono text-sm bg-secondary/50 py-1 px-3 rounded-md flex-grow">
                                {credential.username}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full"
                                onClick={() => copyToClipboard(credential.username, credential.id, 'Username')}
                              >
                                {copiedFields[credential.id] === 'Username' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <div className="text-xs text-muted-foreground mb-1">Password</div>
                            <div className="flex items-center space-x-2">
                              <div className={`font-mono text-sm bg-secondary/50 py-1 px-3 rounded-md flex-grow ${hasDecryptionError ? 'text-red-500' : ''}`}>
                                {decryptedPassword}
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => togglePasswordVisibility(credential.id)}
                                >
                                  {isPasswordVisible ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                {isPasswordVisible && !hasDecryptionError && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => copyToClipboard(decryptedPassword, credential.id, 'Password')}
                                  >
                                    {copiedFields[credential.id] === 'Password' ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                
                                {hasDecryptionError && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full text-red-500"
                                    onClick={() => toast.error('Unable to decrypt password. Try reconnecting your wallet.')}
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
