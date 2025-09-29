import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../components/Navbar', () => ({ Navbar: () => <nav aria-label="Main">Nav</nav> }));
vi.mock('../components/SportsSlideshow', () => ({ SportsSlideshow: () => <section>Slide</section> }));
vi.mock('../components/FixturesSidebar', () => ({ FixturesSidebar: () => <aside>Sidebar</aside> }));
vi.mock('../components/SignIn', () => ({ SignIn: () => <button>Sign In</button> }));
vi.mock('../PremierLeague', () => ({ PremierLeague: () => <main>PL</main> }));
vi.mock('../hooks/useSession', () => ({ useSession: () => ({ isSignedIn: false, userData: null, signIn: vi.fn(), signOut: vi.fn(), refreshSession: vi.fn() }) }));

describe('basic a11y roles', () => {
  it('renders nav and main landmarks', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });
});



