// src/__tests__/SignIn.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignIn } from '../components/SignIn';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks and modules
vi.mock('@react-oauth/google');
vi.mock('../lib/supabase');

const mockUseGoogleLogin = useGoogleLogin as vi.MockedFunction<typeof useGoogleLogin>;
const mockSupabase = supabase as vi.Mocked<typeof supabase>;

describe('SignIn Component', () => {
  const mockOnSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGoogleLogin.mockReturnValue(vi.fn());
  });

  it('renders sign in button', () => {
    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('shows loading state when signing in', async () => {
    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    const signInButton = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(signInButton);

    expect(signInButton).toBeDisabled();
  });

  it('handles successful Google OAuth flow', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    const mockUserInfo = {
      sub: 'google-user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
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
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
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
    });
  });

  it('handles Google OAuth error', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    if (loginCallback.onError) {
      loginCallback.onError({ error: 'OAuth failed' });
    }

    await waitFor(() => {
      expect(mockOnSignIn).not.toHaveBeenCalled();
    });
  });

  it('handles user info fetch error', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch user info'));

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
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
      expect(mockOnSignIn).toHaveBeenCalledWith(undefined, '/premier-league');
    });
  });

  it('handles Supabase exception gracefully', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    const mockUserInfo = {
      sub: 'google-user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

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
    });
  });

  it('handles Supabase error response but does not proceed', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    const mockUserInfo = {
      sub: 'google-user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      }),
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(mockOnSignIn).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('saves user data to Supabase with correct format', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    const mockUserInfo = {
      sub: 'google-user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    const mockUpsert = vi.fn().mockResolvedValue({
      data: { id: 'user-123' },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        {
          google_id: mockUserInfo.sub,
          username: mockUserInfo.name,
          email: mockUserInfo.email,
          avatar_url: mockUserInfo.picture,
          last_sign_in: expect.any(String),
        },
        {
          onConflict: 'google_id',
        }
      );
    });
  });

  it('tests Supabase connection on component mount', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });
  });

  it('handles Supabase connection test failure', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Connection failed' },
      }),
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });
  });

  it('shows success state after successful OAuth', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    const mockUserInfo = {
      sub: 'google-user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
    } as any);

    render(
      <BrowserRouter>
        <SignIn onSignIn={mockOnSignIn} />
      </BrowserRouter>
    );

    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      expect(screen.getByText(/redirecting to premier league/i)).toBeInTheDocument();
    });
  });
});