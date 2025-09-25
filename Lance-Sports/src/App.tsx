import React from 'react';

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SportsSlideshow } from './components/SportsSlideshow';
import { FixturesSidebar } from './components/FixturesSidebar';
import { SignIn } from './components/SignIn';
import { PremierLeague } from './PremierLeague';
import { MatchPage } from './components/MatchPage';
import { useSession } from './hooks/useSession';
import LiveUpcomingPastMatches from './LiveUpcomingPastMatches'


import { Button } from './components/ui/button';


interface HomeProps {
  isSignedIn: boolean;
  userData: any;
}

function Home({ isSignedIn, userData }: HomeProps) {
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
                   <div className="text-green-700 text-sm mt-1">
                     <p>
                       Signed in as: {userData.name || userData.username || userData.displayName || 'User'} ({userData.email})
                     </p>
                   </div>
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
  const { isSignedIn, userData, signIn, signOut, refreshSession } = useSession();
  const navigate = useNavigate();

  const handleSignIn = (userData?: any, redirectTo?: string) => {
    if (userData) {
      signIn(userData);
      console.log('User signed in:', userData);
      console.log('User data structure:', {
        name: userData.name,
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
        avatar_url: userData.avatar_url,
        picture: userData.picture
      });
    }
    
    // Redirect to specified path or default to home
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked - redirecting to home page');
    signOut();
    
    // Force redirect to home page
    window.location.href = '/';
  };

  return (
    <>
      <Navbar isSignedIn={isSignedIn} onLogout={handleLogout} userData={userData} />
      <Routes>
        <Route path="/" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/football-leagues" element={<LiveUpcomingPastMatches />} />
        {/* Catch all route to ensure navigation works */}
        <Route path="*" element={<Home isSignedIn={isSignedIn} userData={userData} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
   // //<BrowserRouter>
      <AppContent />
 // //  </BrowserRouter>
  );
}