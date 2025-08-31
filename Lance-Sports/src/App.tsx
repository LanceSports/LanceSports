import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleSignIn = (userData?: any) => {
    setIsSignedIn(true);
    if (userData) {
      setUserData(userData);
      console.log('User signed in:', userData);
    }
  };

  const handleLogout = () => {
    setIsSignedIn(false);
    setUserData(null);
  };

  return (
    <BrowserRouter>
      <Navbar isSignedIn={isSignedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/premier-league" element={<PremierLeague />} />
      </Routes>
    </BrowserRouter>
  );
}