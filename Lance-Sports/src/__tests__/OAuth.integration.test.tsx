import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import App from '../App';

// Mock the Google OAuth hook
vi.mock('@react-oauth/google', async () => {
  const actual = await vi.importActual('@react-oauth/google');
  return {
    ...actual,
    useGoogleLogin: vi.fn(),
  };
});

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(),
      select: vi.fn(),
    })),
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

const mockUseGoogleLogin = useGoogleLogin as vi.MockedFunction<typeof useGoogleLogin>;
const mockSupabase = supabase as vi.Mocked<typeof supabase>;

describe('Google OAuth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGoogleLogin.mockReturnValue(vi.fn());
  });

  it('completes full OAuth flow successfully', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    // Mock successful Google OAuth response
    const mockGoogleResponse = {
      access_token: 'mock-access-token-123',
    };

    // Mock successful user info fetch
    const mockUserInfo = {
      sub: 'google-user-id-456',
      name: 'Jane Smith',
      email: 'jane@example.com',
      picture: 'https://example.com/jane-avatar.jpg',
    };

    // Mock successful Supabase upsert
    const mockSupabaseResponse = {
      data: { id: 'user-789' },
      error: null,
    };

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue(mockSupabaseResponse),
    } as any);

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    // Verify initial state shows sign in
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();

    // Simulate Google OAuth success
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${mockGoogleResponse.access_token}`,
          },
        }
      );
    });

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    // Should navigate to Premier League after successful OAuth (with timeout)
    await waitFor(() => {
      expect(screen.getByText(/premier league/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles OAuth flow with network errors gracefully', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token-123',
    };

    // Mock network error during user info fetch
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    // Simulate Google OAuth success but network failure
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${mockGoogleResponse.access_token}`,
          },
        }
      );
    });

    // Should navigate to Premier League even when network fails (fallback behavior)
    await waitFor(() => {
      expect(screen.getByText(/premier league/i)).toBeInTheDocument();
    });
  });

  it('handles OAuth flow with Supabase errors gracefully', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token-123',
    };

    const mockUserInfo = {
      sub: 'google-user-id-456',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      picture: 'https://example.com/bob-avatar.jpg',
    };

    // Mock successful user info fetch
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    // Mock Supabase error
    const mockSupabaseError = {
      data: null,
      error: {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
      },
    };

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue(mockSupabaseError),
    } as any);

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    // Simulate Google OAuth success
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    // Should still navigate to Premier League even if Supabase fails
    await waitFor(() => {
      expect(screen.getByText(/premier league/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('validates OAuth provider configuration', () => {
    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    // Verify the provider is properly configured
    expect(screen.getByText(/lance sports/i)).toBeInTheDocument();
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  it('tests OAuth error handling', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    // Simulate Google OAuth error
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    if (loginCallback.onError) {
      loginCallback.onError(new Error('OAuth authentication failed'));
    }

    // Should remain on sign in page
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });
});
