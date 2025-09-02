import React, { useState, useEffect } from 'react';
// Using backend proxy (CORS enabled)

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

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate());
    const currentDate = d.toISOString().split('T')[0];
    // @ts-ignore - Vite provides import.meta.env
    const base = (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api');
    fetch(`${base}/fixtures?date=${currentDate}`)
      .then(async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!ct.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Non-JSON response: ${text.slice(0, 80)}`);
        }
        return res.json();
      })
      .then((data) => {
        setFixtures((data?.fixtures || []) as Fixture[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching fixtures:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#333' }}>Loading matches...</div>;
  }

  const liveMatches = fixtures.filter((f) => !['NS', 'FT', 'PST', 'CANC'].includes(f.fixture.status.short));
  const upcomingMatches = fixtures.filter((f) => f.fixture.status.short === 'NS');
  const pastMatches = fixtures.filter((f) => f.fixture.status.short === 'FT');

  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          backgroundColor: 'rgba(144, 238, 144, 0.1)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          overflowX: 'auto',
          gap: '15px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {liveMatches.length > 0 ? (
          liveMatches.map((match) => <MatchCard key={match.fixture.id} match={match} />)
        ) : (
          <div style={{ width: '100%', textAlign: 'center', color: '#666' }}>No live matches currently</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(144, 238, 144, 0.05)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginBottom: '10px', color: '#333', textAlign: 'center', fontWeight: 'bold', fontSize: '22px' }}>Upcoming matches</h2>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => <MatchCard key={match.fixture.id} match={match} vertical />)
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>No upcoming matches</div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(144, 238, 144, 0.05)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginBottom: '10px', color: '#333', textAlign: 'center', fontWeight: 'bold', fontSize: '22px' }}>Past matches</h2>
          {pastMatches.length > 0 ? (
            pastMatches.map((match) => <MatchCard key={match.fixture.id} match={match} vertical />)
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>No past matches</div>
          )}
        </div>
      </div>
    </div>
  );
};

const MatchCard: React.FC<{ match: Fixture; vertical?: boolean }> = ({ match, vertical = false }) => {
  const { fixture, league, teams, goals } = match;
  const date = new Date(fixture.date).toLocaleString();

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: vertical ? 'auto' : '300px',
        width: vertical ? '100%' : 'auto',
        marginBottom: vertical ? '10px' : '0',
        border: '1px solid rgba(144, 238, 144, 0.2)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px', color: '#666', fontSize: '12px' }}>
        {league.name} | {date}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <img src={teams.home.logo} alt={teams.home.name} style={{ width: '40px', height: '40px' }} />
          <p style={{ marginTop: '5px', fontSize: '14px', color: '#333' }}>{teams.home.name}</p>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', padding: '0 20px' }}>
          {goals.home ?? '-'} : {goals.away ?? '-'}
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <img src={teams.away.logo} alt={teams.away.name} style={{ width: '40px', height: '40px' }} />
          <p style={{ marginTop: '5px', fontSize: '14px', color: '#333' }}>{teams.away.name}</p>
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '12px',
          color: (fixture.status.long === 'First Half' || fixture.status.short === '1H') ? '#16A34A' : '#999',
          fontWeight: (fixture.status.long === 'First Half' || fixture.status.short === '1H') ? 'bold' : 'normal'
        }}
      >
        {fixture.status.long}
      </div>
    </div>
  );
};

export default LiveUpcomingPastMatches;