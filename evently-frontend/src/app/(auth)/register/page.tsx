"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/events');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await registerUser(form);
      login(response.token, response.user);
      toast.success('Registration successful!');
      router.push('/events');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
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
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground">Join Evently to discover and create amazing events</p>
        </div>

        {/* Register Form */}
        <Card className="p-6 space-y-6">
          {/* Google OAuth */}
          <GoogleOAuthButton />
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
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
                placeholder="Create a password (min. 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </Card>
        
        {/* Terms */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

