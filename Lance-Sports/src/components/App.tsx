import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { SportsSlideshow } from './SportsSlideshow';
import { FixturesSidebar } from './FixturesSidebar';
import { SignIn } from './SignIn';
import { MatchDetail } from './MatchDetail';
import LiveUpcomingPastMatches from './LiveUpcomingPastMatches';
import { useSession } from './hooks/useSession';
import { ChatbotButton } from './ChatbotButton';
import { ChampionsLeague } from './ChampionsLeague';
import { Afcon } from './Afcon';
import { PremierLeague } from './PremierLeague';
import { ChatBot } from './ChatBot';
import { ProtectedRoute } from './ProtectedRoute';
import OddsGeneralDisplay from './OddsGeneralDisplay';
import OddsSpecificDisplay from './OddsSpecificDisplay';
import LeagueStandingsDisplay from './LeagueStandingsDisplay';

interface HomeProps {
  isSignedIn: boolean;
  userData: any;
}

function Home({ isSignedIn, userData }: HomeProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-8 text-center text-gray-100">
            The Future of Sports, all in one place.
          </h1>
          {isSignedIn ? (
            <div className="text-center mb-4">
              <p className="text-green-400 glass-green-dark inline-block px-6 py-3 rounded-full glass-glow">
                ✓ Welcome back, {userData?.name || userData?.username || 'User'}!
              </p>
            </div>
          ) : (
            <div className="text-center mb-4">
              <p className="text-blue-400 glass-card-dark inline-block px-6 py-3 rounded-full border border-blue-500/30">
                🔐 Sign in to access live scores, match details, and league standings
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

              {/* New Features Section */}
              {isSignedIn && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <div className="glass-card-dark p-4 rounded-xl glass-hover-dark glass-glow cursor-pointer" onClick={() => navigate('/odds-general')}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 text-lg">📊</span>
                      </div>
                      <h4 className="text-gray-100 font-semibold">Betting Odds</h4>
                    </div>
                    <p className="text-gray-300 text-sm">
                      View comprehensive betting odds from multiple bookmakers
                    </p>
                  </div>

                  <div className="glass-card-dark p-4 rounded-xl glass-hover-dark glass-glow cursor-pointer" onClick={() => navigate('/odds-specific')}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-lg">🎯</span>
                      </div>
                      <h4 className="text-gray-100 font-semibold">Detailed Odds</h4>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Explore detailed market-specific betting information
                    </p>
                  </div>

                  <div className="glass-card-dark p-4 rounded-xl glass-hover-dark glass-glow cursor-pointer" onClick={() => navigate('/league-standings')}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 text-lg">🏆</span>
                      </div>
                      <h4 className="text-gray-100 font-semibold">League Standings</h4>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Check current standings across all major leagues
                    </p>
                  </div>
                </div>
              )}
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

  const handleSignIn = async (userData?: any, redirectTo?: string) => {
    console.log('🚀 handleSignIn called:', { userData: !!userData, redirectTo });
    
    if (userData) {
      try {
        console.log('📝 Calling signIn with userData:', userData.name);
        await signIn(userData);
        console.log('✅ signIn completed, navigating to:', redirectTo);
        // Wait for state to update, then navigate
        if (redirectTo) navigate(redirectTo);
      } catch (error) {
        console.error('❌ Failed to sign in:', error);
      }
    } else if (redirectTo) {
      console.log('🔄 No userData, navigating directly to:', redirectTo);
      navigate(redirectTo);
    }
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
        <Route path="/match" element={
          <ProtectedRoute>
            <MatchDetail />
          </ProtectedRoute>
        } />
        <Route path="/football-leagues" element={
          <ProtectedRoute>
            <LiveUpcomingPastMatches />
          </ProtectedRoute>
        } />
        <Route path="/champions-league" element={
          <ProtectedRoute>
            <ChampionsLeague />
          </ProtectedRoute>
        } />
        <Route path="/premier-league" element={
          <ProtectedRoute>
            <PremierLeague />
          </ProtectedRoute>
        } />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <ChatBot />
          </ProtectedRoute>
        } />
        <Route path="/odds-general" element={
          <ProtectedRoute>
            <OddsGeneralDisplay />
          </ProtectedRoute>
        } />
        <Route path="/odds-specific" element={
          <ProtectedRoute>
            <OddsSpecificDisplay />
          </ProtectedRoute>
        } />
        <Route path="/league-standings" element={
          <ProtectedRoute>
            <LeagueStandingsDisplay />
          </ProtectedRoute>
        } />
        <Route path = '/afcon' element={<ProtectedRoute> 
          <Afcon/>
        </ProtectedRoute>}/>
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