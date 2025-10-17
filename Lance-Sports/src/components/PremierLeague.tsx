import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin } from 'lucide-react';
import { ChatbotButton } from './ChatbotButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { fetchLeagueFixtures, ApiFixture } from './lib/footyApi';

// Loading timer component
function LoadingTimer({ startTime }: { startTime: number | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="mt-2 text-center">
      <span className="text-green-400 text-sm">
        ⏱️ Loading time: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

type Match = ApiFixture;

interface StandingsTeam {
  position: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function PremierLeague() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches');
  const [matchTab, setMatchTab] = useState<'live' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const loadMatches = async () => {
      console.log('🔄 Starting to load matches...');
      setLoading(true);
      setError(null);
      setDataLoaded(false);
      setLoadingStartTime(Date.now());
      
      try {
        console.log('📡 Fetching from API...');
        const response = await fetchLeagueFixtures();
        console.log('✅ API Response received:', response);
        
        // Find Premier League fixtures
        const premierLeagueData = response.results.find(league => 
          league.league === 'EPL' || 
          league.league === 'Premier League' ||
          league.league.toLowerCase().includes('premier')
        );
        
        if (premierLeagueData) {
          console.log('⚽ Premier League data found:', premierLeagueData.league, 'with', premierLeagueData.fixtures.length, 'fixtures');
          setMatches(premierLeagueData.fixtures);
          setDataLoaded(true);
          
          // Check if Premier League has no fixtures
          if (premierLeagueData.fixtures.length === 0) {
            console.log('⚠️ Premier League found but has no fixtures');
            setError('Premier League data is currently unavailable - no fixtures found');
          }
        } else {
          // Fallback: look for any English league
          const englishLeagueData = response.results.find(league => 
            league.league.toLowerCase().includes('england') ||
            league.league.toLowerCase().includes('championship')
          );
          
          if (englishLeagueData) {
            console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 English league data found:', englishLeagueData.league, 'with', englishLeagueData.fixtures.length, 'fixtures');
            setMatches(englishLeagueData.fixtures);
            setDataLoaded(true);
            
            // Check if English league has no fixtures
            if (englishLeagueData.fixtures.length === 0) {
              console.log('⚠️ English league found but has no fixtures');
              setError('English league data is currently unavailable - no fixtures found');
            }
          } else {
            console.log('❌ No Premier League or English league found. Available leagues:', response.results.map(r => r.league));
            setError('No Premier League fixtures found');
            setDataLoaded(true);
          }
        }
      } catch (err) {
        console.error('❌ Failed to load matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to load matches');
        setDataLoaded(true);
      } finally {
        console.log('🏁 Loading completed');
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleMatchClick = (match: Match) => {
    navigate('/match', { state: { match } });
  };

  const retryLoading = async () => {
    setLoading(true);
    setError(null);
    setDataLoaded(false);
    setLoadingStartTime(Date.now());
    
    try {
      const response = await fetchLeagueFixtures();
      
      // Find Premier League fixtures
      const premierLeagueData = response.results.find(league => 
        league.league === 'EPL' || 
        league.league === 'Premier League' ||
        league.league.toLowerCase().includes('premier')
      );
      
      if (premierLeagueData) {
        setMatches(premierLeagueData.fixtures);
        setDataLoaded(true);
      } else {
        // Fallback: look for any English league
        const englishLeagueData = response.results.find(league => 
          league.league.toLowerCase().includes('england') ||
          league.league.toLowerCase().includes('championship')
        );
        
        if (englishLeagueData) {
          setMatches(englishLeagueData.fixtures);
          setDataLoaded(true);
        } else {
          setError('No Premier League fixtures found');
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

  const filterMatches = (matches: Match[]) => {
    const now = new Date();
    
    switch (matchTab) {
      case 'live':
        return matches.filter(m => ['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture.status.short));
      case 'upcoming':
        return matches.filter(m => 
          m.fixture.status.short === 'NS' && new Date(m.fixture.date) > now
        );
      case 'past':
        return matches.filter(m => 
          ['FT', 'AET', 'PEN'].includes(m.fixture.status.short) || 
          (m.fixture.status.short === 'NS' && new Date(m.fixture.date) < now)
        );
      default:
        return matches;
    }
  };

  const filteredMatches = filterMatches(matches);

  // Mock Premier League standings data
  const standings: StandingsTeam[] = [
    { position: 1, team: { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' }, played: 27, won: 20, drawn: 5, lost: 2, goalsFor: 65, goalsAgainst: 22, goalDifference: 43, points: 65 },
    { position: 2, team: { id: 157, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' }, played: 27, won: 19, drawn: 4, lost: 4, goalsFor: 62, goalsAgainst: 28, goalDifference: 34, points: 61 },
    { position: 3, team: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' }, played: 27, won: 18, drawn: 6, lost: 3, goalsFor: 58, goalsAgainst: 25, goalDifference: 33, points: 60 },
    { position: 4, team: { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' }, played: 27, won: 16, drawn: 5, lost: 6, goalsFor: 52, goalsAgainst: 35, goalDifference: 17, points: 53 },
    { position: 5, team: { id: 50, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/50.png' }, played: 27, won: 14, drawn: 7, lost: 6, goalsFor: 48, goalsAgainst: 32, goalDifference: 16, points: 49 },
    { position: 6, team: { id: 34, name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png' }, played: 27, won: 13, drawn: 6, lost: 8, goalsFor: 45, goalsAgainst: 38, goalDifference: 7, points: 45 },
    { position: 7, team: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' }, played: 27, won: 12, drawn: 7, lost: 8, goalsFor: 42, goalsAgainst: 40, goalDifference: 2, points: 43 },
    { position: 8, team: { id: 48, name: 'West Ham', logo: 'https://media.api-sports.io/football/teams/48.png' }, played: 27, won: 11, drawn: 8, lost: 8, goalsFor: 40, goalsAgainst: 38, goalDifference: 2, points: 41 },
    { position: 9, team: { id: 51, name: 'Brighton', logo: 'https://media.api-sports.io/football/teams/51.png' }, played: 27, won: 10, drawn: 9, lost: 8, goalsFor: 38, goalsAgainst: 38, goalDifference: 0, points: 39 },
    { position: 10, team: { id: 66, name: 'Aston Villa', logo: 'https://media.api-sports.io/football/teams/66.png' }, played: 27, won: 10, drawn: 8, lost: 9, goalsFor: 37, goalsAgainst: 40, goalDifference: -3, points: 38 },
    { position: 11, team: { id: 39, name: 'Wolves', logo: 'https://media.api-sports.io/football/teams/39.png' }, played: 27, won: 9, drawn: 8, lost: 10, goalsFor: 34, goalsAgainst: 40, goalDifference: -6, points: 35 },
    { position: 12, team: { id: 55, name: 'Brentford', logo: 'https://media.api-sports.io/football/teams/55.png' }, played: 27, won: 8, drawn: 10, lost: 9, goalsFor: 38, goalsAgainst: 42, goalDifference: -4, points: 34 },
    { position: 13, team: { id: 36, name: 'Fulham', logo: 'https://media.api-sports.io/football/teams/36.png' }, played: 27, won: 8, drawn: 9, lost: 10, goalsFor: 32, goalsAgainst: 40, goalDifference: -8, points: 33 },
    { position: 14, team: { id: 52, name: 'Crystal Palace', logo: 'https://media.api-sports.io/football/teams/52.png' }, played: 27, won: 7, drawn: 11, lost: 9, goalsFor: 30, goalsAgainst: 38, goalDifference: -8, points: 32 },
    { position: 15, team: { id: 35, name: 'Bournemouth', logo: 'https://media.api-sports.io/football/teams/35.png' }, played: 27, won: 8, drawn: 7, lost: 12, goalsFor: 32, goalsAgainst: 45, goalDifference: -13, points: 31 },
    { position: 16, team: { id: 45, name: 'Everton', logo: 'https://media.api-sports.io/football/teams/45.png' }, played: 27, won: 7, drawn: 8, lost: 12, goalsFor: 28, goalsAgainst: 42, goalDifference: -14, points: 29 },
    { position: 17, team: { id: 65, name: 'Nottingham Forest', logo: 'https://media.api-sports.io/football/teams/65.png' }, played: 27, won: 6, drawn: 9, lost: 12, goalsFor: 26, goalsAgainst: 44, goalDifference: -18, points: 27 },
    { position: 18, team: { id: 41, name: 'Southampton', logo: 'https://media.api-sports.io/football/teams/41.png' }, played: 27, won: 5, drawn: 8, lost: 14, goalsFor: 24, goalsAgainst: 48, goalDifference: -24, points: 23 },
    { position: 19, team: { id: 63, name: 'Leeds United', logo: 'https://media.api-sports.io/football/teams/63.png' }, played: 27, won: 4, drawn: 9, lost: 14, goalsFor: 26, goalsAgainst: 52, goalDifference: -26, points: 21 },
    { position: 20, team: { id: 62, name: 'Sheffield Utd', logo: 'https://media.api-sports.io/football/teams/62.png' }, played: 27, won: 3, drawn: 6, lost: 18, goalsFor: 20, goalsAgainst: 58, goalDifference: -38, points: 15 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="text-green-300" size={40} />
            <h1 className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-green-400">
              Premier League
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            England's top-flight football competition
          </p>
        </div>

        {/* Main Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-2 glass-card-pl p-2 rounded-xl inline-flex">
            {['matches', 'standings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'matches' | 'standings')}
                className={`px-8 py-2 rounded-lg capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'glass-pl-dark text-green-300 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Match Sub-Tabs (only show when matches tab is active) */}
        {activeTab === 'matches' && (
          <div className="mb-6 flex justify-center">
            <div className="flex gap-2 glass-card-pl p-2 rounded-xl inline-flex">
              {['live', 'upcoming', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMatchTab(tab as 'live' | 'upcoming' | 'past')}
                  className={`px-6 py-2 rounded-lg capitalize transition-all duration-200 ${
                    matchTab === tab
                      ? 'glass-pl-dark text-green-400 shadow-lg'
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
        )}


        {/* Content */}
        {activeTab === 'matches' ? (
          // Matches Grid
          loading ? (
            <div className="glass-card-pl p-12 rounded-xl text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <h3 className="text-xl text-green-300 mb-2">Loading...</h3>
              <p className="text-gray-400">Fetching latest fixtures from the API</p>
            </div>
          ) : error && dataLoaded ? (
            <div className="glass-card-pl p-12 rounded-xl text-center">
              <Trophy className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-xl text-red-300 mb-2">
                {error.includes('no fixtures found') ? 'No Data Available' : 
                 error.includes('too long to respond') ? 'API Taking Too Long' : 'Error Loading Matches'}
              </h3>
              <p className="text-gray-400 mb-4">{error}</p>
              {error.includes('no fixtures found') ? (
                <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
                  <p className="text-blue-300 text-sm">
                    ℹ️ The API is working but currently has no fixture data. This might be because:
                  </p>
                  <ul className="text-blue-200 text-sm mt-2 text-left">
                    <li>• Season hasn't started yet</li>
                    <li>• Data is being updated</li>
                    <li>• API is temporarily out of sync</li>
                  </ul>
                </div>
              ) : error.includes('too long to respond') ? (
                <div className="bg-orange-900/20 p-4 rounded-lg mb-4">
                  <p className="text-orange-300 text-sm">
                    ⏰ <strong>Server Sleep Mode:</strong> Your API server is waking up from sleep mode.
                  </p>
                  <ul className="text-orange-200 text-sm mt-2 text-left">
                    <li>• First request after server sleep can take 5-10 minutes</li>
                    <li>• Subsequent requests will be much faster</li>
                    <li>• This is normal for free hosting services like Render.com</li>
                    <li>• Consider upgrading to a paid plan for faster wake-up times</li>
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
            <div className="glass-card-pl p-12 rounded-xl text-center">
              <div className="animate-bounce mb-4">
                <Trophy className="mx-auto text-gray-500" size={64} />
              </div>
              <h3 className="text-2xl text-gray-300 mb-4 font-semibold">No matches found</h3>
              <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                <p className="text-lg text-gray-400">
                  {matchTab === 'live' && '🔴 No live matches at the moment'}
                  {matchTab === 'upcoming' && '⏰ No upcoming matches scheduled'}
                  {matchTab === 'past' && '📅 No past matches available'}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Total matches loaded: {matches.length} | Filter: {matchTab}
              </p>
            </div>
          ) : dataLoaded && filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <MatchCard key={match.fixture.id} match={match} onClick={() => handleMatchClick(match)} />
              ))}
            </div>
          ) : (
            // Fallback case - should not happen but just in case
            <div className="glass-card-pl p-12 rounded-xl text-center">
              <Trophy className="mx-auto mb-4 text-gray-500" size={48} />
              <h3 className="text-xl text-gray-300 mb-2">Loading...</h3>
              <p className="text-gray-400">Please wait while we fetch the latest matches</p>
            </div>
          )
        ) : (
          // Standings Table
          <div className="glass-card-pl p-6 rounded-xl">
            <h2 className="text-xl mb-4 text-green-300">2024/25 Season Standings</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-gray-300">Pos</TableHead>
                    <TableHead className="text-gray-300">Team</TableHead>
                    <TableHead className="text-center text-gray-300">P</TableHead>
                    <TableHead className="text-center text-gray-300">W</TableHead>
                    <TableHead className="text-center text-gray-300">D</TableHead>
                    <TableHead className="text-center text-gray-300">L</TableHead>
                    <TableHead className="text-center text-gray-300">GF</TableHead>
                    <TableHead className="text-center text-gray-300">GA</TableHead>
                    <TableHead className="text-center text-gray-300">GD</TableHead>
                    <TableHead className="text-center text-gray-300">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team) => (
                    <TableRow 
                      key={team.position} 
                      className={`border-white/10 hover:bg-white/5 ${
                        team.position === 1 ? 'bg-green-500/20' :
                        team.position <= 4 ? 'bg-blue-500/10' :
                        team.position === 5 ? 'bg-orange-500/10' :
                        team.position >= 18 ? 'bg-red-500/10' : ''
                      }`}
                    >
                      <TableCell className="text-gray-200">{team.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={team.team.logo} alt={team.team.name} className="w-6 h-6 object-contain" />
                          <span className="text-gray-200">{team.team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-300">{team.played}</TableCell>
                      <TableCell className="text-center text-gray-300">{team.won}</TableCell>
                      <TableCell className="text-center text-gray-300">{team.drawn}</TableCell>
                      <TableCell className="text-center text-gray-300">{team.lost}</TableCell>
                      <TableCell className="text-center text-gray-300">{team.goalsFor}</TableCell>
                      <TableCell className="text-center text-gray-300">{team.goalsAgainst}</TableCell>
                      <TableCell className={`text-center ${team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </TableCell>
                      <TableCell className="text-center text-green-300">{team.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/30 rounded"></div>
                <span>Champions League Winner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/20 rounded"></div>
                <span>Champions League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500/20 rounded"></div>
                <span>Europa League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                <span>Relegation</span>
              </div>
            </div>
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
      className="glass-card-pl p-6 rounded-xl cursor-pointer glass-hover-pl group"
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
            <span className="px-3 py-1 glass-pl-dark text-green-300 rounded-full text-xs">
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
            <span className="text-2xl text-green-300 ml-2">
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
            <span className="text-2xl text-green-300 ml-2">
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
        {fixture.venue && (
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