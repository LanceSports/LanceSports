// src/components/tests/unit/PremierLeague.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PremierLeague } from '../PremierLeague';

// Mock data to match what LiveOverlay & Setup expect
const mockFixtures = {
  matches: [
    { id: 1, home: 'Arsenal', away: 'Chelsea', score: '2-1' },
    { id: 2, home: 'Liverpool', away: 'Man City', score: '1-3' },
  ],
};

const mockTeams = [
  { id: 1, name: 'Arsenal' },
  { id: 2, name: 'Chelsea' },
];

describe('PremierLeague page', () => {
  beforeEach(() => {
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.toString().includes('/teams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: mockTeams }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ response: mockFixtures }),
      });
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders loading state', () => {
    render(<PremierLeague />);
    expect(screen.getByText(/Loading data from API-Football/i)).toBeInTheDocument();
  });

  test('renders LiveOverlay by default', async () => {
    render(<PremierLeague />);
    await waitFor(() => {
      expect(screen.getByText(/Arsenal/i)).toBeInTheDocument();
      expect(screen.getByText(/Chelsea/i)).toBeInTheDocument();
    });
  });

  test('switches to Setup when clicking Match Setup', async () => {
    render(<PremierLeague />);
    const setupButton = screen.getByRole('button', { name: /Match Setup/i });
    fireEvent.click(setupButton);

    await waitFor(() => {
      expect(screen.getByText(/Arsenal/i)).toBeInTheDocument();
      expect(screen.getByText(/Chelsea/i)).toBeInTheDocument();
    });
  });

  test('handles missing API key gracefully', async () => {
    // Remove the API key
    vi.stubEnv('VITE_API_FOOTBALL_KEY', '');

    render(<PremierLeague />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading data from API-Football/i)).not.toBeInTheDocument();
    });
  });

  test('renders error state when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })));

    render(<PremierLeague />);
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
});
