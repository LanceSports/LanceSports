interface Fixture {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  league: string;
  time: string;
  color: string;
}

const fixtures: Fixture[] = [
  {
    id: 1,
    sport: "Football",
    team1: "Chelsea",
    team2: "Crystal Palace",
    league: "Premier League",
    time: "Sun, 17 Aug 15:00",
    color: "text-blue-600"
  },
  {
    id: 2,
    sport: "Rugby",
    team1: "Springboks",
    team2: "Wallabies",
    league: "The Rugby Championship",
    time: "Sun, 17 Aug 15:00",
    color: "text-green-600"
  }
];

export function FixturesSidebar() {
  return (
    <div className="bg-green-50 p-6 rounded-lg">
      <h3 className="text-lg mb-4 text-green-800">Fixtures</h3>
      
      <div className="space-y-4">
        {fixtures.map((fixture) => (
          <div key={fixture.id} className="space-y-2">
            <div className={`text-sm ${fixture.color}`}>
              {fixture.sport}
            </div>
            <div className="text-sm">
              <div>{fixture.team1} vs {fixture.team2}</div>
              <div className="text-gray-600">League: {fixture.league}</div>
              <div className="text-gray-600">Time: {fixture.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}