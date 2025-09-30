// src/__tests__/OAuth.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mocked, MockedFunction } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { SignIn } from '../components/SignIn';

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

const mockUseGoogleLogin = useGoogleLogin as MockedFunction<typeof useGoogleLogin>;
const mockSupabase = supabase as Mocked<typeof supabase>;

describe('Google OAuth Integration Tests', () => {
  const mockOnSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGoogleLogin.mockReturnValue(vi.fn());
  });

  it('completes full OAuth flow successfully', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token-123',
    };

    const mockUserInfo = {
      sub: 'google-user-id-456',
      name: 'Jane Smith',
      email: 'jane@example.com',
      picture: 'https://example.com/jane-avatar.jpg',
    };

    const mockSupabaseResponse = {
      data: { id: 'user-789' },
      error: null,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue(mockSupabaseResponse),
    } as any);

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    expect(screen.getByText(/sign-in with your Google account/i)).toBeInTheDocument();

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

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith(
        {
          id: mockUserInfo.sub,
          username: mockUserInfo.name,
          email: mockUserInfo.email,
          avatar_url: mockUserInfo.picture,
          google_id: mockUserInfo.sub,
          name: mockUserInfo.name,
          picture: mockUserInfo.picture,
          displayName: mockUserInfo.name,
        },
        '/premier-league'
      );
    }, { timeout: 2000 });
  });

  it('handles OAuth flow with network errors gracefully', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token-123',
    };

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

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
      expect(mockOnSignIn).toHaveBeenCalledWith(undefined, '/premier-league');
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

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

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
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    await waitFor(() => {
      expect(mockOnSignIn).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('validates OAuth provider configuration', () => {
    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    expect(screen.getByText(/sign-in with your Google account/i)).toBeInTheDocument();
  });

  it('tests OAuth error handling', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    if (loginCallback.onError) {
      loginCallback.onError({ error: 'OAuth authentication failed' });
    }

    await waitFor(() => {
      expect(mockOnSignIn).not.toHaveBeenCalled();
      expect(screen.getByText(/sign-in with your Google account/i)).toBeInTheDocument();
    });
  });
});