// src/__tests__/App.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { useSession } from '../hooks/useSession';

// Mock useSession hook
vi.mock('../hooks/useSession', () => ({
  useSession: () => ({
    isSignedIn: false,
    userData: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
  }),
}));

// Mock fetch for API calls (e.g., in PremierLeague)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ response: [] }),
  })
);

// Mock child components to prevent side effects
vi.mock('../components/Navbar', () => ({
  Navbar: () => <div>Mocked Navbar</div>,
}));
vi.mock('../components/SportsSlideshow', () => ({
  SportsSlideshow: () => <div>Mocked SportsSlideshow</div>,
}));
vi.mock('../components/FixturesSidebar', () => ({
  FixturesSidebar: () => <div>Mocked FixturesSidebar</div>,
}));
vi.mock('../components/SignIn', () => ({
  SignIn: () => <button>Continue with Google</button>,
}));
vi.mock('../PremierLeague', () => ({
  PremierLeague: () => <div>Mocked PremierLeague</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Home page by default', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/The Future of Sports, all in one place/i)).toBeInTheDocument();
    });
  });

  it('renders SignIn page', async () => {
    render(
      <BrowserRouter initialEntries={['/signin']}>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });
  });

  it('renders PremierLeague page', async () => {
    render(
      <BrowserRouter initialEntries={['/premier-league']}>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/The Future of Sports/i)).toBeInTheDocument();
    });
  });
});