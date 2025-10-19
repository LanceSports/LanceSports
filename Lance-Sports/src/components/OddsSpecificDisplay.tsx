import React, { useState, useEffect } from 'react';

// TypeScript interfaces for OddsSpecific format
interface OddsValue {
  value: string;
  odd: string;
}

interface Bet {
  market: string;
  values: OddsValue[];
}

interface BookmakerData {
  bets: Bet[];
}

interface Bookmakers {
  [bookmakerName: string]: BookmakerData[];
}

interface OddsSpecificData {
  fixture_id: number;
  fixture_date: string;
  league_id: number;
  season: number;
  home_team: string;
  away_team: string;
  bookmakers: Bookmakers;
}

interface OddsSpecificDisplayProps {
  className?: string;
}

const OddsSpecificDisplay: React.FC<OddsSpecificDisplayProps> = ({ className = '' }) => {
  const [oddsData, setOddsData] = useState<OddsSpecificData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBookmakers, setExpandedBookmakers] = useState<Set<string>>(new Set());
  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchOddsData = async () => {
      try {
        setLoading(true);
        ////https://lancesports-fixtures-api.onrender.com/leagues/odds/:leagueid
        const response = await fetch('https://lancesports-fixtures-api.onrender.com/leagues/odds');
        if (!response.ok) {
          throw new Error('Failed to fetch odds data');
        }
        const data = await response.json();
        setOddsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOddsData();
  }, []);

  const toggleBookmaker = (bookmakerName: string) => {
    const newExpanded = new Set(expandedBookmakers);
    if (newExpanded.has(bookmakerName)) {
      newExpanded.delete(bookmakerName);
    } else {
      newExpanded.add(bookmakerName);
    }
    setExpandedBookmakers(newExpanded);
  };

  const toggleMarket = (marketKey: string) => {
    const newExpanded = new Set(expandedMarkets);
    if (newExpanded.has(marketKey)) {
      newExpanded.delete(marketKey);
    } else {
      newExpanded.add(marketKey);
    }
    setExpandedMarkets(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card-dark p-8 rounded-xl glass-glow">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <span className="text-gray-100 text-lg animate-pulse">Loading odds data...</span>
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

  if (oddsData.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card-dark p-8 rounded-xl glass-glow">
            <div className="text-center">
              <div className="text-gray-400 text-xl mb-2">📊 No Odds Data Available</div>
              <p className="text-gray-300">No betting odds data found for display.</p>
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
            Detailed Betting Odds
          </h1>
          <p className="text-center text-gray-300 text-lg">
            Comprehensive odds data with nested market structure
          </p>
        </div>

        <div className="space-y-8">
          {oddsData.map((fixture) => (
            <div key={fixture.fixture_id} className="glass-card-dark p-6 rounded-xl glass-hover-dark glass-glow">
              {/* Fixture Header */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {formatDate(fixture.fixture_date)}
                  </div>
                  <div className="text-2xl font-bold text-gray-100">
                    {fixture.home_team} <span className="text-green-400 mx-4">vs</span> {fixture.away_team}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Fixture ID: {fixture.fixture_id} | Season: {fixture.season}
                  </div>
                </div>
              </div>

              {/* Bookmakers */}
              <div className="space-y-4">
                {Object.entries(fixture.bookmakers).map(([bookmakerName, bookmakerDataArray]) => (
                  <div key={bookmakerName} className="glass-card-dark p-4 rounded-lg border border-gray-700/30">
                    <button
                      onClick={() => toggleBookmaker(bookmakerName)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-lg font-semibold text-gray-100">{bookmakerName}</span>
                        <span className="text-sm text-gray-400">
                          ({bookmakerDataArray.length} market set{bookmakerDataArray.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="text-gray-400">
                        {expandedBookmakers.has(bookmakerName) ? '▼' : '▶'}
                      </div>
                    </button>

                    {expandedBookmakers.has(bookmakerName) && (
                      <div className="mt-4 space-y-4">
                        {bookmakerDataArray.map((bookmakerData, dataIndex) => (
                          <div key={dataIndex} className="glass-card-dark p-3 rounded-lg border border-gray-600/30">
                            <div className="text-sm text-gray-400 mb-3 font-medium">
                              Market Set {dataIndex + 1}
                            </div>
                            <div className="space-y-3">
                              {bookmakerData.bets.map((bet) => {
                                const marketKey = `${bookmakerName}-${dataIndex}-${bet.market}`;
                                return (
                                  <div key={bet.market} className="glass-card-dark p-3 rounded-lg">
                                    <button
                                      onClick={() => toggleMarket(marketKey)}
                                      className="w-full flex items-center justify-between mb-2"
                                    >
                                      <span className="text-md font-medium text-gray-200">{bet.market}</span>
                                      <span className="text-gray-400">
                                        {expandedMarkets.has(marketKey) ? '▼' : '▶'}
                                      </span>
                                    </button>

                                    {expandedMarkets.has(marketKey) && (
                                      <div className="overflow-x-auto">
                                        <table className="w-full">
                                          <thead>
                                            <tr className="border-b border-gray-700/50">
                                              <th className="text-left py-2 px-3 text-gray-300 font-medium">Option</th>
                                              <th className="text-right py-2 px-3 text-gray-300 font-medium">Odds</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {bet.values.map((odds, index) => (
                                              <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                                <td className="py-2 px-3 text-gray-200">{odds.value}</td>
                                                <td className="py-2 px-3 text-right">
                                                  <span className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {odds.odd}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 glass-card-dark p-6 rounded-xl glass-glow">
          <h3 className="text-xl font-semibold text-gray-100 mb-4 text-center">
            Data Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="glass-card-dark p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">{oddsData.length}</div>
              <div className="text-sm text-gray-300">Total Fixtures</div>
            </div>
            <div className="glass-card-dark p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {oddsData.reduce((total, fixture) => total + Object.keys(fixture.bookmakers).length, 0)}
              </div>
              <div className="text-sm text-gray-300">Bookmakers</div>
            </div>
            <div className="glass-card-dark p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {oddsData.reduce((total, fixture) => {
                  return total + Object.values(fixture.bookmakers).reduce((bookmakerTotal, bookmakerData) => {
                    if (Array.isArray(bookmakerData)) {
                      return bookmakerTotal + bookmakerData.reduce((dataTotal, data) => dataTotal + data.bets.length, 0);
                    }
                    return bookmakerTotal;
                  }, 0);
                }, 0)}
              </div>
              <div className="text-sm text-gray-300">Total Markets</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OddsSpecificDisplay;
