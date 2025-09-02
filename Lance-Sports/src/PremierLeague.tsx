import React, { useState, useEffect } from 'react';
// Using backend proxy (CORS enabled)
import './prem.css'
import { Toaster } from './components/ui/sonner';
import { HeaderBar } from './components/HeaderBar';
import { LiveOverlay } from './components/LiveOverlay';
import { Setup } from './components/Setup';
import { MatchProvider } from './hooks/useMatchStore';
import { useLocation } from 'react-router-dom';

interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: { first: number | null; second: number | null };
    venue: { id: number | null; name: string | null; city: string | null };
    status: { long: string; short: string; elapsed: number | null; extra: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}


// const MatchPage = () => {
  
//   // Use match data for rendering
// };
export function PremierLeague() {
  const [currentPage, setCurrentPage] = useState<'live' | 'setup' | 'match'>('live');
  const { state } = useLocation();
  const match = state?.match as Fixture | undefined;
  const initialPage = state?.currentPage as 'live' | 'setup' | 'match' | undefined;
  console.log(match);
  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  return (
    <div className="prempage">
      <MatchProvider>
        <div className="min-h-screen bg-background">
          <HeaderBar />
         <main className="min-h-[calc(100vh-4rem)]">
  {currentPage === 'setup' ? (
    <Setup />
  ) : currentPage === 'match' && match ? (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {match.teams.home.name} vs {match.teams.away.name}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="text-center mb-4 text-gray-600 text-sm">
          {match.league.name} | {match.league.country} | Round: {match.league.round}
        </div>
        <div className="text-center mb-4 text-gray-600 text-sm">
          {new Date(match.fixture.date).toLocaleString()} | {match.fixture.timezone}
        </div>
        <div className="text-center mb-4 text-gray-600 text-sm">
          Venue: {match.fixture.venue.name}, {match.fixture.venue.city}
        </div>
        {match.fixture.referee && (
          <div className="text-center mb-4 text-gray-600 text-sm">Referee: {match.fixture.referee}</div>
        )}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center flex-1">
            <img
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              className="w-16 h-16 mx-auto"
            />
            <p className="mt-2 text-base text-gray-800">{match.teams.home.name}</p>
            {match.teams.home.winner && <p className="text-sm text-green-600">Winner</p>}
          </div>
          <div className="text-xl font-bold text-gray-800 px-5">
            {match.goals.home ?? '-'} : {match.goals.away ?? '-'}
          </div>
          <div className="text-center flex-1">
            <img
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              className="w-16 h-16 mx-auto"
            />
            <p className="mt-2 text-base text-gray-800">{match.teams.away.name}</p>
            {match.teams.away.winner && <p className="text-sm text-green-600">Winner</p>}
          </div>
        </div>
        <div className="text-center mb-4 text-gray-600 text-sm">
          Halftime: {match.score.halftime.home ?? '-'} : {match.score.halftime.away ?? '-'}
        </div>
        <div className="text-center mb-4 text-gray-600 text-sm">
          Fulltime: {match.score.fulltime.home ?? '-'} : {match.score.fulltime.away ?? '-'}
        </div>
        {match.score.extratime.home !== null && match.score.extratime.away !== null && (
          <div className="text-center mb-4 text-gray-600 text-sm">
            Extratime: {match.score.extratime.home} : {match.score.extratime.away}
          </div>
        )}
        {match.score.penalty.home !== null && match.score.penalty.away !== null && (
          <div className="text-center mb-4 text-gray-600 text-sm">
            Penalty: {match.score.penalty.home} : {match.score.penalty.away}
          </div>
        )}
        <div className="text-center mb-4 text-gray-600 text-sm">
          Periods: First Half Start: {match.fixture.periods.first ? new Date(match.fixture.periods.first).toLocaleString() : '-'}
          {' | '}Second Half Start: {match.fixture.periods.second ? new Date(match.fixture.periods.second).toLocaleString() : '-'}
        </div>
        <div
          className={`text-center mt-4 text-sm ${
            match.fixture.status.long === 'First Half' || match.fixture.status.short === '1H'
              ? 'text-green-600 font-bold'
              : 'text-gray-600'
          }`}
        >
          Status: {match.fixture.status.long} {match.fixture.status.elapsed ? `(${match.fixture.status.elapsed} min)` : ''}
          {match.fixture.status.extra ? ` +${match.fixture.status.extra} min` : ''}
        </div>
      </div>
    </div>
  ) : (
    <LiveOverlay />
  )}
</main>         <footer className="border-t bg-muted/50 py-6 mt-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-muted-foreground">
                    © 2025 LanceSports. Live broadcasting made simple.
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <button
                    onClick={() => setCurrentPage('live')}
                    className={`hover:text-foreground transition-colors ${
                      currentPage === 'live' ? 'text-primary font-medium' : ''
                    }`}
                  >
                    Live Overlay
                  </button>
                  <button
                    onClick={() => setCurrentPage('setup')}
                    className={`hover:text-foreground transition-colors ${
                      currentPage === 'setup' ? 'text-primary font-medium' : ''
                    }`}
                  >
                    Match Setup
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>⚽ Press G for Goal</span>
                  <span>🟡 Press Y for Yellow Card</span>
                  <span>🟥 Press R for Red Card</span>
                  <span>⏯️ Press P for Pause/Resume</span>
                </div>
              </div>
            </div>
          </footer>
          <Toaster />
        </div>
      </MatchProvider>
    </div>
  );
}