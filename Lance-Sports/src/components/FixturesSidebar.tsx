import { useEffect, useState } from "react";

interface Fixture {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  league: string;
  time: string;
  color: string;
}

// API fixture structure (simplified for what we use)
interface ApiFixture {
  fixture: {
    id: number;
    date: string;
  };
  league: {
    name: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
}

export function FixturesSidebar() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        const res = await fetch(
          "https://lancesports-fixtures-api.onrender.com/fixtures?date=2025-09-02"
        );
        if (!res.ok) throw new Error("Failed to fetch fixtures");
        const json = await res.json();

        // Assuming API returns { fixtures: [...] }
        const data: ApiFixture[] = json.fixtures;

        // Map API data into our Fixture interface
        const mapped: Fixture[] = data.map((f) => ({
          id: f.fixture.id,
          sport: "Football", // hardcoded for now
          team1: f.teams.home.name,
          team2: f.teams.away.name,
          league: f.league.name,
          time: new Date(f.fixture.date).toLocaleString(), // format nicely
          color: "text-blue-600", // could map based on league/sport
        }));

        setFixtures(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFixtures();
  }, []);

  if (loading) {
    return (
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4 text-green-800">Fixtures</h3>
        <p className="text-gray-500">Loading fixtures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4 text-green-800">Fixtures</h3>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 p-6 rounded-lg">
      <h3 className="text-lg mb-4 text-green-800">Fixtures</h3>

      <div className="space-y-4">
        {fixtures.length === 0 ? (
          <p className="text-gray-500">No fixtures found for this date.</p>
        ) : (
          fixtures.map((fixture) => (
            <div key={fixture.id} className="space-y-2">
              <div className={`text-sm ${fixture.color}`}>{fixture.sport}</div>
              <div className="text-sm">
                <div>
                  {fixture.team1} vs {fixture.team2}
                </div>
                <div className="text-gray-600">League: {fixture.league}</div>
                <div className="text-gray-600">Time: {fixture.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
