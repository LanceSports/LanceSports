import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithCacheJSON } from './lib/cache';
import { Filter, X } from 'lucide-react';

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
      setLoading(true);
      try {
        // Use local date to avoid timezone off-by-one issues
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;
        const url = `https://lancesports-fixtures-api.onrender.com/fixtures?date=${currentDate}`;
        const {data} = await fetchWithCacheJSON<Fixture[]>(url, 5 * 60 * 1000);

// response is the array of fixtures
        setFixtures(data || []);

        // Log size in KB
        console.log(data)
        const jsonSize = new Blob([JSON.stringify(data)]).size / 1024;
        console.log(`API response size: ${jsonSize.toFixed(2)} KB`);

        //setFixtures(data.fixtures || []);
      } catch (err) {
        console.error('Error fetching fixtures:', err);
      } finally {
        setLoading(false);
      }
    };
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
        <h2 className="text-xl text-gray-100 mb-4 text-center">🔴 Live Matches</h2>
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
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

const MatchCard: React.FC<{ match: Fixture; vertical?: boolean }> = ({ 
  match, 
  vertical = false 
}) => {
  const { fixture, league, teams, goals } = match;
  const date = new Date(fixture.date).toLocaleString();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/match', { state: { match } });
  };

  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(fixture.status.short);
  const isCancelled = ['CANC', 'ABD', 'AWD', 'WO'].includes(fixture.status.short);

  return (
    <button
      onClick={handleClick}
      className={`
        glass-card-dark glass-hover-dark glass-glow
        rounded-lg p-4 border border-green-800/30
        transition-all duration-300 cursor-pointer
        hover:border-green-600/50 hover:scale-[1.02]
        active:scale-[0.98]
        ${vertical 
          ? 'w-full block' 
          : 'min-w-[280px] flex-shrink-0'
        }
        ${isLive ? 'ring-2 ring-green-500/50 shadow-green-500/20' : ''}
        ${isCancelled ? 'opacity-60' : ''}
      `}
    >
      {/* League and Date */}
      <div className="text-center mb-4
      ">
        <div className="flex items-left justify-center gap-2 mb-1">
           <div className="text-xs text-white-200">
            {league.name}
          </div>
          <br/>
          <img
          style={{height:80, width:100}}
            src={league.logo} 
            alt={league.name}
            className="rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="text-xs-center text-gray-500">
          {date}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden glass-dark ring-1 ring-green-800/30">
            <img 
              src={teams.home.logo} 
              alt={teams.home.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaTTEzIDE3SDExVjE1SDEzVjE3Wk0xMyAxM0gxMVY3SDEzVjEzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';
              }}
            />
          </div>
          <p className="text-sm text-gray-200 truncate px-1">
            {teams.home.name}
          </p>
          {teams.home.winner && (
            <div className="text-xs text-green-400 mt-1">👑</div>
          )}
        </div>

        {/* Score */}
        <div className="px-4">
          <div className={`
            text-lg font-mono
            ${isLive ? 'text-green-400 animate-pulse' : 'text-gray-100'}
            ${isFinished ? 'text-blue-400' : ''}
            ${isCancelled ? 'text-red-400' : ''}
          `}>
            {goals.home ?? '-'} : {goals.away ?? '-'}
          </div>
          {isLive && fixture.status.elapsed && (
            <div className="text-xs text-green-400 mt-1">
              {fixture.status.elapsed}'
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden glass-dark ring-1 ring-green-800/30">
            <img 
              src={teams.away.logo} 
              alt={teams.away.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaTTEzIDE3SDExVjE1SDEzVjE3Wk0xMyAxM0gxMVY3SDEzVjEzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';
              }}
            />
          </div>
          <p className="text-sm text-gray-200 truncate px-1">
            {teams.away.name}
          </p>
          {teams.away.winner && (
            <div className="text-xs text-green-400 mt-1">👑</div>
          )}
        </div>
      </div>

      {/* Match Status */}
      <div className="text-center mt-3">
        <span className={`
          text-xs px-3 py-1 rounded-full
          ${isLive 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : isFinished
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : isCancelled
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
          }
        `}>
          {isLive && '🔴 '}
          {fixture.status.long}
          {isLive && fixture.status.elapsed && ` (${fixture.status.elapsed}')`}
        </span>
      </div>

      {/* Additional Info for Live Matches */}
      {isLive && (
        <div className="mt-2 text-center">
          <div className="text-xs text-green-400/70">
            {league.round}
          </div>
        </div>
      )}
    </button>
  );
};

export default LiveUpcomingPastMatches;