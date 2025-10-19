import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import { ChatbotButton } from './ChatbotButton';
import { fetchLeagueFixtures, ApiFixture } from './lib/footyApi';
import { getLeagueFixtures, onFixturesReady } from './lib/globalFixtures';

type Match = ApiFixture;

export function ChampionsLeague() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [matchTab, setMatchTab] = useState<'live' | 'upcoming' | 'past'>('upcoming');

  // 🔽 NEW: team filter state
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError(null);
      setDataLoaded(false);

      try {
        let response = getLeagueFixtures();
        if (!response) {
          response = await fetchLeagueFixtures();
        }

        // Prefer UCL; fallback to another European competition if needed
        const championsLeagueData =
          response.results.find(
            (league) =>
              league.league === 'UCL' ||
              league.league === 'Champions League' ||
              league.league.toLowerCase().includes('champions') ||
              league.league.toLowerCase().includes('uefa')
          ) ?? null;

        if (championsLeagueData) {
          setMatches(championsLeagueData.fixtures);
          setDataLoaded(true);

          if (championsLeagueData.fixtures.length === 0) {
            setError('Champions League data is currently unavailable - no fixtures found');
          }
        } else {
          const europeanLeagueData =
            response.results.find(
              (league) =>
                league.league.toLowerCase().includes('europa') ||
                league.league.toLowerCase().includes('europe')
            ) ?? null;

          if (europeanLeagueData) {
            setMatches(europeanLeagueData.fixtures);
            setDataLoaded(true);

            if (europeanLeagueData.fixtures.length === 0) {
              setError('European competition data is currently unavailable - no fixtures found');
            }
          } else {
            setError('No Champions League fixtures found');
            setDataLoaded(true);
          }
        }
      } catch (err) {
        console.error('❌ Failed to load matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to load matches');
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

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

      const championsLeagueData =
        response.results.find(
          (league) =>
            league.league === 'UCL' ||
            league.league === 'Champions League' ||
            league.league.toLowerCase().includes('champions') ||
            league.league.toLowerCase().includes('uefa')
        ) ?? null;

      if (championsLeagueData) {
        setMatches(championsLeagueData.fixtures);
        setDataLoaded(true);
      } else {
        const europeanLeagueData =
          response.results.find(
            (league) =>
              league.league.toLowerCase().includes('europa') ||
              league.league.toLowerCase().includes('europe')
          ) ?? null;

        if (europeanLeagueData) {
          setMatches(europeanLeagueData.fixtures);
          setDataLoaded(true);
        } else {
          setError('No Champions League fixtures found');
          setDataLoaded(true);
        }
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

  // 🔽 NEW: compute unique teams for the dropdown (memoized)
  const uniqueTeams = useMemo(() => {
    const map = new Map<number, { id: number; name: string; logo: string }>();
    for (const m of matches) {
      map.set(m.teams.home.id, { id: m.teams.home.id, name: m.teams.home.name, logo: m.teams.home.logo });
      map.set(m.teams.away.id, { id: m.teams.away.id, name: m.teams.away.name, logo: m.teams.away.logo });
    }
    // sort alphabetically by name for nicer UX
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [matches]);

  // 🔽 Apply existing time-status filter, then team filter (logic unchanged otherwise)
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
              UEFA Champions League
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The most prestigious club competition in European football
          </p>
        </div>

        {/* 🔽 NEW: Team filter (kept minimal to not change existing UI; uses same styling language) */}
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

        {/* Match Sub-Tabs (old styling) */}
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
          // Old UI’s skeleton loaders
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

            {error.includes('no fixtures found') ? (
              <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className="text-blue-300 text-sm">
                  ℹ️ The API is working but currently has no fixture data. This might be because:
                </p>
                <ul className="text-blue-200 text-sm mt-2 text-left">
                  <li>• Season hasn&apos;t started yet</li>
                  <li>• Data is being updated</li>
                  <li>• API is temporarily out of sync</li>
                </ul>
              </div>
            ) : null}

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
