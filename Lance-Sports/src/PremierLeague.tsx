import React, { useState, useEffect } from 'react';
// Using backend proxy (CORS enabled)
import './prem.css'
import { Toaster } from './components/ui/sonner';
import { HeaderBar } from './components/HeaderBar';
import { LiveOverlay } from './components/LiveOverlay';
import { Setup } from './components/Setup';
import { MatchProvider } from './hooks/useMatchStore';
import { fetchWithCacheJSON } from './lib/cache';


export function PremierLeague() {
  const [currentPage, setCurrentPage] = useState<'live' | 'setup'>('live');
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use backend proxy to fetch fixtures (avoids CORS to external API)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        // @ts-ignore - Vite provides import.meta.env
        const base = (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api');
        const url = `${base}/fixtures?date=${currentDate}`;
        const { data } = await fetchWithCacheJSON<{ fixtures: any[] }>(url, 5 * 60 * 1000);
        setFixtures((data?.fixtures || []) as any[]);
      } catch (err) {
        // @ts-ignore
        setError(err.message || String(err));
        console.error('API Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  if (loading) return <div>Loading fixtures...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div className='prempage'>
 <MatchProvider>
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <main className="min-h-[calc(100vh-4rem)]">
          {currentPage === 'setup' ? (
            <Setup />
          ) : (
            <LiveOverlay />
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