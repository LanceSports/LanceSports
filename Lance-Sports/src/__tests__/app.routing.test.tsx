import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

vi.mock('../components/Navbar', () => ({ Navbar: () => <div>Nav</div> }));
vi.mock('../components/SportsSlideshow', () => ({ SportsSlideshow: () => <div>Slide</div> }));
vi.mock('../components/FixturesSidebar', () => ({ FixturesSidebar: () => <div>Sidebar</div> }));
vi.mock('../components/SignIn', () => ({ SignIn: () => <div>Sign In</div> }));
vi.mock('../PremierLeague', () => ({ PremierLeague: () => <div>PL</div> }));
vi.mock('../hooks/useSession', () => ({ useSession: () => ({ isSignedIn: false, userData: null, signIn: vi.fn(), signOut: vi.fn(), refreshSession: vi.fn() }) }));

describe('App routing', () => {
  it('renders home', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/The Future of Sports/i)).toBeInTheDocument();
  });
});



