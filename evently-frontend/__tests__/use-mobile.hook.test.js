/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../src/hooks/use-mobile';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('useIsMobile Hook', () => {
  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    jest.clearAllMocks();
  });

  it('should return false for desktop width', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Should return false for desktop
    expect(result.current).toBe(false);
  });

  it('should return true for mobile width', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Should return true for mobile
    expect(result.current).toBe(true);
  });

  it('should return true for width exactly at breakpoint boundary', () => {
    // Set width at 767px (mobile breakpoint is < 768)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Should return true for width at boundary
    expect(result.current).toBe(true);
  });

  it('should return false for width at desktop breakpoint', () => {
    // Set width at 768px (desktop breakpoint is >= 768)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Should return false for desktop width
    expect(result.current).toBe(false);
  });

  it('should set up media query listener', () => {
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();
    
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }));

    const { unmount } = renderHook(() => useIsMobile());

    // Should set up media query listener
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    // Should clean up listener on unmount
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle media query changes', () => {
    let mediaQueryCallback;
    const mockAddEventListener = jest.fn((event, callback) => {
      if (event === 'change') {
        mediaQueryCallback = callback;
      }
    });

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
    }));

    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Initially should be false (desktop)
    expect(result.current).toBe(false);

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      
      // Trigger the media query change callback
      if (mediaQueryCallback) {
        mediaQueryCallback();
      }
    });

    // Should now return true (mobile)
    expect(result.current).toBe(true);
  });
});
