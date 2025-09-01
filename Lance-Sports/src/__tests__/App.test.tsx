import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock the SignIn component
vi.mock('../components/SignIn', () => ({
  SignIn: ({ onSignIn }: { onSignIn: (userData?: any, redirectTo?: string) => void }) => (
    <div data-testid="signin-component">
      <button onClick={() => onSignIn({ name: 'Test User' }, '/premier-league')}>
        Continue with Google
      </button>
    </div>
  ),
}));

// Mock the PremierLeague component
vi.mock('../components/PremierLeague', () => ({
  PremierLeague: () => <div data-testid="premier-league">Premier League Component</div>,
}));

// Mock the SportsSlideshow component
vi.mock('../components/SportsSlideshow', () => ({
  SportsSlideshow: () => <div data-testid="sports-slideshow">Sports Slideshow</div>,
}));

// Mock react-router-dom to avoid Router conflicts
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: '/' })),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('App Component', () => {
  it('renders the main app with navigation', () => {
    render(<App />);

    // Check for main navigation elements
    expect(screen.getByText(/lance sports/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/premier league/i)).toBeInTheDocument();
  });

  it('shows sign in component when not authenticated', () => {
    render(<App />);

    expect(screen.getByTestId('signin-component')).toBeInTheDocument();
  });

  it('navigates to premier league after successful sign in', () => {
    render(<App />);

    const signInButton = screen.getByText('Continue with Google');
    signInButton.click();

    // Should navigate to premier league
    expect(screen.getByTestId('premier-league')).toBeInTheDocument();
  });

  it('displays sports slideshow on home page', () => {
    render(<App />);

    expect(screen.getByTestId('sports-slideshow')).toBeInTheDocument();
  });
});
