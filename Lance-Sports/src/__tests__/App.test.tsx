import React from 'react';
import { beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
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

// Mock fetch for any API calls (e.g., in PremierLeague)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ response: [] }),
  })
);

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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Simulate navigation to /signin
    window.history.pushState({}, '', '/signin');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });
  });

  it('renders PremierLeague page', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Simulate navigation to /premier-league
    window.history.pushState({}, '', '/premier-league');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Stay updated with the latest news, match results, and upcoming fixtures from all your favorite sports leagues and tournaments./i)).toBeInTheDocument();
    });
  });
});