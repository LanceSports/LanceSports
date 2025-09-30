import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { SportsSlideshow } from './SportsSlideshow';
import { FixturesSidebar } from './FixturesSidebar';
import { SignIn } from './SignIn';
import { MatchDetail } from './MatchDetail';
import LiveUpcomingPastMatches from './LiveUpcomingPastMatches';
import { useSession } from './hooks/useSession.ts';
import { ChatbotButton } from './ChatbotButton';

interface HomeProps {
  isSignedIn: boolean;
  userData: any;
}

function Home({ isSignedIn, userData }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-8 text-center text-gray-100">
            The Future of Sports, all in one place.
          </h1>
          {isSignedIn && (
            <div className="text-center mb-4">
              <p className="text-green-400 glass-green-dark inline-block px-6 py-3 rounded-full glass-glow">
                ✓ Welcome back, {userData?.name || userData?.username || 'User'}!
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Slideshow Section */}
          <div className="lg:col-span-3">
            <SportsSlideshow />

            <div className="mt-8 space-y-6">
              <div className="glass-card-dark p-6 rounded-xl glass-hover-dark glass-glow">
                <h3 className="text-lg mb-3 text-gray-100">Latest Sports News</h3>
                <p className="text-gray-300 text-sm">
                  Stay updated with the latest news, match results, and upcoming fixtures 
                  from all your favorite sports leagues and tournaments.
                </p>
              </div>

              <div className="glass-card-dark p-6 rounded-xl glass-hover-dark glass-glow glass-shimmer">
                <h3 className="text-lg mb-3 text-gray-100">Live Scores & Updates</h3>
                <p className="text-gray-300 text-sm">
                  Get real-time scores, live commentary, and instant updates 
                  during matches across Premier League, Rugby, Cricket, and more.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FixturesSidebar />
          </div>
        </div>
      </main>
      <ChatbotButton/>
    </div>
  );
}

function AppContent() {
  const { isSignedIn, userData, signIn, signOut } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark'); // Force dark mode
  }, []);

  const handleSignIn = (userData?: any, redirectTo?: string) => {
    if (userData) {
      signIn(userData);
    }
    if (redirectTo) navigate(redirectTo);
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/signin');
  };

  return (
    <>
      <Navbar
        isSignedIn={isSignedIn}
        onLogout={handleLogout}
        userData={userData}
        onLoginClick={handleLoginClick}
      />
      <Routes>
        <Route path="/" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
        <Route path="/preview_page.html" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/match" element={<MatchDetail />} />
        <Route path="/football-leagues" element={<LiveUpcomingPastMatches />} />
        {/* fallback */}
        <Route path="*" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}