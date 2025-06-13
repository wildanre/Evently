# Google OAuth Integration untuk Evently

## Setup Google OAuth Credentials

### 1. Buat Google Cloud Project
1. Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable Google+ API dan Google OAuth2 API

### 2. Setup OAuth Consent Screen
1. Pergi ke "APIs & Services > OAuth consent screen"
2. Pilih "External" user type
3. Isi informasi aplikasi:
   - App name: Evently
   - User support email: email Anda
   - Developer contact information: email Anda

### 3. Buat OAuth 2.0 Credentials
1. Pergi ke "APIs & Services > Credentials"
2. Klik "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "Evently Backend"
5. Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### 4. Update Environment Variables
Update file `.env` dengan credentials yang didapat:

```env
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
```

## Backend Implementation

Backend sudah siap dengan endpoints berikut:

### OAuth Endpoints
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/google/url` - Get OAuth URL for frontend

### Regular Auth Endpoints (tetap tersedia)
- `POST /api/auth/register` - Regular registration
- `POST /api/auth/login` - Regular login

## Frontend Implementation

### 1. Install Dependencies (jika belum ada)
```bash
cd evently-frontend
npm install
```

### 2. Buat Google OAuth Button Component
Buat file `src/components/auth/GoogleOAuthButton.tsx`:

```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface GoogleOAuthButtonProps {
  mode: 'login' | 'register';
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ mode }) => {
  const handleGoogleAuth = async () => {
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = 'http://localhost:3001/api/auth/google';
    } catch (error) {
      console.error('Google OAuth error:', error);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      className="w-full flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
    </Button>
  );
};
```

### 3. Buat OAuth Callback Page
Buat file `src/app/auth/callback/page.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      router.push('/login?error=' + error);
      return;
    }

    if (token && user) {
      // Save token and user data to localStorage or context
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      
      // Redirect to dashboard or home page
      router.push('/dashboard');
    } else {
      router.push('/login?error=missing_data');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
}
```

### 4. Update Login Page
Update file login page untuk include Google OAuth:

```tsx
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Login to Evently</h1>
      
      {/* Google OAuth Button */}
      <GoogleOAuthButton mode="login" />
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
      </div>
      
      {/* Regular login form */}
      <form className="mt-6">
        {/* Email dan password fields */}
      </form>
    </div>
  );
}
```

### 5. Update Register Page
Similar untuk register page, tambahkan GoogleOAuthButton dengan mode="register".

## Testing

### 1. Start Backend
```bash
cd evently-backend
pnpm dev
```

### 2. Start Frontend
```bash
cd evently-frontend
npm run dev
```

### 3. Test OAuth Flow
1. Buka http://localhost:3000/login
2. Klik "Continue with Google"
3. Login dengan Google account
4. Harus redirect ke callback page dan kemudian ke dashboard

## Production Deployment

### 1. Update Environment Variables
```env
GOOGLE_CALLBACK_URL="https://yourdomain.com/api/auth/google/callback"
FRONTEND_URL="https://yourfrontend.com"
```

### 2. Update Google OAuth Settings
- Tambahkan production URLs di Google Cloud Console
- Update authorized redirect URIs

### 3. HTTPS Required
Google OAuth memerlukan HTTPS di production.

## Security Notes

1. **Never expose Google Client Secret** di frontend
2. **Use HTTPS** di production
3. **Validate tokens** di backend
4. **Implement proper session management**
5. **Handle errors gracefully**

## Troubleshooting

### Common Issues:
1. **redirect_uri_mismatch**: Pastikan callback URL sama persis dengan yang di Google Console
2. **invalid_client**: Periksa Client ID dan Secret
3. **unauthorized_client**: Pastikan OAuth consent screen sudah di-setup
4. **CORS issues**: Pastikan CORS settings benar di backend

### Debug Steps:
1. Check browser network tab untuk error messages
2. Check backend logs
3. Verify environment variables
4. Test OAuth flow step by step
