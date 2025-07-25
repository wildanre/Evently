"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

function AuthCallbackContent() {
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (error) {
          setErrorMessage(getErrorMessage(error));
          setStatus('error');
          return;
        }

        if (!token || !userParam) {
          setErrorMessage('Missing authentication data');
          setStatus('error');
          return;
        }

        const userData = JSON.parse(decodeURIComponent(userParam));
        
        login(token, userData);
        setStatus('success');
        
        setTimeout(() => {
          window.location.href = '/events';
        }, 1500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setErrorMessage('Failed to process authentication');
        setStatus('error');
      }
    };

    processCallback();
  }, [login]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'oauth_failed':
        return 'Google OAuth authentication failed';
      case 'callback_failed':
        return 'Authentication callback failed';
      case 'no_user':
        return 'No user data received';
      default:
        return 'Authentication failed';
    }
  };

  const handleRetry = () => {
    window.location.href = '/events';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Completing authentication...</h2>
          <p className="text-muted-foreground">Please wait while we sign you in.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-600">Authentication successful!</h2>
          <p className="text-muted-foreground">Redirecting you to the events page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="h-8 w-8 mx-auto bg-red-500 rounded-full flex items-center justify-center">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-600">Authentication failed</h2>
        <p className="text-muted-foreground">{errorMessage}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Return to Events
        </button>
      </div>
    </div>
  );
}

function AuthCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we process your authentication.</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

