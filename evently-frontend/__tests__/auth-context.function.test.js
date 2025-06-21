/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Test component to access auth context
const TestComponent = () => {
  const { user, isLoading, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test-token', { 
          id: '1', 
          name: 'Test User', 
          email: 'test@example.com' 
        })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('AuthProvider', () => {
    it('should provide initial state with no user', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
    });

    it('should restore user from localStorage on initialization', async () => {
      const mockUserData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'stored-token';
        if (key === 'user_data') return JSON.stringify(mockUserData);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-email')).toHaveTextContent('john@example.com');
    });

    it('should handle corrupted user data in localStorage', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'stored-token';
        if (key === 'user_data') return 'invalid-json';
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_data');
      expect(console.error).toHaveBeenCalledWith('Error parsing user data:', expect.any(SyntaxError));
    });

    it('should handle login correctly', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      const loginBtn = screen.getByTestId('login-btn');
      
      act(() => {
        loginBtn.click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify({ id: '1', name: 'Test User', email: 'test@example.com' })
      );

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('should handle logout correctly', async () => {
      // First login
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'stored-token';
        if (key === 'user_data') return JSON.stringify({ id: '1', name: 'John Doe', email: 'john@example.com' });
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Verify user is logged in
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

      const logoutBtn = screen.getByTestId('logout-btn');
      
      act(() => {
        logoutBtn.click();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_data');

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
    });

    it('should show loading state initially and then load', async () => {
      // Mock localStorage to return null initially
      mockLocalStorage.getItem.mockReturnValue(null);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for the loading state to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });
      
      // Should not be authenticated initially
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestComponentOutsideProvider = () => {
        useAuth();
        return <div>Test</div>;
      };

      // Suppress the error boundary error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });

    it('should provide all required context values', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Check that all required methods and properties are available
      expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
      expect(screen.getByTestId('authenticated')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
  });

  describe('Authentication state management', () => {
    it('should correctly determine isAuthenticated based on user presence', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Initially not authenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

      // Login
      const loginBtn = screen.getByTestId('login-btn');
      act(() => {
        loginBtn.click();
      });

      // Now authenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

      // Logout
      const logoutBtn = screen.getByTestId('logout-btn');
      act(() => {
        logoutBtn.click();
      });

      // No longer authenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('should handle user with optional fields', async () => {
      const mockUserWithOptionalFields = {
        id: '123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        bio: 'Test bio'
      };

      // Create a custom TestComponent that uses the mock data
      const TestComponentWithOptionalFields = () => {
        const { user, isLoading, login, logout, isAuthenticated } = useAuth();
        
        return (
          <div>
            <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-name">{user?.name || 'no-user'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
            <div data-testid="user-bio">{user?.bio || 'no-bio'}</div>
            <div data-testid="user-profile-image">{user?.profileImageUrl || 'no-image'}</div>
            <button 
              data-testid="login-btn" 
              onClick={() => login('test-token', mockUserWithOptionalFields)}
            >
              Login
            </button>
            <button data-testid="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithOptionalFields />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Login with optional fields
      act(() => {
        screen.getByTestId('login-btn').click();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jane Doe');
      expect(screen.getByTestId('user-email')).toHaveTextContent('jane@example.com');
      expect(screen.getByTestId('user-bio')).toHaveTextContent('Test bio');
      expect(screen.getByTestId('user-profile-image')).toHaveTextContent('https://example.com/profile.jpg');
    });
  });
});
