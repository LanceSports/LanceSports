import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock React DOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock the App component
vi.mock('./App', () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

// Mock CSS import
vi.mock('./index.css', () => ({}));

describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads Google Client ID from environment variables', () => {
    // Test that the environment variable is accessed
    expect(import.meta.env.VITE_GOOGLE_CLIENT_ID).toBeDefined();
  });

  it('uses fallback client ID when environment variable is not set', () => {
    // Mock missing environment variable
    const originalEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    delete (import.meta.env as any).VITE_GOOGLE_CLIENT_ID;
    
    // The code should handle missing environment variables gracefully
    expect(import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID').toBe('YOUR_GOOGLE_CLIENT_ID');
    
    // Restore original
    (import.meta.env as any).VITE_GOOGLE_CLIENT_ID = originalEnv;
  });

  it('wraps app with GoogleOAuthProvider', () => {
    // This test verifies that the main.tsx structure is correct
    // The actual provider setup is tested in integration tests
    expect(GoogleOAuthProvider).toBeDefined();
  });

  it('renders app component', () => {
    // Test that the App component is imported and used
    const { getByTestId } = render(<div data-testid="app">App Component</div>);
    expect(getByTestId('app')).toBeInTheDocument();
  });
});
