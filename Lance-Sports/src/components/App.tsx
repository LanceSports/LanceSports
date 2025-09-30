import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { SportsSlideshow } from './SportsSlideshow';
import { FixturesSidebar } from './FixturesSidebar';
import { SignIn } from './SignIn';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'signin'>('home');
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Set dark mode as default and only theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLoginClick = () => {
    setCurrentView('signin');
  };

  const handleSignIn = () => {
    setIsSignedIn(true);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setIsSignedIn(false);
    setCurrentView('home');
  };

  if (currentView === 'signin') {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 transition-colors duration-200">
      <Navbar 
        onLoginClick={handleLoginClick}
        isSignedIn={isSignedIn}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-8 text-center text-gray-100">
            The Future of Sports, all in one place.
          </h1>
          {isSignedIn && (
            <div className="text-center mb-4">
              <p className="text-green-400 glass-green-dark inline-block px-6 py-3 rounded-full glass-glow">
                ✓ Welcome back! You are now signed in.
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Slideshow Section */}
          <div className="lg:col-span-3">
            <SportsSlideshow />
            
            {/* Additional Content */}
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
    </div>
  );
}