import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface Teams {
  home: Team;
  away: Team;
}

interface Goals {
  home: number | null;
  away: number | null;
}

interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
}

interface FixtureDetails {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: FixtureStatus;
}

interface Fixture {
  fixture: FixtureDetails;
  league: League;
  teams: Teams;
  goals: Goals;
  score: {
    halftime: Goals;
    fulltime: Goals;
    extratime: Goals;
    penalty: Goals;
  };
}

interface MatchesSectionProps {
  liveMatches: Fixture[];
  upcomingMatches: Fixture[];
  pastMatches: Fixture[];
}

export const MatchesSection: React.FC<MatchesSectionProps> = ({
  liveMatches,
  upcomingMatches,
  pastMatches,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 p-5">
      {/* Live Matches Section */}
      <div className="glass-card-dark rounded-xl p-4 mb-6 glass-glow">
        <h2 className="text-xl text-gray-100 mb-4 text-center">🔴 Live Matches</h2>
        <div className="flex overflow-x-auto gap-4 pb-2">
          {liveMatches.length > 0 ? (
            liveMatches.map((match) => <MatchCard key={match.fixture.id} match={match} />)
          ) : (
            <div className="w-full text-center text-gray-400 py-8">
              <div className="glass-dark rounded-lg p-4">
                No live matches currently
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
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard key={match.fixture.id} match={match} vertical />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="glass-dark rounded-lg p-4">
                  No upcoming matches
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Past Matches */}
        <div className="glass-card-dark rounded-xl p-4 glass-hover-dark glass-glow">
          <h2 className="text-xl text-gray-100 mb-4 text-center">📊 Past Matches</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pastMatches.length > 0 ? (
              pastMatches.map((match) => (
                <MatchCard key={match.fixture.id} match={match} vertical />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="glass-dark rounded-lg p-4">
                  No past matches
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

  const isLive = fixture.status.short === '1H' || 
                 fixture.status.short === '2H' || 
                 fixture.status.short === 'HT' ||
                 fixture.status.long === 'First Half' ||
                 fixture.status.long === 'Second Half' ||
                 fixture.status.long === 'Halftime';

  const isFinished = fixture.status.short === 'FT' || 
                     fixture.status.long === 'Match Finished';

  return (
    <button
      onClick={handleClick}
      className={`
        glass-card-dark glass-hover-dark glass-glow
        rounded-lg p-4 border border-green-800/30
        transition-all duration-300 cursor-pointer
        hover:border-green-600/50 hover:scale-[1.02]
        ${vertical 
          ? 'w-full block' 
          : 'min-w-[280px] flex-shrink-0'
        }
        ${isLive ? 'ring-2 ring-green-500/50 animate-pulse' : ''}
      `}
    >
      {/* League and Date */}
      <div className="text-center mb-3">
        <div className="text-xs text-gray-400 mb-1">
          {league.name}
        </div>
        <div className="text-xs text-gray-500">
          {date}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden glass-dark">
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
        </div>

        {/* Score */}
        <div className="px-4">
          <div className={`
            text-lg font-mono
            ${isLive ? 'text-green-400' : 'text-gray-100'}
            ${isFinished ? 'text-blue-400' : ''}
          `}>
            {goals.home ?? '-'} : {goals.away ?? '-'}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden glass-dark">
            <img 
              src={teams.away.logo} 
              alt={teams.away.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAxMyAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaTTEzIDE3SDExVjE1SDEzVjE3Wk0xMyAxM0gxMVY3SDEzVjEzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';
              }}
            />
          </div>
          <p className="text-sm text-gray-200 truncate px-1">
            {teams.away.name}
          </p>
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
            : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
          }
        `}>
          {fixture.status.long}
          {isLive && fixture.status.elapsed && ` (${fixture.status.elapsed}')`}
        </span>
      </div>
    </button>
  );
};