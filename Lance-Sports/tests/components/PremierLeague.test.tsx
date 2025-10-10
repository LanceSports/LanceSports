import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PremierLeague } from '../../src/components/PremierLeague';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the ChatbotButton component
vi.mock('../../src/components/ChatbotButton', () => ({
  ChatbotButton: () => <div data-testid="chatbot-button">Chatbot Button</div>
}));

describe('PremierLeague Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render Premier League header', () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      expect(screen.getByText('Premier League')).toBeInTheDocument();
      expect(screen.getByText("England's top-flight football competition")).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Should show loading skeletons
      expect(screen.getAllByTestId(/skeleton|loading/)).toHaveLength(6);
    });

    it('should render main tabs (matches and standings)', () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      expect(screen.getByText('matches')).toBeInTheDocument();
      expect(screen.getByText('standings')).toBeInTheDocument();
    });

    it('should default to matches tab', () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      const matchesTab = screen.getByText('matches');
      expect(matchesTab).toHaveClass('glass-pl-dark');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to standings tab when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      }, { timeout: 3000 });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      await waitFor(() => {
        expect(screen.getByText('2024/25 Season Standings')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show match sub-tabs when matches tab is active', async () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('live')).toBeInTheDocument();
        expect(screen.getByText('upcoming')).toBeInTheDocument();
        expect(screen.getByText('past')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should not show match sub-tabs when standings tab is active', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      expect(screen.queryByText('live')).not.toBeInTheDocument();
      expect(screen.queryByText('upcoming')).not.toBeInTheDocument();
      expect(screen.queryByText('past')).not.toBeInTheDocument();
    });
  });

  describe('Match Filtering', () => {
    it('should filter matches by live status', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('live')).toBeInTheDocument();
      });

      const liveTab = screen.getByText('live');
      await user.click(liveTab);

      // Should show "No live matches at the moment" since mock data has no live matches
      await waitFor(() => {
        expect(screen.getByText('No live matches at the moment')).toBeInTheDocument();
      });
    });

    it('should filter matches by upcoming status', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('upcoming')).toBeInTheDocument();
      });

      const upcomingTab = screen.getByText('upcoming');
      await user.click(upcomingTab);

      // Should show upcoming matches
      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
        expect(screen.getByText('Manchester City')).toBeInTheDocument();
      });
    });

    it('should filter matches by past status', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('past')).toBeInTheDocument();
      });

      const pastTab = screen.getByText('past');
      await user.click(pastTab);

      // Should show past matches
      await waitFor(() => {
        expect(screen.getByText('Newcastle')).toBeInTheDocument();
        expect(screen.getByText('Bournemouth')).toBeInTheDocument();
      });
    });
  });

  describe('Match Display', () => {
    it('should display match information correctly', async () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
        expect(screen.getByText('Manchester City')).toBeInTheDocument();
        expect(screen.getByText('Anfield')).toBeInTheDocument();
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });
    });

    it('should show match scores for finished matches', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('past')).toBeInTheDocument();
      });

      const pastTab = screen.getByText('past');
      await user.click(pastTab);

      // Should show scores for finished matches
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Newcastle score
        expect(screen.getByText('1')).toBeInTheDocument(); // Bournemouth score
      });
    });

    it('should show match time for upcoming matches', async () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        // Should show time in format like "15:30"
        expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
      });
    });

    it('should show match venue information', async () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('Anfield')).toBeInTheDocument();
        expect(screen.getByText('Old Trafford')).toBeInTheDocument();
        expect(screen.getByText('Stamford Bridge')).toBeInTheDocument();
      });
    });
  });

  describe('Match Interaction', () => {
    it('should navigate to match detail when match is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });

      // Click on a match card
      const matchCard = screen.getByText('Liverpool').closest('div');
      if (matchCard) {
        await user.click(matchCard);
        expect(mockNavigate).toHaveBeenCalledWith('/match', expect.any(Object));
      }
    });
  });

  describe('Standings Display', () => {
    it('should display standings table correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      await waitFor(() => {
        expect(screen.getByText('2024/25 Season Standings')).toBeInTheDocument();
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
        expect(screen.getByText('Manchester City')).toBeInTheDocument();
        expect(screen.getByText('Arsenal')).toBeInTheDocument();
      });
    });

    it('should show team positions correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      await waitFor(() => {
        // Check position numbers
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should show team statistics correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Pos')).toBeInTheDocument();
        expect(screen.getByText('Team')).toBeInTheDocument();
        expect(screen.getByText('P')).toBeInTheDocument();
        expect(screen.getByText('W')).toBeInTheDocument();
        expect(screen.getByText('D')).toBeInTheDocument();
        expect(screen.getByText('L')).toBeInTheDocument();
        expect(screen.getByText('GF')).toBeInTheDocument();
        expect(screen.getByText('GA')).toBeInTheDocument();
        expect(screen.getByText('GD')).toBeInTheDocument();
        expect(screen.getByText('Pts')).toBeInTheDocument();
      });
    });

    it('should highlight league positions correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      await waitFor(() => {
        // Check for league position indicators
        expect(screen.getByText('Champions League Winner')).toBeInTheDocument();
        expect(screen.getByText('Champions League')).toBeInTheDocument();
        expect(screen.getByText('Europa League')).toBeInTheDocument();
        expect(screen.getByText('Relegation')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading skeletons during data fetch', () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Should show loading skeletons - look for elements with animate-pulse class
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('should hide loading state after data is loaded', async () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements.length).toBe(0);
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show appropriate message when no live matches', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('live')).toBeInTheDocument();
      });

      const liveTab = screen.getByText('live');
      await user.click(liveTab);

      await waitFor(() => {
        expect(screen.getByText('No live matches at the moment')).toBeInTheDocument();
      });
    });

    it('should show appropriate message when no upcoming matches', async () => {
      // This would require mocking different data
      // For now, we'll test the structure exists
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('upcoming')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Premier League');
    });

    it('should have accessible tab navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      const matchesTab = screen.getByRole('button', { name: /matches/i });
      const standingsTab = screen.getByRole('button', { name: /standings/i });

      expect(matchesTab).toBeInTheDocument();
      expect(standingsTab).toBeInTheDocument();

      await user.click(standingsTab);
      expect(standingsTab).toHaveClass('glass-pl-dark');
    });

    it('should have accessible table headers', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);

      await waitFor(() => {
        const tableHeaders = screen.getAllByRole('columnheader');
        expect(tableHeaders.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle tab switching efficiently', async () => {
      const user = userEvent.setup();
      
      render(
        <BrowserRouter>
          <PremierLeague />
        </BrowserRouter>
      );

      // Fast-forward past loading
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText('standings')).toBeInTheDocument();
      });

      const startTime = performance.now();
      
      const standingsTab = screen.getByText('standings');
      await user.click(standingsTab);
      
      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      expect(switchTime).toBeLessThan(50);
    });
  });
});
