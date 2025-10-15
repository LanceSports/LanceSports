import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithCacheJSON } from './lib/cache';
import { Filter, X } from 'lucide-react';
import MatchCard from './MatchCard';

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

const LiveUpcomingPastMatches: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    league: '',
    country: '',
    status: 'all'
  });

  useEffect(() => {
    const load = async () => {
      setLoading(false); // make it true when you want to actually fetch from api and not use mock
      try {
        console.log("in try catch");
        // Use local date to avoid timezone off-by-one issues
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;
        const url = `https://lancesports-fixtures-api.onrender.com/leagueFixtures`;
        
        // Mock data for testing UI look when API is offline
        const mockFixtures: Fixture[] = [
          {
            fixture: {
              id: 1,
              referee: "John Smith",
              timezone: "UTC",
              date: new Date().toISOString(),
              timestamp: Math.floor(Date.now() / 1000),
              periods: { first: 45, second: null },
              venue: { id: 1, name: "Old Trafford", city: "Manchester" },
              status: { long: "First Half", short: "1H", elapsed: 23, extra: null }
            },
            league: {
              id: 39,
              name: "Premier League",
              country: "England",
              logo: "https://media.api-sports.io/football/leagues/39.png",
              flag: "https://media.api-sports.io/flags/gb.svg",
              season: 2024,
              round: "Regular Season - 15",
              standings: true
            },
            teams: {
              home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png", winner: null },
              away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png", winner: null }
            },
            goals: { home: 1, away: 0 },
            score: {
              halftime: { home: null, away: null },
              fulltime: { home: null, away: null },
              extratime: { home: null, away: null },
              penalty: { home: null, away: null }
            }
          }
        ];
        //uncommnet below when api is live
        //const {data} = await fetchWithCacheJSON<Fixture[]>(url, 5 * 60 * 1000);

// response is the array of fixtures
// For now, use mock data instead of API call

        setFixtures(mockFixtures || []);/* coment out below when api is live */

        // Log size in KB
        //uncoment for when API is live {
      //  console.log(data)
       // const jsonSize = new Blob([JSON.stringify(data)]).size / 1024;
       // console.log(`API response size: ${jsonSize.toFixed(2)} KB`);
        //setFixtures(data.fixtures || []);
        // }
      } catch (err) {
        console.error('Error fetching fixtures:', err);
      } finally {
        setLoading(false);
      }
    };
    console.log("object");
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 flex items-center justify-center">
        <div className="relative inline-block flex items-center justify-center">
 
          <div className="absolute -top-8 left-[100%] transform -translate-x-1/2" style={{ marginLeft: '700px', marginTop:'500px' }}>
            <span className="text-gray-100 text-lg font-medium glass-card-dark px-4 py-2 rounded-lg animate-pulse whitespace-nowrap l-3">
              Loading matches...
            </span>
            
          </div>
          <img 
            src='/images/img2.png' 
            alt="Loading"
            className="h-6 w-6 rounded"
            style={{
              animation: 'opacityEase 4s ease-in-out infinite'
            }}
          />
        </div>
      </div>
    );
  }

  const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'P']);
  const finishedStatuses = new Set(['FT', 'AET', 'PEN']);
  const upcomingStatuses = new Set(['NS', 'TBD', 'PST']);
  const cancelledStatuses = new Set(['CANC', 'ABD', 'AWD', 'WO']);

  const getBucket = (short: string) => {
    if (finishedStatuses.has(short) || cancelledStatuses.has(short)) return 'past';
    if (upcomingStatuses.has(short)) return 'upcoming';
    if (liveStatuses.has(short)) return 'live';
    // Fallback: if unknown, assume live to surface it
    return 'live';
  };

  // Apply filters
  const applyFilters = (fixturesList: Fixture[]) => {
    return fixturesList.filter(fixture => {
      if (filters.league && !fixture.league.name.toLowerCase().includes(filters.league.toLowerCase())) {
        return false;
      }
      if (filters.country && !fixture.league.country.toLowerCase().includes(filters.country.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const allLiveMatches = fixtures.filter((f) => getBucket(f.fixture.status.short) === 'live');
  const allUpcomingMatches = fixtures.filter((f) => getBucket(f.fixture.status.short) === 'upcoming');
  const allPastMatches = fixtures.filter((f) => getBucket(f.fixture.status.short) === 'past');

  const liveMatches = filters.status === 'all' || filters.status === 'live' 
    ? applyFilters(allLiveMatches) 
    : [];
  const upcomingMatches = filters.status === 'all' || filters.status === 'upcoming' 
    ? applyFilters(allUpcomingMatches) 
    : [];
  const pastMatches = filters.status === 'all' || filters.status === 'past' 
    ? applyFilters(allPastMatches) 
    : [];

  // Get unique leagues and countries for filter options
  const uniqueLeagues = Array.from(new Set(fixtures.map(f => f.league.name))).sort();
  const uniqueCountries = Array.from(new Set(fixtures.map(f => f.league.country))).sort();

  const clearFilters = () => {
    setFilters({
      league: '',
      country: '',
      status: 'all'
    });
  };

  const hasActiveFilters = filters.league || filters.country || filters.status !== 'all';


  //  WHAT WE DSISPLAY IN lIVEUPCOMING ETC  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 p-5">
      {/* Header with Filter Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-100">Sports Fixtures</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            glass-card-dark glass-hover-dark p-3 rounded-lg 
            border border-green-800/30 transition-all duration-300
            flex items-center space-x-2
            ${showFilters ? 'ring-2 ring-green-500/50' : ''}
            ${hasActiveFilters ? 'bg-green-600/20 border-green-600/50' : ''}
          `}
        >
          <Filter className="w-4 h-4 text-green-400" />
          <span className="text-gray-100 text-sm">Filters</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card-dark rounded-xl p-4 mb-6 glass-glow border border-green-800/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-100">Filter Options</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* League Filter */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">League</label>
              <select
                value={filters.league}
                onChange={(e) => setFilters(prev => ({...prev, league: e.target.value}))}
                className="w-full glass-dark rounded-lg px-3 py-2 text-gray-100 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              >
                <option value="">All Leagues</option>
                {uniqueLeagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Country</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters(prev => ({...prev, country: e.target.value}))}
                className="w-full glass-dark rounded-lg px-3 py-2 text-gray-100 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                className="w-full glass-dark rounded-lg px-3 py-2 text-gray-100 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              >
                <option value="all">All Matches</option>
                <option value="live">Live Only</option>
                <option value="upcoming">Upcoming Only</option>
                <option value="past">Past Only</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={`
                  w-full px-4 py-2 rounded-lg transition-all duration-200
                  ${hasActiveFilters 
                    ? 'glass-green-dark text-green-400 hover:bg-green-600/30 border border-green-600/50' 
                    : 'glass-dark text-gray-500 cursor-not-allowed border border-gray-700/50'
                  }
                `}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-green-800/30">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {filters.league && (
                  <span className="glass-green-dark px-2 py-1 rounded text-xs text-green-400 border border-green-600/30">
                    League: {filters.league}
                  </span>
                )}
                {filters.country && (
                  <span className="glass-green-dark px-2 py-1 rounded text-xs text-green-400 border border-green-600/30">
                    Country: {filters.country}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="glass-green-dark px-2 py-1 rounded text-xs text-green-400 border border-green-600/30">
                    Status: {filters.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Matches Section */}
      <div className="glass-card-dark rounded-xl p-4 mb-6 glass-glow">
        <h2 className="text-xl text-red-100 mb-4 text-center">🔴 Live Matches</h2>
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track">
          {liveMatches.length > 0 ? (
            liveMatches.map((match) => <MatchCard key={match.fixture.id} match={match} />)
          ) : (
            <div className="w-full text-center text-gray-400 py-8">
              <div className="glass-dark rounded-lg p-4">
                <div className="text-gray-500 mb-2">⚽</div>
                <p>No live matches currently</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming and Past Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <div className="glass-card-dark rounded-xl p-4 glass-hover-dark glass-glow">
          <h2 className="text-xl text-gray-100 mb-4 text-center">⏰ Upcoming Matches</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard key={match.fixture.id} match={match} vertical />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-500 mb-2">📅</div>
                  <p>No upcoming matches</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Past Matches */}
        <div className="glass-card-dark rounded-xl p-4 glass-hover-dark glass-glow">
          <h2 className="text-xl text-gray-100 mb-4 text-center">📊 Past Matches</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
            {pastMatches.length > 0 ? (
              pastMatches.map((match) => (
                <MatchCard key={match.fixture.id} match={match} vertical />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="glass-dark rounded-lg p-4">
                  <div className="text-gray-500 mb-2">📈</div>
                  <p>No past matches</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUpcomingPastMatches;