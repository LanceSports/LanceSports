import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Clock } from 'lucide-react';
import { ChatbotButton } from './ChatbotButton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Match {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
      city: string;
    };
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
    country: string;
    logo: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

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

export function ChampionsLeague() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches');
  const [matchTab, setMatchTab] = useState<'live' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const loadMatches = () => {
      setLoading(true);
      
      // Mock Champions League matches data
      const mockMatches: Match[] = [
        {
          fixture: {
            id: 2001,
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'Santiago Bernabéu', city: 'Madrid' },
            status: { short: 'NS', elapsed: null }
          },
          league: { name: 'UEFA Champions League', country: 'Europe', logo: '', round: 'Round of 16' },
          teams: {
            home: { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
            away: { id: 529, name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/529.png' }
          },
          goals: { home: null, away: null },
          score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null } }
        },
        {
          fixture: {
            id: 2002,
            date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'Allianz Arena', city: 'Munich' },
            status: { short: 'NS', elapsed: null }
          },
          league: { name: 'UEFA Champions League', country: 'Europe', logo: '', round: 'Round of 16' },
          teams: {
            home: { id: 157, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/157.png' },
            away: { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png' }
          },
          goals: { home: null, away: null },
          score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null } }
        },
        {
          fixture: {
            id: 2003,
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'Camp Nou', city: 'Barcelona' },
            status: { short: 'NS', elapsed: null }
          },
          league: { name: 'UEFA Champions League', country: 'Europe', logo: '', round: 'Round of 16' },
          teams: {
            home: { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
            away: { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' }
          },
          goals: { home: null, away: null },
          score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null } }
        },
        {
          fixture: {
            id: 2004,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'San Siro', city: 'Milan' },
            status: { short: 'FT', elapsed: null }
          },
          league: { name: 'UEFA Champions League', country: 'Europe', logo: '', round: 'Group Stage - Matchday 6' },
          teams: {
            home: { id: 505, name: 'Inter Milan', logo: 'https://media.api-sports.io/football/teams/505.png' },
            away: { id: 492, name: 'Napoli', logo: 'https://media.api-sports.io/football/teams/492.png' }
          },
          goals: { home: 3, away: 2 },
          score: { halftime: { home: 2, away: 1 }, fulltime: { home: 3, away: 2 } }
        },
        {
          fixture: {
            id: 2005,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            venue: { name: 'Old Trafford', city: 'Manchester' },
            status: { short: 'FT', elapsed: null }
          },
          league: { name: 'UEFA Champions League', country: 'Europe', logo: '', round: 'Group Stage - Matchday 6' },
          teams: {
            home: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
            away: { id: 50, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/50.png' }
          },
          goals: { home: 1, away: 1 },
          score: { halftime: { home: 0, away: 1 }, fulltime: { home: 1, away: 1 } }
        }
      ];

      setTimeout(() => {
        setMatches(mockMatches);
        setLoading(false);
      }, 500);
    };

    loadMatches();
  }, []);

  const handleMatchClick = (match: Match) => {
    navigate('/match', { state: { match } });
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

  // Mock standings data for Group A
  const groupAStandings: StandingsTeam[] = [
    { position: 1, team: { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' }, played: 6, won: 5, drawn: 1, lost: 0, goalsFor: 15, goalsAgainst: 4, goalDifference: 11, points: 16 },
    { position: 2, team: { id: 529, name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/529.png' }, played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 14, goalsAgainst: 6, goalDifference: 8, points: 13 },
    { position: 3, team: { id: 157, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/157.png' }, played: 6, won: 2, drawn: 1, lost: 3, goalsFor: 8, goalsAgainst: 10, goalDifference: -2, points: 7 },
    { position: 4, team: { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png' }, played: 6, won: 0, drawn: 1, lost: 5, goalsFor: 3, goalsAgainst: 20, goalDifference: -17, points: 1 },
  ];

  // Mock standings data for Group B
  const groupBStandings: StandingsTeam[] = [
    { position: 1, team: { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' }, played: 6, won: 6, drawn: 0, lost: 0, goalsFor: 18, goalsAgainst: 3, goalDifference: 15, points: 18 },
    { position: 2, team: { id: 505, name: 'Inter Milan', logo: 'https://media.api-sports.io/football/teams/505.png' }, played: 6, won: 3, drawn: 2, lost: 1, goalsFor: 10, goalsAgainst: 7, goalDifference: 3, points: 11 },
    { position: 3, team: { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' }, played: 6, won: 2, drawn: 1, lost: 3, goalsFor: 9, goalsAgainst: 11, goalDifference: -2, points: 7 },
    { position: 4, team: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' }, played: 6, won: 0, drawn: 1, lost: 5, goalsFor: 5, goalsAgainst: 21, goalDifference: -16, points: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-blue-950 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="text-ucl-purple" size={40} />
            <h1 className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
              UEFA Champions League
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The most prestigious club competition in European football
          </p>
        </div>

        {/* Main Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-2 glass-card-ucl p-2 rounded-xl inline-flex">
            {['matches', 'standings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'matches' | 'standings')}
                className={`px-8 py-2 rounded-lg capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'glass-ucl-dark text-ucl-purple shadow-lg'
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
            <div className="flex gap-2 glass-card-ucl p-2 rounded-xl inline-flex">
              {['live', 'upcoming', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMatchTab(tab as 'live' | 'upcoming' | 'past')}
                  className={`px-6 py-2 rounded-lg capitalize transition-all duration-200 ${
                    matchTab === tab
                      ? 'glass-ucl-dark text-ucl-blue shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                  {tab === 'live' && (
                    <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card-ucl p-6 rounded-xl animate-pulse">
                  <div className="h-24 bg-white/10 rounded-lg mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="glass-card-ucl p-12 rounded-xl text-center">
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
          )
        ) : (
          // Standings Tables
          <div className="space-y-8">
            {/* Group A */}
            <div className="glass-card-ucl p-6 rounded-xl">
              <h2 className="text-xl mb-4 text-ucl-purple">Group A</h2>
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
                    {groupAStandings.map((team) => (
                      <TableRow 
                        key={team.position} 
                        className={`border-white/10 hover:bg-white/5 ${
                          team.position <= 2 ? 'bg-blue-500/10' : ''
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
                        <TableCell className="text-center text-ucl-purple">{team.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/30 rounded"></div>
                  <span>Qualification to Round of 16</span>
                </div>
              </div>
            </div>

            {/* Group B */}
            <div className="glass-card-ucl p-6 rounded-xl">
              <h2 className="text-xl mb-4 text-ucl-purple">Group B</h2>
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
                    {groupBStandings.map((team) => (
                      <TableRow 
                        key={team.position} 
                        className={`border-white/10 hover:bg-white/5 ${
                          team.position <= 2 ? 'bg-blue-500/10' : ''
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
                        <TableCell className="text-center text-ucl-purple">{team.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/30 rounded"></div>
                  <span>Qualification to Round of 16</span>
                </div>
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
      className="glass-card-ucl p-6 rounded-xl cursor-pointer glass-hover-ucl group"
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
            <span className="px-3 py-1 glass-ucl-dark text-ucl-blue rounded-full text-xs">
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
            <span className="text-2xl text-ucl-purple ml-2">
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
            <span className="text-2xl text-ucl-purple ml-2">
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