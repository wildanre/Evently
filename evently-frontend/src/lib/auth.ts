const API_BASE_URL = "https://evently-backend-amber.vercel.app/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
    bio?: string;
  };
  token: string;
}

// Regular login
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

// Regular registration
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

// Get Google OAuth URL
export async function getGoogleAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/google/url`);
  
  if (!response.ok) {
    throw new Error('Failed to get Google auth URL');
  }
  
  const data = await response.json();
  return data.url;
}

// Initiate Google OAuth
export function initiateGoogleOAuth(): void {
  const googleAuthUrl = `${API_BASE_URL}/auth/google`;
  window.location.href = googleAuthUrl;
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Create authorized headers for API requests
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

