import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { HeaderBar } from './components/HeaderBar';
import { LiveOverlay } from './components/LiveOverlay';
import { Setup } from './components/Setup';
import { MatchProvider } from './hooks/useMatchStore';
import './prem.css'

export function PremierLeague() {
  const [currentPage, setCurrentPage] = useState<'live' | 'setup'>('live');
  const [fixtures, setFixtures] = useState([]); // For live or upcoming fixtures
  const [teams, setTeams] = useState([]); // For teams in setup
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '';
  const BASE_URL = 'https://v3.football.api-sports.io';
  const LEAGUE_ID = 39; // Premier League ID
  const SEASON = 2025; // Adjust based on current season (e.g., 2025 for 2025/26)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let fixtureUrl;
        if (currentPage === 'live') {
          // Fetch live fixtures for Premier League
          fixtureUrl = `${BASE_URL}/fixtures?live=${LEAGUE_ID}`;
        } else {
          // Fetch upcoming fixtures and teams for setup
          fixtureUrl = `${BASE_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&next=10`;
          const teamsResponse = await fetch(`${BASE_URL}/teams?league=${LEAGUE_ID}&season=${SEASON}`, {
            headers: { 'x-apisports-key': API_KEY },
          });
          if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
          const teamsData = await teamsResponse.json();
          setTeams(teamsData.response || []);
        }

        const fixturesResponse = await fetch(fixtureUrl, {
          headers: { 'x-apisports-key': API_KEY },
        });
        if (!fixturesResponse.ok) throw new Error('Failed to fetch fixtures');
        const fixturesData = await fixturesResponse.json();
        setFixtures(fixturesData.response || []);
      } catch (err) {
        setError(err.message);
        console.error('API Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (API_KEY) {
      fetchData();
    } else {
      console.warn('API key missing; using dummy mode or skipping fetch.');
      setLoading(false); // Fallback to dummy if no key
    }
  }, [currentPage, API_KEY]);

  if (loading) return <div>Loading data from API-Football...</div>;
  if (error) return <div>Error: {error} (Check API key or network)</div>;

  return (
    <div className='prempage'>
 <MatchProvider>
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <main className="min-h-[calc(100vh-4rem)]">
          {currentPage === 'setup' ? (
            <Setup fixtures={fixtures} teams={teams} />
          ) : (
            <LiveOverlay fixtures={fixtures} />
          )}
        </main>
        <footer className="border-t bg-muted/50 py-6 mt-12">
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
                {/* <span className="text-xs">v1.0.0</span> */}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>h Press G for Goal</span>
                <span>🟡 Press Y for Yellow Card</span>
                <span>🟥 Press R for Red Card</span>
                <span>⚽ Press P for Pause/Resume</span>
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