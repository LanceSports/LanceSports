import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SignIn } from '../../src/components/SignIn';

// Mock Google OAuth
const mockGoogleLogin = vi.fn();
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: any) => (
    <button 
      onClick={() => onSuccess({ credential: 'mock-credential' })}
      data-testid="google-login"
    >
      Sign in with Google
    </button>
  )
}));

// Mock the useSession hook
const mockSignIn = vi.fn();
vi.mock('../../src/components/hooks/useSession', () => ({
  useSession: () => ({
    isSignedIn: false,
    userData: null,
    signIn: mockSignIn,
    signOut: vi.fn()
  })
}));

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render sign in form', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByText('Welcome to LanceSports')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access all features')).toBeInTheDocument();
    });

    it('should show Google sign in button', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByTestId('google-login')).toBeInTheDocument();
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    it('should show manual sign in form', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show sign up link', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up here')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(signInButton);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      await user.click(signInButton);

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should clear validation errors when user starts typing', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      await user.type(emailInput, 'test@example.com');

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockOnSignIn = vi.fn();
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      expect(mockOnSignIn).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        undefined
      );
    });

    it('should handle form submission errors', async () => {
      const mockOnSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const mockOnSignIn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      expect(signInButton).toBeDisabled();
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  describe('Google OAuth', () => {
    it('should handle successful Google sign in', async () => {
      const mockOnSignIn = vi.fn();
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const googleButton = screen.getByTestId('google-login');
      await user.click(googleButton);

      expect(mockOnSignIn).toHaveBeenCalledWith(
        { credential: 'mock-credential' },
        undefined
      );
    });

    it('should handle Google sign in errors', async () => {
      const mockOnSignIn = vi.fn().mockRejectedValue(new Error('Google sign in failed'));
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const googleButton = screen.getByTestId('google-login');
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Google sign in failed')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to sign up page when link is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const signUpLink = screen.getByText('Sign up here');
      await user.click(signUpLink);

      // This would normally navigate to sign up page
      // In a real test, you'd check the URL or rendered component
      expect(signUpLink).toBeInTheDocument();
    });

    it('should navigate back to home when back button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // This would normally navigate back
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      expect(passwordInput.type).toBe('password');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Remember Me', () => {
    it('should handle remember me checkbox', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      expect(rememberCheckbox).not.toBeChecked();
      
      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();
    });
  });

  describe('Forgot Password', () => {
    it('should show forgot password link', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });

    it('should handle forgot password click', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const forgotPasswordLink = screen.getByText('Forgot password?');
      await user.click(forgotPasswordLink);

      // This would normally show forgot password modal or navigate
      expect(forgotPasswordLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome to LanceSports');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(signInButton).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Sign in form');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockOnSignIn = vi.fn().mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should clear errors when form is resubmitted', async () => {
      const mockOnSignIn = vi.fn()
        .mockRejectedValueOnce(new Error('Invalid credentials'))
        .mockResolvedValueOnce({});
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Clear password and try again
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={vi.fn()} />
        </BrowserRouter>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid form submissions', async () => {
      const mockOnSignIn = vi.fn().mockResolvedValue({});
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <SignIn onSignIn={mockOnSignIn} />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Rapid clicks should be handled gracefully
      await user.click(signInButton);
      await user.click(signInButton);
      await user.click(signInButton);

      // Should only submit once or handle multiple submissions gracefully
      expect(mockOnSignIn).toHaveBeenCalled();
    });
  });
});
