import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignIn } from '../SignIn';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../../lib/supabase';

// Mock the hooks and modules
vi.mock('@react-oauth/google');
vi.mock('../../lib/supabase');

const mockUseGoogleLogin = useGoogleLogin as vi.MockedFunction<typeof useGoogleLogin>;
const mockSupabase = supabase as vi.Mocked<typeof supabase>;

describe('SignIn Component', () => {
  const mockOnSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGoogleLogin.mockReturnValue(vi.fn());
  });

  it('renders sign in button', () => {
    render(<SignIn onSignIn={mockOnSignIn} />);
    
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('shows loading state when signing in', async () => {
    render(<SignIn onSignIn={mockOnSignIn} />);
    
    const signInButton = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(signInButton);
    
    // The button should show loading state
    expect(signInButton).toBeDisabled();
  });

  it('handles successful Google OAuth flow', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    // Mock successful Google OAuth response
    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    // Mock successful user info fetch
    const mockUserInfo = {
      sub: 'google-user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/avatar.jpg',
    };

    // Mock successful Supabase upsert
    const mockSupabaseResponse = {
      data: { id: 'user-123' },
      error: null,
    };

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue(mockSupabaseResponse),
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

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

    // Wait for the timeout to complete and onSignIn to be called
    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith(mockUserInfo, '/premier-league');
    }, { timeout: 2000 });
  });

  it('handles Google OAuth error', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    render(<SignIn onSignIn={mockOnSignIn} />);

    // Simulate Google OAuth error
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    if (loginCallback.onError) {
      loginCallback.onError(new Error('OAuth failed'));
    }

    // Should not call onSignIn on error
    expect(mockOnSignIn).not.toHaveBeenCalled();
  });

  it('handles user info fetch error', async () => {
    const mockGoogleLogin = vi.fn();
    mockUseGoogleLogin.mockReturnValue(mockGoogleLogin);

    const mockGoogleResponse = {
      access_token: 'mock-access-token',
    };

    // Mock failed user info fetch
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Failed to fetch user info'));

    render(<SignIn onSignIn={mockOnSignIn} />);

    // Simulate Google OAuth success but user info fetch failure
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

    // Should call onSignIn with undefined user data when user info fetch fails
    await waitFor(() => {
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

    // Mock successful user info fetch
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    // Mock Supabase exception (not error response) - this triggers the catch block which calls onSignIn immediately
    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

    // Simulate Google OAuth success
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    await waitFor(() => {
      // Should still call onSignIn even if Supabase fails (immediate call in catch block)
      expect(mockOnSignIn).toHaveBeenCalledWith(mockUserInfo, '/premier-league');
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

    // Mock successful user info fetch
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    // Mock Supabase error response (not exception) - this logs error but doesn't call onSignIn
    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Database error',
          code: 'DB_ERROR',
        },
      }),
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

    // Simulate Google OAuth success
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    // Wait a bit to ensure onSignIn is not called
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Should not call onSignIn when Supabase returns an error response
    expect(mockOnSignIn).not.toHaveBeenCalled();
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

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    const mockUpsert = vi.fn().mockResolvedValue({
      data: { id: 'user-123' },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      upsert: mockUpsert,
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

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
    // Mock successful Supabase connection test
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });
  });

  it('handles Supabase connection test failure', async () => {
    // Mock failed Supabase connection test
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Connection failed' } 
      }),
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

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

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockUserInfo),
    });

    mockSupabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
    } as any);

    render(<SignIn onSignIn={mockOnSignIn} />);

    // Simulate Google OAuth success
    const loginCallback = mockUseGoogleLogin.mock.calls[0][0];
    await loginCallback.onSuccess(mockGoogleResponse);

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText(/redirecting to premier league/i)).toBeInTheDocument();
    });
  });
});
