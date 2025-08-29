import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SportsSlideshow } from './components/SportsSlideshow';
import { FixturesSidebar } from './components/FixturesSidebar';
import { SignIn } from './components/SignIn';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'signin'>('home');
  const [isSignedIn, setIsSignedIn] = useState(false);
// tehse are functions to handle whatever happens when currentView changes to a certain string 
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
    return <SignIn onSignIn={handleSignIn} />; // this is when we jump in straight 
                                              // and enter the sight
  }
// if the person "signed in" then we return this 
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onLoginClick={handleLoginClick}
        isSignedIn={isSignedIn}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-8 text-center text-gray-800">
            The Future of Sports, all in one place.
          </h1>
           {/* i fteh usere is signed in */}
          {isSignedIn && (
            <div className="text-center mb-4">
              <p className="text-green-600 bg-green-50 inline-block px-4 py-2 rounded-full">
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FixturesSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}