/**
 * @jest-environment jsdom
 */

import { 
  loginUser, 
  registerUser, 
  getGoogleAuthUrl, 
  initiateGoogleOAuth,
  getAuthToken,
  getAuthHeaders
} from '../src/lib/auth';

// Mock fetch globally
global.fetch = jest.fn();

// Mock window and localStorage
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// Mock environment variable
const mockApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

describe('Auth Functions', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.localStorage.getItem.mockClear();
    window.localStorage.setItem.mockClear();
    window.location.href = '';
  });

  describe('loginUser', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        message: 'Login successful',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        token: 'mock-token'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const result = await loginUser(loginData);

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid credentials', async () => {
      const mockError = { error: 'Invalid credentials' };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      });

      const loginData = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw generic error when no error message provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password'
      };

      await expect(loginUser(loginData)).rejects.toThrow('Login failed');
    });
  });

  describe('registerUser', () => {
    it('should successfully register with valid data', async () => {
      const mockResponse = {
        message: 'Registration successful',
        user: {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com'
        },
        token: 'mock-token-2'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const registerData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      const result = await registerUser(registerData);

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerData)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on registration failure', async () => {
      const mockError = { error: 'Email already exists' };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      });

      const registerData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      await expect(registerUser(registerData)).rejects.toThrow('Email already exists');
    });

    it('should throw generic error when no error message provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password'
      };

      await expect(registerUser(registerData)).rejects.toThrow('Registration failed');
    });
  });

  describe('getGoogleAuthUrl', () => {
    it('should return Google auth URL successfully', async () => {
      const mockResponse = {
        url: 'https://accounts.google.com/oauth/authorize?...'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getGoogleAuthUrl();

      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/auth/google/url`
      );
      expect(result).toBe(mockResponse.url);
    });

    it('should throw error when request fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      await expect(getGoogleAuthUrl()).rejects.toThrow('Failed to get Google auth URL');
    });
  });

  describe('initiateGoogleOAuth', () => {
    it('should redirect to Google OAuth URL', () => {
      initiateGoogleOAuth();

      expect(window.location.href).toBe(
        `${mockApiBaseUrl}/auth/google`
      );
    });
  });

  describe('getAuthToken', () => {
    it('should return token from localStorage', () => {
      const mockToken = 'mock-auth-token';
      window.localStorage.getItem.mockReturnValue(mockToken);

      const result = getAuthToken();

      expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(result).toBe(mockToken);
    });

    it('should return null when no token exists', () => {
      window.localStorage.getItem.mockReturnValue(null);

      const result = getAuthToken();

      expect(result).toBeNull();
    });

    it('should return null in server-side environment', () => {
      // Mock server-side environment
      const originalWindow = global.window;
      delete global.window;

      const result = getAuthToken();

      expect(result).toBeNull();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers with Authorization when token exists', () => {
      const mockToken = 'mock-auth-token';
      window.localStorage.getItem.mockReturnValue(mockToken);

      const result = getAuthHeaders();

      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('should return headers without Authorization when no token', () => {
      window.localStorage.getItem.mockReturnValue(null);

      const result = getAuthHeaders();

      expect(result).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });
});
