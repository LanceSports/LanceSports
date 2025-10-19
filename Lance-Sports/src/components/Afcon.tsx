import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import { ChatbotButton } from './ChatbotButton';
import { fetchLeagueFixtures, ApiFixture } from './lib/footyApi';
import { getLeagueFixtures, onFixturesReady } from './lib/globalFixtures';

type Match = ApiFixture;

export function Afcon() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [matchTab, setMatchTab] = useState<'live' | 'upcoming' | 'past'>('upcoming');

  // Team filter
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError(null);
      setDataLoaded(false);

      try {
        let response = getLeagueFixtures();
        if (!response) {
          // wait for network fetch
          response = await fetchLeagueFixtures();
        }

        // Find Premier Soccer League (PSL) fixtures robustly
        const pslData =
          response.results.find((league) => {
            const name = String(league.league || '').toLowerCase();
            // match common variants: exact, contains, or acronym
            return (
              name === 'premier soccer league' ||
              name.includes('premier soccer') ||
              name.includes('premier soccer league') ||
              name === 'psl' ||
              name.includes('psl')
            );
          }) ?? null;

        if (pslData && Array.isArray(pslData.fixtures)) {
          setMatches(pslData.fixtures);
          setDataLoaded(true);

          if (pslData.fixtures.length === 0) {
            setError('PSL data is currently unavailable — no fixtures found');
          }
        } else {
          setError('No PSL fixtures found');
          setDataLoaded(true);
        }
      } catch (err) {
        console.error('❌ Failed to load matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to load matches');
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    // If global cache populates later, re-run matcher when ready
    const unsub = onFixturesReady(() => loadMatches());
    loadMatches();
    return () => unsub();
  }, []);

  const handleMatchClick = (match: Match) => {
    navigate('/match', { state: { match } });
  };

  const retryLoading = async () => {
    setLoading(true);
    setError(null);
    setDataLoaded(false);

    try {
      const response = await fetchLeagueFixtures();

      const pslData =
        response.results.find((league) => {
          const name = String(league.league || '').toLowerCase();
          return (
            name === 'premier soccer league' ||
            name.includes('premier soccer') ||
            name.includes('psl') ||
            name.includes('africa cup') ||
            name.includes('african cup of nations') ||
            name.includes('africa cup of nations')
          );
        }) ?? null;

      if (pslData && Array.isArray(pslData.fixtures)) {
        setMatches(pslData.fixtures);
        setDataLoaded(true);
      } else {
        setError('No PSL fixtures found');
        setDataLoaded(true);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load matches');
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = (list: Match[]) => {
    const now = new Date();

    switch (matchTab) {
      case 'live':
        return list.filter((m) => ['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture.status.short));
      case 'upcoming':
        return list.filter((m) => m.fixture.status.short === 'NS' && new Date(m.fixture.date) > now);
      case 'past':
        return list.filter(
          (m) =>
            ['FT', 'AET', 'PEN'].includes(m.fixture.status.short) ||
            (m.fixture.status.short === 'NS' && new Date(m.fixture.date) < now)
        );
      default:
        return list;
    }
  };

  // Unique teams for the dropdown
  const uniqueTeams = useMemo(() => {
    const map = new Map<number, { id: number; name: string; logo: string }>();
    for (const m of matches) {
      map.set(m.teams.home.id, { id: m.teams.home.id, name: m.teams.home.name, logo: m.teams.home.logo });
      map.set(m.teams.away.id, { id: m.teams.away.id, name: m.teams.away.name, logo: m.teams.away.logo });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [matches]);

  // Apply time-status filter, then team filter
  const filteredMatches = filterMatches(matches).filter(
    (m) =>
      teamFilter === 'all' ||
      m.teams.home.id === teamFilter ||
      m.teams.away.id === teamFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="text-green-400" size={40} />
            <h1 className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-400">
              PSL (MZANSI)
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The premier tournament in South African football
          </p>
        </div>

        {/* Team filter */}
        <div className="mb-4 flex justify-center">
          <div className="glass-card-dark rounded-xl px-3 py-2 flex items-center gap-3">
            <span className="text-sm text-gray-300">Team:</span>
            <select
              value={teamFilter === 'all' ? 'all' : String(teamFilter)}
              onChange={(e) =>
                setTeamFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-transparent text-gray-200 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-600/40"
            >
              <option value="all" className="bg-gray-900">
                All teams
              </option>
              {uniqueTeams.map((t) => (
                <option key={t.id} value={t.id} className="bg-gray-900">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Match Sub-Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-2 glass-card-dark p-2 rounded-xl inline-flex">
            {(['live', 'upcoming', 'past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMatchTab(tab)}
                className={`px-6 py-2 rounded-lg capitalize transition-all duration-200 ${
                  matchTab === tab
                    ? 'glass-green-dark text-green-400 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
                {tab === 'live' && (
                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                {loading && (
                  <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card-dark p-6 rounded-xl animate-pulse">
                <div className="h-24 bg-white/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error && dataLoaded ? (
          <div className="glass-card-dark p-12 rounded-xl text-center">
            <Trophy className="mx-auto mb-4 text-gray-500" size={48} />
            <h3 className="text-xl text-gray-300 mb-2">
              {error.includes('no fixtures found')
                ? 'No Data Available'
                : error.includes('too long to respond')
                ? 'API Taking Too Long'
                : 'Error Loading Matches'}
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>

            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : dataLoaded && filteredMatches.length === 0 ? (
          <div className="glass-card-dark p-12 rounded-xl text-center">
            <Trophy className="mx-auto mb-4 text-gray-500" size={48} />
            <h3 className="text-xl text-gray-300 mb-2">No matches found</h3>
            <p className="text-gray-400">
              {matchTab === 'live' && 'No live matches at the moment'}
              {matchTab === 'upcoming' && 'No upcoming matches scheduled'}
              {matchTab === 'past' && 'No past matches available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard key={match.fixture.id} match={match} onClick={() => handleMatchClick(match)} />
            ))}
          </div>
        )}
      </main>
      <ChatbotButton />
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

function MatchCard({ match, onClick }: MatchCardProps) {
  const { fixture, teams, goals, league } = match;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(fixture.status.short);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      onClick={onClick}
      className="glass-card-dark p-6 rounded-xl cursor-pointer glass-hover-dark glass-glow group"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE {fixture.status.elapsed}'
            </span>
          )}
          {isFinished && (
            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
              FT
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="px-3 py-1 glass-green-dark text-green-400 rounded-full text-xs">
              {formatTime(fixture.date)}
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-4 mb-4">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img
              src={teams.home.logo}
              alt={teams.home.name}
              className="w-8 h-8 object-contain"
            />
            <span className="text-gray-200 group-hover:text-white transition-colors">
              {teams.home.name}
            </span>
          </div>
          {goals.home !== null && (
            <span className="text-2xl text-green-400 ml-2">
              {goals.home}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img
              src={teams.away.logo}
              alt={teams.away.name}
              className="w-8 h-8 object-contain"
            />
            <span className="text-gray-200 group-hover:text-white transition-colors">
              {teams.away.name}
            </span>
          </div>
          {goals.away !== null && (
            <span className="text-2xl text-green-400 ml-2">
              {goals.away}
            </span>
          )}
        </div>
      </div>

      {/* Match Info */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Calendar size={14} />
          <span>{formatDate(fixture.date)}</span>
        </div>
        {fixture.venue && fixture.venue.name && (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <MapPin size={14} />
            <span>{fixture.venue.name}, {fixture.venue.city}</span>
          </div>
        )}
        {league.round && (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Trophy size={14} />
            <span>{league.round}</span>
          </div>
        )}
      </div>
    </div>
  );
}
