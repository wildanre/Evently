# Google OAuth Backend Configuration - Evently

## Overview
Backend Evently sudah dikonfigurasi dengan Google OAuth untuk authentication. Berikut adalah dokumentasi lengkap konfigurasi backend.

## Struktur File Google OAuth

### 1. Dependencies (package.json)
```json
{
  "dependencies": {
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "express-session": "^1.18.1"
  },
  "devDependencies": {
    "@types/passport": "^1.0.17",
    "@types/passport-google-oauth20": "^2.0.16",
    "@types/express-session": "^1.18.2"
  }
}
```

### 2. Konfigurasi Passport (/src/config/passport.ts)
- Strategy untuk Google OAuth20
- Serialize/deserialize user untuk session
- Automatic user creation jika belum ada di database
- Handling profile image dari Google

### 3. Environment Variables (.env)
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here" 
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Session Secret
SESSION_SECRET="your-session-secret-here-change-this-in-production"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

### 4. Server Configuration (src/index.ts)
- Express session middleware
- Passport initialization dan session
- CORS dengan credentials enabled

### 5. Auth Routes (src/routes/authRoutes.ts)
- `/api/auth/google` - Initiate Google OAuth
- `/api/auth/google/callback` - Handle Google OAuth callback
- `/api/auth/google/url` - Get Google OAuth URL

## API Endpoints untuk Google OAuth

### 1. Initiate Google OAuth
```
GET /api/auth/google
```
- Redirect user ke Google untuk authentication
- Scope: profile, email

### 2. Google OAuth Callback
```
GET /api/auth/google/callback
```
- Handle callback dari Google
- Create/find user di database
- Generate JWT token
- Redirect ke frontend dengan token

### 3. Get Google OAuth URL
```
GET /api/auth/google/url
```
Response:
```json
{
  "url": "http://localhost:3001/api/auth/google"
}
```

## Setup Langkah-langkah

### 1. Google Console Setup
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project existing
3. Enable Google+ API
4. Buat OAuth 2.0 credentials
5. Set authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://your-domain.com/api/auth/google/callback` (production)

### 2. Environment Configuration
1. Copy Client ID dan Client Secret dari Google Console
2. Update `.env` file dengan credentials yang benar
3. Set SESSION_SECRET dengan random string yang aman
4. Set FRONTEND_URL sesuai dengan URL frontend Anda

### 3. Database Schema
User model sudah support Google OAuth:
- `password` field adalah nullable (untuk Google OAuth users)
- `profileImageUrl` untuk menyimpan foto profil dari Google

### 4. Testing
1. Start backend: `pnpm dev`
2. Test endpoint: `GET http://localhost:3001/api/auth/google/url`
3. Kunjungi URL yang dikembalikan untuk test OAuth flow

## Flow Authentication

### Google OAuth Flow:
1. User click "Login with Google" di frontend
2. Frontend redirect ke `/api/auth/google`
3. Backend redirect user ke Google OAuth
4. User authorize di Google
5. Google callback ke `/api/auth/google/callback`
6. Backend:
   - Receive user data dari Google
   - Create/find user di database
   - Generate JWT token
   - Redirect ke frontend dengan token
7. Frontend handle token dan set authentication

### Regular Login Flow:
1. User submit email/password
2. Backend validate credentials
3. Return JWT token
4. Frontend store token

## Security Features

### 1. Session Security
- Secure cookies di production
- Session expiry (24 hours)
- CSRF protection via SameSite cookies

### 2. JWT Security
- 7 days expiry
- Contains user ID dan email
- Signed dengan JWT_SECRET

### 3. Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents brute force attacks

### 4. CORS Configuration
- Specific origin allowed
- Credentials enabled untuk cookies
- Preflight requests handled

## Error Handling

### OAuth Errors:
- Failed OAuth → Redirect ke `/login?error=oauth_failed`
- Callback error → Redirect ke `/login?error=callback_failed`
- Database error → Internal server error

### Regular Auth Errors:
- Invalid credentials → 401 Unauthorized
- User already exists → 400 Bad Request
- Validation errors → 400 with error details

## Production Considerations

### 1. Environment Variables
- Set secure JWT_SECRET dan SESSION_SECRET
- Use production Google OAuth credentials
- Set production FRONTEND_URL
- Enable HTTPS untuk secure cookies

### 2. Database
- Ensure database dapat handle concurrent connections
- Setup proper indexes untuk user lookup
- Consider connection pooling

### 3. Security Headers
- Helmet middleware sudah configured
- Consider additional security headers
- Setup proper CORS untuk production domain

## Monitoring & Logs
- OAuth errors logged ke console
- Authentication attempts tracked
- Consider proper logging service untuk production

## API Documentation Summary

Base URL: `http://localhost:3001/api`

### Authentication Endpoints:
- `POST /auth/register` - Regular registration
- `POST /auth/login` - Regular login
- `GET /auth/google` - Google OAuth initiate
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/google/url` - Get Google OAuth URL

### Protected Endpoints:
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- Dan lainnya...

## Status Konfigurasi
✅ Dependencies installed
✅ Passport configuration
✅ Google OAuth strategy
✅ Session management
✅ Auth routes
✅ Environment variables template
✅ Error handling
✅ Security middleware

Backend siap untuk Google OAuth authentication!
