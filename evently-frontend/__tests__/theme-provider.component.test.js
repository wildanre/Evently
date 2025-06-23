/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../src/components/theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }) => (
    <div data-testid="theme-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )
}));

describe('ThemeProvider Component', () => {
  it('should render children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child-component">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toHaveTextContent('Test Content');
  });

  it('should pass props to NextThemesProvider', () => {
    const testProps = {
      attribute: 'class',
      defaultTheme: 'dark',
      enableSystem: true
    };

    render(
      <ThemeProvider {...testProps}>
        <div>Test</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();
    
    const passedProps = JSON.parse(themeProvider.getAttribute('data-props'));
    expect(passedProps).toMatchObject(testProps);
  });

  it('should render without props', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });
});
