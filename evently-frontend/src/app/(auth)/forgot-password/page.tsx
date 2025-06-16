"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email!');
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/logo-white.png"
                alt="Evently Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div className="h-12 w-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent password reset instructions to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Try again
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-auto bg-gradient-to-b from-neutral-900 to-black text-white p-6">
      <div className='w-full h-full justify-center items-center flex'>
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
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
            <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !email}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending instructions...
                  </>
                ) : (
                  'Send reset instructions'
                )}
              </Button>
            </form>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-foreground hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

