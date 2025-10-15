interface Final {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  competition: string;
  year: string;
  winner: string;
  score: string;
  color: string;
  link: string;
}

const finals: Final[] = [
  {
    id: 1,
    sport: "Football",
    team1: "Real Madrid",
    team2: "Liverpool",
    competition: "Champions League Final",
    year: "2022",
    winner: "Real Madrid",
    score: "1-0",
    color: "text-blue-600 dark:text-blue-400",
    link: "#champions-league-2022"
  },   
  {
    id: 2,
    sport: "Football",
    team1: "Argentina",
    team2: "France",
    competition: "FIFA World Cup Final",
    year: "2022",
    winner: "Argentina",
    score: "4-2 (pen)",
    color: "text-green-600 dark:text-green-400",
    link: "#world-cup-2022"
  },
  {
    id: 3,
    sport: "Football",
    team1: "Manchester City",
    team2: "Inter Milan",
    competition: "Champions League Final",
    year: "2023",
    winner: "Manchester City",
    score: "1-0",
    color: "text-purple-600 dark:text-purple-400",
    link: "#champions-league-2023"
  },
  {
    id: 4,
    sport: "Football",
    team1: "Chelsea",
    team2: "Manchester City",
    competition: "Champions League Final",
    year: "2021",
    winner: "Chelsea",
    score: "1-0",
    color: "text-red-600 dark:text-red-400",
    link: "#champions-league-2021"
  }
];

export function FixturesSidebar() {
  const handleFinalClick = (link: string, competition: string, year: string) => {
    console.log(`Navigating to ${competition} ${year}`);
    alert(`Redirecting to ${competition} ${year} - Final Details`);
    // In a real app, this would navigate to the final details page
  };

  return (
    <div className="glass-green dark:glass-green-dark p-6 rounded-xl glass-glow">
      <h3 className="text-lg mb-4 text-green-800 dark:text-green-300">Football Finals</h3>
      
      <div className="space-y-4">
        {finals.map((final) => (
          <div 
            key={final.id} 
            className="space-y-2 p-3 glass dark:glass-dark rounded-lg glass-hover dark:glass-hover-dark cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => handleFinalClick(final.link, final.competition, final.year)}
          >
            <div className={`text-sm font-semibold ${final.color}`}>
              {final.competition}
            </div>
            <div className="text-sm">
              <div className="dark:text-gray-200 font-medium">{final.team1} vs {final.team2}</div>
              <div className="text-gray-600 dark:text-gray-400">Year: {final.year}</div>
              <div className="text-gray-600 dark:text-gray-400">Winner: <span className="font-semibold text-green-600 dark:text-green-400">{final.winner}</span></div>
              <div className="text-gray-600 dark:text-gray-400">Score: <span className="font-semibold">{final.score}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}