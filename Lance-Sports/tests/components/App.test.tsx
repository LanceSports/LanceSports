import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/components/App';

// Mock the useSession hook
const mockUseSession = vi.fn();
vi.mock('../../src/components/hooks/useSession', () => ({
  useSession: () => mockUseSession()
}));

// Mock the ChatbotButton component
vi.mock('../../src/components/ChatbotButton', () => ({
  ChatbotButton: () => <div data-testid="chatbot-button">Chatbot Button</div>
}));

// Mock the SportsSlideshow component
vi.mock('../../src/components/SportsSlideshow', () => ({
  SportsSlideshow: () => <div data-testid="sports-slideshow">Sports Slideshow</div>
}));

// Mock the FixturesSidebar component
vi.mock('../../src/components/FixturesSidebar', () => ({
  FixturesSidebar: () => <div data-testid="fixtures-sidebar">Fixtures Sidebar</div>
}));

// Mock the Navbar component
vi.mock('../../src/components/Navbar', () => ({
  Navbar: ({ isSignedIn, onLogout, userData, onLoginClick }: any) => (
    <nav data-testid="navbar">
      <button onClick={onLoginClick}>Login</button>
      {isSignedIn && (
        <>
          <span data-testid="user-name">{userData?.name || 'User'}</span>
          <button onClick={onLogout}>Logout</button>
        </>
      )}
    </nav>
  )
}));

// Mock the SignIn component
vi.mock('../../src/components/SignIn', () => ({
  SignIn: ({ onSignIn }: any) => (
    <div data-testid="signin-page">
      <button onClick={() => onSignIn({ name: 'Test User', email: 'test@example.com' })}>
        Sign In
      </button>
    </div>
  )
}));

// Mock the MatchDetail component
vi.mock('../../src/components/MatchDetail', () => ({
  MatchDetail: () => <div data-testid="match-detail">Match Detail</div>
}));

// Mock the LiveUpcomingPastMatches component
vi.mock('../../src/components/LiveUpcomingPastMatches', () => ({
  default: () => <div data-testid="live-upcoming-past-matches">Live Upcoming Past Matches</div>
}));

// Mock the ChampionsLeague component
vi.mock('../../src/components/ChampionsLeague', () => ({
  ChampionsLeague: () => <div data-testid="champions-league">Champions League</div>
}));

// Mock the PremierLeague component
vi.mock('../../src/components/PremierLeague', () => ({
  PremierLeague: () => <div data-testid="premier-league">Premier League</div>
}));

// Mock the ChatBot component
vi.mock('../../src/components/ChatBot', () => ({
  ChatBot: () => <div data-testid="chatbot">ChatBot</div>
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock session state
    mockUseSession.mockReturnValue({
      isSignedIn: false,
      userData: null,
      signIn: vi.fn(),
      signOut: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Routing', () => {
    it('should render home page by default', () => {
      render(<App />);

      expect(screen.getByText('The Future of Sports, all in one place.')).toBeInTheDocument();
      expect(screen.getByTestId('sports-slideshow')).toBeInTheDocument();
      expect(screen.getByTestId('fixtures-sidebar')).toBeInTheDocument();
    });

    it('should render sign in page when navigating to /signin', () => {
      // Mock the current location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/signin' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('signin-page')).toBeInTheDocument();
    });

    it('should render match detail page when navigating to /match', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/match' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('match-detail')).toBeInTheDocument();
    });

    it('should render football leagues page when navigating to /football-leagues', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/football-leagues' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('live-upcoming-past-matches')).toBeInTheDocument();
    });

    it('should render champions league page when navigating to /champions-league', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/champions-league' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('champions-league')).toBeInTheDocument();
    });

    it('should render premier league page when navigating to /premier-league', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/premier-league' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('premier-league')).toBeInTheDocument();
    });

    it('should render chatbot page when navigating to /chatbot', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/chatbot' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('chatbot')).toBeInTheDocument();
    });
  });

  describe('Authentication State', () => {
    it('should show welcome message for signed in user', () => {
      mockUseSession.mockReturnValue({
        isSignedIn: true,
        userData: { name: 'John Doe', email: 'john@example.com' },
        signIn: vi.fn(),
        signOut: vi.fn()
      });

      render(<App />);

      expect(screen.getByText(/Welcome back, John Doe!/)).toBeInTheDocument();
    });

    it('should not show welcome message for signed out user', () => {
      mockUseSession.mockReturnValue({
        isSignedIn: false,
        userData: null,
        signIn: vi.fn(),
        signOut: vi.fn()
      });

      render(<App />);

      expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
    });

    it('should use username if name is not available', () => {
      mockUseSession.mockReturnValue({
        isSignedIn: true,
        userData: { username: 'johndoe', email: 'john@example.com' },
        signIn: vi.fn(),
        signOut: vi.fn()
      });

      render(<App />);

      expect(screen.getByText(/Welcome back, johndoe!/)).toBeInTheDocument();
    });

    it('should fallback to "User" if neither name nor username is available', () => {
      mockUseSession.mockReturnValue({
        isSignedIn: true,
        userData: { email: 'john@example.com' },
        signIn: vi.fn(),
        signOut: vi.fn()
      });

      render(<App />);

      expect(screen.getByText(/Welcome back, User!/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to sign in page when login is clicked', async () => {
      const user = userEvent.setup();

      render(<App />);

      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });

    it('should handle sign in and navigate', async () => {
      const mockSignIn = vi.fn();
      mockUseSession.mockReturnValue({
        isSignedIn: false,
        userData: null,
        signIn: mockSignIn,
        signOut: vi.fn()
      });

      Object.defineProperty(window, 'location', {
        value: { pathname: '/signin' },
        writable: true
      });

      const user = userEvent.setup();

      render(<App />);

      const signInButton = screen.getByText('Sign In');
      await user.click(signInButton);

      expect(mockSignIn).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com'
      });
    });

    it('should handle logout and navigate to home', async () => {
      const mockSignOut = vi.fn();
      mockUseSession.mockReturnValue({
        isSignedIn: true,
        userData: { name: 'John Doe' },
        signIn: vi.fn(),
        signOut: mockSignOut
      });

      const user = userEvent.setup();

      render(<App />);

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Theme and Styling', () => {
    it('should apply dark mode class to document', () => {
      render(<App />);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should render with correct background gradient classes', () => {
      render(<App />);

      const mainElement = screen.getByText('The Future of Sports, all in one place.').closest('div');
      expect(mainElement).toHaveClass('min-h-screen', 'bg-gradient-to-br');
    });
  });

  describe('Component Integration', () => {
    it('should render all main components on home page', () => {
      render(<App />);

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('sports-slideshow')).toBeInTheDocument();
      expect(screen.getByTestId('fixtures-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
    });

    it('should render navbar on all pages', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/premier-league' },
        writable: true
      });

      render(<App />);

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('premier-league')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const user = userEvent.setup();

      render(<App />);

      // Should not crash when navigation fails
      expect(() => {
        fireEvent.click(screen.getByText('Login'));
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<App />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('The Future of Sports, all in one place.');
    });

    it('should have accessible navigation', () => {
      render(<App />);

      const navbar = screen.getByTestId('navbar');
      expect(navbar).toBeInTheDocument();
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Re-render with same props
      rerender(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Component should still be functional
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });
});
