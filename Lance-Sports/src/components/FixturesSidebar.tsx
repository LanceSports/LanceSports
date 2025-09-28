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
    color: "text-blue-600 dark:text-blue-400"
  },   
  {
    id: 2,
    sport: "Rugby",
    team1: "Springboks",
    team2: "Wallabies",
    league: "The Rugby Championship",
    time: "Sun, 17 Aug 15:00",
    color: "text-green-600 dark:text-green-400"
  }
];

export function FixturesSidebar() {
  return (
    <div className="glass-green dark:glass-green-dark p-6 rounded-xl glass-glow">
      <h3 className="text-lg mb-4 text-green-800 dark:text-green-300">Fixtures</h3>
      
      <div className="space-y-4">
        {fixtures.map((fixture) => (
          <div key={fixture.id} className="space-y-2 p-3 glass dark:glass-dark rounded-lg glass-hover dark:glass-hover-dark">
            <div className={`text-sm ${fixture.color}`}>
              {fixture.sport}
            </div>
            <div className="text-sm">
              <div className="dark:text-gray-200">{fixture.team1} vs {fixture.team2}</div>
              <div className="text-gray-600 dark:text-gray-400">League: {fixture.league}</div>
              <div className="text-gray-600 dark:text-gray-400">Time: {fixture.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}