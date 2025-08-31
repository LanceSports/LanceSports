import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SportsSlideshow } from './components/SportsSlideshow';
import { FixturesSidebar } from './components/FixturesSidebar';
import { SignIn } from './components/SignIn';
import { PremierLeague } from './components/PremierLeague';

function Home({ isSignedIn, userData }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-8 text-center text-gray-800">
            The Future of Sports, all in one place.
          </h1>
          {isSignedIn && (
            <div className="text-center mb-4">
              <div className="bg-green-50 inline-block px-6 py-3 rounded-full">
                <p className="text-green-600 font-medium">
                  ✓ Welcome back! You are now signed in.
                </p>
                {userData && (
                  <p className="text-green-700 text-sm mt-1">
                    Signed in as: {userData.name} ({userData.email})
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <SportsSlideshow />
            <div className="mt-8 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg mb-3">Latest Sports News</h3>
                <p className="text-gray-600 text-sm">
                  Stay updated with the latest news, match results, and upcoming fixtures 
                  from all your favorite sports leagues and tournaments.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg mb-3">Live Scores & Updates</h3>
                <p className="text-gray-600 text-sm">
                  Get real-time scores, live commentary, and instant updates 
                  during matches across Premier League, Rugby, Cricket, and more.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <FixturesSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  const handleSignIn = (userData?: any, redirectTo?: string) => {
    setIsSignedIn(true);
    if (userData) {
      setUserData(userData);
      console.log('User signed in:', userData);
    }
    
    // Redirect to specified path or default to home
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked - redirecting to home page');
    setIsSignedIn(false);
    setUserData(null);
    
    // Force redirect to home page
    window.location.href = '/';
  };

  return (
    <>
      <Navbar isSignedIn={isSignedIn} onLogout={handleLogout} userData={userData} />
      <Routes>
        <Route path="/" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/premier-league" element={<PremierLeague />} />
        {/* Catch all route to ensure navigation works */}
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