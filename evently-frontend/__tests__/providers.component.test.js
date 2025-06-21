/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Providers from '../src/components/providers';

// Mock the dependencies
jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}));

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  )
}));

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }) => (
    <div data-testid="theme-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )
}));

describe('Providers Component', () => {
  it('should render all providers with children', () => {
    render(
      <Providers>
        <div data-testid="app-content">App Content</div>
      </Providers>
    );

    // Check if all providers are rendered
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('should configure ThemeProvider with correct props', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    const props = JSON.parse(themeProvider.getAttribute('data-props'));

    expect(props).toEqual({
      attribute: 'class',
      defaultTheme: 'dark',
      enableSystem: true,
      disableTransitionOnChange: true
    });
  });

  it('should render providers in correct hierarchy', () => {
    render(
      <Providers>
        <div data-testid="child">Child Content</div>
      </Providers>
    );

    // ThemeProvider should contain AuthProvider
    const themeProvider = screen.getByTestId('theme-provider');
    const authProvider = screen.getByTestId('auth-provider');
    const child = screen.getByTestId('child');

    expect(themeProvider).toContainElement(authProvider);
    expect(authProvider).toContainElement(child);
    expect(themeProvider).toContainElement(screen.getByTestId('toaster'));
  });

  it('should render without children', () => {
    render(<Providers />);

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
