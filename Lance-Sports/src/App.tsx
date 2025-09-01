import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SportsSlideshow } from './components/SportsSlideshow';
import { FixturesSidebar } from './components/FixturesSidebar';
import { SignIn } from './components/SignIn';
import { PremierLeague } from './PremierLeague';
import { useState } from 'react';
//import './App.css';
function Home({ isSignedIn }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-8 text-center text-gray-800">
            The Future of Sports, all in one place.
          </h1>
          {isSignedIn && (
            <div className="text-center mb-4">
              <p className="text-green-600 bg-green-50 inline-block px-4 py-2 rounded-full">
                ✓ Welcome back! You are now signed in.
              </p>
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

  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleLogout = () => {
    setIsSignedIn(false);
  };

  return (
    <BrowserRouter>
      <Navbar isSignedIn={isSignedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home isSignedIn={isSignedIn} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/premier-league" element={<PremierLeague />} />
      </Routes>
    </BrowserRouter>
  );
}