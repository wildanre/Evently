"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push('/events');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await loginUser(form);
      login(response.token, response.user);
      toast.success('Login successful!');
      router.push('/events');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo-white.png"
              alt="Evently Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your Evently account</p>
        </div>

        <Card className="p-6 space-y-6">
          <GoogleOAuthButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-foreground hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

