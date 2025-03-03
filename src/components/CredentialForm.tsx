
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { saveCredential } from '@/utils/storage';

type Platform = 'instagram' | 'discord' | 'linkedin';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface CredentialFormProps {
  platform: Platform;
  walletAddress: string;
  onCredentialSaved: () => void;
}

export const CredentialForm: React.FC<CredentialFormProps> = ({
  platform,
  walletAddress,
  onCredentialSaved,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      const result = saveCredential(walletAddress, {
        platform,
        username: data.username,
        password: data.password,
      });

      if (result) {
        toast.success(`Credentials saved for ${platform}`);
        onCredentialSaved();
      } else {
        toast.error(`Credentials for ${platform} already exist`);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Failed to save credentials');
    }
  };

  const platformNames = {
    instagram: 'Instagram',
    discord: 'Discord',
    linkedin: 'LinkedIn',
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="w-full space-y-4 animate-scale-in">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-medium">
          Register {platformNames[platform]} Credentials
        </h2>
        <p className="text-sm text-muted-foreground">
          Your credentials will be securely encrypted and stored
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      className="focus-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="focus-ring pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full button-hover"
              disabled={form.formState.isSubmitting}
            >
              <Lock className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? 'Encrypting...' : 'Encrypt & Save'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
