import React, { useState, useEffect } from 'react';

// TypeScript interfaces for League Standings
interface TeamStanding {
  league_id: number;
  season: number;
  team_id: number;
  team_name: string;
  rank: number;
  points: number;
  goals_diff: number;
  form: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals_for: number;
  goals_against: number;
  updated_at: string;
}

interface LeagueStandingsDisplayProps {
  className?: string;
}

const LeagueStandingsDisplay: React.FC<LeagueStandingsDisplayProps> = ({ className = '' }) => {
  const [standingsData, setStandingsData] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);

  // existing sort state
  const [sortField, setSortField] = useState<keyof TeamStanding>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchStandingsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/mocks/StandingsGeneral.json');
        if (!response.ok) {
          throw new Error('Failed to fetch standings data');
        }
        const data = await response.json();
        setStandingsData(data);
        if (data.length > 0) {
          setSelectedLeague(data[0].league_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStandingsData();
  }, []);

  const getLeagueName = (leagueId: number): string => {
    const leagueNames: { [key: number]: string } = {
      39: 'Premier League',
      2: 'Champions League',
      61: 'Ligue 1',
      78: 'Bundesliga',
      135: 'Serie A',
      140: 'La Liga'
    };
    return leagueNames[leagueId] || `League ${leagueId}`;
  };

  const getRankColor = (rank: number): string => {
    if (rank <= 4) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (rank <= 6) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (rank >= standingsData.filter(team => team.league_id === selectedLeague).length - 3) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getFormColor = (form: string): string => {
    const lastResult = form.slice(-1);
    switch (lastResult) {
      case 'W': return 'text-green-400';
      case 'D': return 'text-yellow-400';
      case 'L': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatForm = (form: string): string =>
    form.split('').map(c => (c === 'W' || c === 'D' || c === 'L' ? c : c)).join(' ');

  const handleSort = (field: keyof TeamStanding) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...standingsData]
    .filter(team => selectedLeague === null || team.league_id === selectedLeague)
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const availableLeagues = Array.from(new Set(standingsData.map(team => team.league_id)));

  // --- NEW: Sort-by options for the button group ---
  const sortOptions: Array<{ key: keyof TeamStanding; label: string }> = [
    { key: 'played', label: 'P' },
    { key: 'win', label: 'W' },
    { key: 'draw', label: 'D' },
    { key: 'lose', label: 'L' },
    { key: 'goals_for', label: 'GF' },
    { key: 'goals_against', label: 'GA' },
    { key: 'goals_diff', label: 'GD' },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card-dark p-8 rounded-xl glass-glow">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <span className="text-gray-100 text-lg animate-pulse">Loading league standings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card-dark p-8 rounded-xl glass-glow border border-red-500/30">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-2">⚠️ Error Loading Data</div>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (standingsData.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card-dark p-8 rounded-xl glass-glow">
            <div className="text-center">
              <div className="text-gray-400 text-xl mb-2">🏆 No Standings Data Available</div>
              <p className="text-gray-300">No league standings data found for display.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-100 mb-2">
            League Standings
          </h1>
          <p className="text-center text-gray-300 text-lg">
            Current season standings across all leagues
          </p>
        </div>

        {/* League Selector */}
        <div className="mb-6">
          <div className="glass-card-dark p-4 rounded-xl glass-glow">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedLeague(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedLeague === null
                    ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                All Leagues
              </button>
              {availableLeagues.map(leagueId => (
                <button
                  key={leagueId}
                  onClick={() => setSelectedLeague(leagueId)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedLeague === leagueId
                      ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {getLeagueName(leagueId)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NEW: Sort-By Controls (same theme) */}
        <div className="mb-6">
          <div className="glass-card-dark p-4 rounded-xl glass-glow">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-300">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.key as string}
                      onClick={() => handleSort(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border
                        ${
                          sortField === opt.key
                            ? 'bg-green-500/20 text-green-400 border-green-500/40'
                            : 'bg-gray-700/40 text-gray-300 border-white/10 hover:bg-gray-600/40'
                        }`}
                      title={`Sort by ${opt.label}`}
                    >
                      {opt.label}
                      {sortField === opt.key && (
                        <span className="ml-1 opacity-80">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors border bg-gray-700/40 text-gray-200 border-white/10 hover:bg-gray-600/40"
                aria-label="Toggle sort direction"
              >
                Direction: <span className="ml-1 font-semibold">{sortDirection === 'asc' ? 'Asc ↑' : 'Desc ↓'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Standings Table */}
        <div className="glass-card-dark p-6 rounded-xl glass-hover-dark glass-glow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th
                    className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('rank')}
                  >
                    Rank {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('team_name')}
                  >
                    Team {sortField === 'team_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('points')}
                  >
                    Pts {sortField === 'points' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('played')}
                  >
                    P {sortField === 'played' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('win')}
                  >
                    W {sortField === 'win' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('draw')}
                  >
                    D {sortField === 'draw' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('lose')}
                  >
                    L {sortField === 'lose' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('goals_for')}
                  >
                    GF {sortField === 'goals_for' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('goals_against')}
                  >
                    GA {sortField === 'goals_against' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-center py-3 px-4 text-gray-300 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={() => handleSort('goals_diff')}
                  >
                    GD {sortField === 'goals_diff' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Form</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">League</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((team) => (
                  <tr
                    key={`${team.league_id}-${team.team_id}`}
                    className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getRankColor(team.rank)}`}>
                        {team.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-200 font-medium">{team.team_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-lg font-bold text-green-400">{team.points}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">{team.played}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{team.win}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{team.draw}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{team.lose}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{team.goals_for}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{team.goals_against}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${team.goals_diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {team.goals_diff >= 0 ? '+' : ''}{team.goals_diff}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-mono ${getFormColor(team.form)}`}>
                        {formatForm(team.form)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        {getLeagueName(team.league_id)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* League Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableLeagues.slice(0, 3).map(leagueId => {
            const leagueTeams = standingsData.filter(team => team.league_id === leagueId);
            const totalGoals = leagueTeams.reduce((sum, team) => sum + team.goals_for, 0);
            const avgGoals = totalGoals / leagueTeams.length;

            return (
              <div key={leagueId} className="glass-card-dark p-6 rounded-xl glass-glow">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 text-center">
                  {getLeagueName(leagueId)} Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Teams:</span>
                    <span className="text-gray-100 font-semibold">{leagueTeams.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Goals:</span>
                    <span className="text-gray-100 font-semibold">{totalGoals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Avg Goals/Team:</span>
                    <span className="text-gray-100 font-semibold">{avgGoals.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Leader:</span>
                    <span className="text-green-400 font-semibold">
                      {leagueTeams.find(team => team.rank === 1)?.team_name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeagueStandingsDisplay;
