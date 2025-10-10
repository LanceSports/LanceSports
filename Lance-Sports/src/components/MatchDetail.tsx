import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Activity,
  Clock,
  MapPin,
} from "lucide-react";
import type { Match } from "./types/Match";
import {
  fromMatchToDetails,
  type MatchDetailData,
  type MatchEvent,
  type TeamStat,
  type Player,
} from "./lib/fromMatchToDetails";

// ======================
// Component
// ======================
export function MatchDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  type LocationState = { match: Match };
  const state = location.state as LocationState | null;
  const match = state?.match;

  const [matchDetails, setMatchDetails] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<"events" | "stats" | "players">("events");

  useEffect(() => {
    if (!match?.fixture?.id) {
      navigate("/matches");
      return;
    }
    setLoading(true);
    try {
      // 1) Normalize directly from the passed-in match object
      const base = fromMatchToDetails(match);

      // 2) If match lacks details, synthesize non-blocking mock data
      const needMockEvents = (base.events?.length ?? 0) === 0;
      const needMockStats = (base.stats?.length ?? 0) === 0;
      const needMockPlayers = (base.players?.length ?? 0) === 0;

      const elapsed = match.fixture.status.elapsed || 90;
      const enriched: MatchDetailData = {
        ...base,
        events: needMockEvents
          ? generateMockEvents(match, elapsed)
          : base.events,
        stats: needMockStats ? generateMockStats(match) : base.stats,
        players: needMockPlayers ? generateMockPlayers(match) : base.players,
      };

      setMatchDetails(enriched);
    } finally {
      setLoading(false);
    }
  }, [match, navigate]);

  if (loading || !matchDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 flex items-center justify-center">
        <div className="glass-card-dark p-8 rounded-xl glass-glow glass-shimmer">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400" />
            <span className="text-gray-100">Loading match details...</span>
          </div>
        </div>
      </div>
    );
  }

  const isLive = ["1H", "2H", "HT", "ET", "P"].includes(
    matchDetails.status.short
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="glass-card-dark glass-hover-dark px-4 py-2 rounded-lg flex items-center space-x-2 border border-green-800/30 hover:border-green-600/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-green-400" />
          <span className="text-gray-100">Back</span>
        </button>
      </div>

      {/* Match Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass-card-dark rounded-xl p-6 md:p-8 glass-glow border border-green-800/30">
          {/* League and Venue Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span>{matchDetails.league.name}</span>
            </div>
            <div className="hidden md:block text-gray-700">•</div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-400" />
              <span>{matchDetails.venue.name}</span>
            </div>
            {isLive && (
              <>
                <div className="hidden md:block text-gray-700">•</div>
                <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400">LIVE</span>
                </div>
              </>
            )}
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between">
            {/* Home */}
            <TeamCol
              name={matchDetails.teams.home.name}
              logo={matchDetails.teams.home.logo}
              side="Home"
            />
            {/* Score */}
            <div className="px-6 md:px-8">
              <div
                className={`text-4xl md:text-5xl font-mono mb-2 ${
                  isLive ? "text-green-400" : "text-gray-100"
                }`}
              >
                {matchDetails.goals.home} : {matchDetails.goals.away}
              </div>
              <div
                className={`text-center text-sm px-4 py-1 rounded-full ${
                  isLive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {matchDetails.status.long}
              </div>
            </div>
            {/* Away */}
            <TeamCol
              name={matchDetails.teams.away.name}
              logo={matchDetails.teams.away.logo}
              side="Away"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="glass-card-dark rounded-xl p-2 flex gap-2 border border-green-800/30">
          <TabBtn
            active={activeTab === "events"}
            onClick={() => setActiveTab("events")}
            icon={<Clock className="w-4 h-4" />}
            label="Events"
          />
          <TabBtn
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
            icon={<TrendingUp className="w-4 h-4" />}
            label="Statistics"
          />
          <TabBtn
            active={activeTab === "players"}
            onClick={() => setActiveTab("players")}
            icon={<Users className="w-4 h-4" />}
            label="Players"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === "events" && (
          <EventsTab
            events={matchDetails.events}
            teams={{
              home: {
                team_id: matchDetails.teams.home.team_id,
                name: matchDetails.teams.home.name,
              },
              away: {
                team_id: matchDetails.teams.away.team_id,
                name: matchDetails.teams.away.name,
              },
            }}
          />
        )}
        {activeTab === "stats" && (
          <StatsTab
            stats={matchDetails.stats}
            teams={{
              home: {
                team_id: matchDetails.teams.home.team_id,
                name: matchDetails.teams.home.name,
              },
              away: {
                team_id: matchDetails.teams.away.team_id,
                name: matchDetails.teams.away.name,
              },
            }}
          />
        )}
        {activeTab === "players" && (
          <PlayersTab
            players={matchDetails.players}
            teams={{
              home: {
                team_id: matchDetails.teams.home.team_id,
                name: matchDetails.teams.home.name,
              },
              away: {
                team_id: matchDetails.teams.away.team_id,
                name: matchDetails.teams.away.name,
              },
            }}
          />
        )}
      </div>
    </div>
  );
}

// ======================
// Subcomponents
// ======================
function TeamCol({
  name,
  logo,
  side,
}: {
  name: string;
  logo?: string;
  side: "Home" | "Away";
}) {
  return (
    <div className="flex-1 text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full overflow-hidden glass-dark ring-2 ring-green-800/30">
        {logo && (
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIgZmlsbD0iIzM3NDE1MSIvPjwvc3ZnPg==";
            }}
          />
        )}
      </div>
      <p className="text-gray-100 text-lg md:text-xl mb-1">{name}</p>
      <p className="text-xs text-gray-500">{side}</p>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
        active
          ? "glass-green-dark text-green-400 border border-green-600/50"
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ======================
// Tabs
// ======================
function EventsTab({
  events,
  teams,
}: {
  events: MatchEvent[];
  teams: {
    home: { team_id: number; name: string };
    away: { team_id: number; name: string };
  };
}) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-card-dark rounded-xl p-8 text-center border border-green-800/30">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No events recorded for this match</p>
      </div>
    );
  }

  return (
    <div className="glass-card-dark rounded-xl p-6 border border-green-800/30">
      <h3 className="text-xl text-gray-100 mb-6 flex items-center space-x-2">
        <Clock className="w-5 h-5 text-green-400" />
        <span>Match Events</span>
      </h3>
      <div className="space-y-3">
        {events.map((event) => {
          const isHomeTeam = event.team_id === teams.home.team_id;
          const teamName = isHomeTeam ? teams.home.name : teams.away.name;

          const pillClass =
            event.type === "Goal"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : event.type === "Card"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30";

          const avatarClass =
            event.type === "Goal"
              ? "bg-green-500/20 border border-green-500/30"
              : event.type === "Card"
              ? "bg-yellow-500/20 border border-yellow-500/30"
              : "bg-blue-500/20 border border-blue-500/30";

          const icon =
            event.type === "Goal" ? "⚽" : event.type === "Card" ? "🟨" : "🔁";

          return (
            <div
              key={event.event_id}
              className="glass-dark rounded-lg p-4 border border-green-800/20 flex items-center justify-between glass-hover-dark transition-all duration-200"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${avatarClass}`}
                >
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${pillClass}`}>
                      {event.detail}
                    </span>
                    <span className="text-gray-400 text-sm">{teamName}</span>
                  </div>
                  <p className="text-gray-200">
                    {event.player_name || `Player #${event.player_id}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl text-green-400 mb-1">{event.elapsed}'</div>
                <div className="text-xs text-gray-500">Min</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsTab({
  stats,
  teams,
}: {
  stats: TeamStat[];
  teams: {
    home: { team_id: number; name: string };
    away: { team_id: number; name: string };
  };
}) {
  const statTypes = Array.from(new Set(stats.map((s) => s.type)));

  return (
    <div className="glass-card-dark rounded-xl p-6 border border-green-800/30">
      <h3 className="text-xl text-gray-100 mb-6 flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        <span>Team Statistics</span>
      </h3>
      <div className="space-y-6">
        {statTypes.map((statType) => {
          const homeStat = stats.find(
            (s) => s.type === statType && s.team_id === teams.home.team_id
          );
          const awayStat = stats.find(
            (s) => s.type === statType && s.team_id === teams.away.team_id
          );

          const homeValue = parseFloat(homeStat?.value || "0");
          const awayValue = parseFloat(awayStat?.value || "0");
          const total = homeValue + awayValue;
          const homePercentage = total > 0 ? (homeValue / total) * 100 : 50;
          const awayPercentage = total > 0 ? (awayValue / total) * 100 : 50;

          return (
            <div key={statType} className="glass-dark rounded-lg p-4 border border-green-800/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-green-400">{homeStat?.value || "0"}</span>
                <span className="text-gray-300 text-sm">{statType}</span>
                <span className="text-green-400">{awayStat?.value || "0"}</span>
              </div>

              <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-500 transition-all duration-500"
                  style={{ width: `${homePercentage}%` }}
                />
                <div
                  className="bg-gradient-to-l from-blue-600 to-blue-500 transition-all duration-500"
                  style={{ width: `${awayPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{teams.home.name}</span>
                <span>{teams.away.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayersTab({
  players,
  teams,
}: {
  players: Player[];
  teams: {
    home: { team_id: number; name: string };
    away: { team_id: number; name: string };
  };
}) {
  const homePlayers = players.filter((p) => p.team_id === teams.home.team_id);
  const awayPlayers = players.filter((p) => p.team_id === teams.away.team_id);

  const PlayerCard = ({ player }: { player: Player }) => (
    <div className="glass-dark rounded-lg p-4 border border-green-800/20 glass-hover-dark transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
              player.position === "G"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : player.position === "D"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : player.position === "M"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {player.position}
          </div>
          <div>
            <p className="text-gray-200">{player.name}</p>
            <p className="text-xs text-gray-500">
              {player.position === "G"
                ? "Goalkeeper"
                : player.position === "D"
                ? "Defender"
                : player.position === "M"
                ? "Midfielder"
                : "Forward"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {player.stats.map((stat) => (
          <div key={stat.type} className="bg-black/20 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">{stat.type}</div>
            <div className="text-green-400">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card-dark rounded-xl p-6 border border-green-800/30">
        <h3 className="text-xl text-gray-100 mb-6 flex items-center space-x-2">
          <Users className="w-5 h-5 text-green-400" />
          <span>{teams.home.name}</span>
        </h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
          {homePlayers.map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </div>
      </div>

      <div className="glass-card-dark rounded-xl p-6 border border-green-800/30">
        <h3 className="text-xl text-gray-100 mb-6 flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span>{teams.away.name}</span>
        </h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
          {awayPlayers.map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================
// Mock generators (used only if match has no details)
// ======================
function generateMockEvents(match: Match, elapsed: number): MatchEvent[] {
  const events: MatchEvent[] = [];
  const homeGoals = match.goals.home || 0;
  const awayGoals = match.goals.away || 0;

  for (let i = 0; i < homeGoals; i++) {
    events.push({
      event_id: `${match.fixture.id}-home-goal-${i}`,
      team_id: match.teams.home.id,
      player_id: 1000 + i,
      player_name: `${match.teams.home.name} Player ${i + 1}`,
      type: "Goal",
      detail: "Normal Goal",
      elapsed: Math.floor(Math.random() * Math.max(elapsed, 1)),
    });
  }

  for (let i = 0; i < awayGoals; i++) {
    events.push({
      event_id: `${match.fixture.id}-away-goal-${i}`,
      team_id: match.teams.away.id,
      player_id: 2000 + i,
      player_name: `${match.teams.away.name} Player ${i + 1}`,
      type: "Goal",
      detail: "Normal Goal",
      elapsed: Math.floor(Math.random() * Math.max(elapsed, 1)),
    });
  }

  // a couple of cards
  events.push({
    event_id: `${match.fixture.id}-card-1`,
    team_id: match.teams.home.id,
    player_id: 1100,
    player_name: `${match.teams.home.name} Defender`,
    type: "Card",
    detail: "Yellow Card",
    elapsed: Math.floor(Math.random() * Math.max(elapsed, 1)),
  });

  events.push({
    event_id: `${match.fixture.id}-card-2`,
    team_id: match.teams.away.id,
    player_id: 2100,
    player_name: `${match.teams.away.name} Midfielder`,
    type: "Card",
    detail: "Yellow Card",
    elapsed: Math.floor(Math.random() * Math.max(elapsed, 1)),
  });

  return events.sort((a, b) => a.elapsed - b.elapsed);
}

function generateMockStats(match: Match): TeamStat[] {
  return [
    {
      team_id: match.teams.home.id,
      type: "Shots on Goal",
      value: String(Math.floor(Math.random() * 10) + 5),
    },
    {
      team_id: match.teams.away.id,
      type: "Shots on Goal",
      value: String(Math.floor(Math.random() * 10) + 5),
    },
    {
      team_id: match.teams.home.id,
      type: "Total Shots",
      value: String(Math.floor(Math.random() * 15) + 10),
    },
    {
      team_id: match.teams.away.id,
      type: "Total Shots",
      value: String(Math.floor(Math.random() * 15) + 10),
    },
    {
      team_id: match.teams.home.id,
      type: "Possession %",
      value: String(Math.floor(Math.random() * 30) + 40),
    },
    {
      team_id: match.teams.away.id,
      type: "Possession %",
      value: String(100 - (Math.floor(Math.random() * 30) + 40)),
    },
    {
      team_id: match.teams.home.id,
      type: "Passes",
      value: String(Math.floor(Math.random() * 300) + 200),
    },
    {
      team_id: match.teams.away.id,
      type: "Passes",
      value: String(Math.floor(Math.random() * 300) + 200),
    },
    {
      team_id: match.teams.home.id,
      type: "Pass Accuracy %",
      value: String(Math.floor(Math.random() * 20) + 70),
    },
    {
      team_id: match.teams.away.id,
      type: "Pass Accuracy %",
      value: String(Math.floor(Math.random() * 20) + 70),
    },
    {
      team_id: match.teams.home.id,
      type: "Fouls",
      value: String(Math.floor(Math.random() * 10) + 5),
    },
    {
      team_id: match.teams.away.id,
      type: "Fouls",
      value: String(Math.floor(Math.random() * 10) + 5),
    },
    {
      team_id: match.teams.home.id,
      type: "Corners",
      value: String(Math.floor(Math.random() * 8) + 2),
    },
    {
      team_id: match.teams.away.id,
      type: "Corners",
      value: String(Math.floor(Math.random() * 8) + 2),
    },
    {
      team_id: match.teams.home.id,
      type: "Offsides",
      value: String(Math.floor(Math.random() * 5)),
    },
    {
      team_id: match.teams.away.id,
      type: "Offsides",
      value: String(Math.floor(Math.random() * 5)),
    },
    {
      team_id: match.teams.home.id,
      type: "Yellow Cards",
      value: String(Math.floor(Math.random() * 3)),
    },
    {
      team_id: match.teams.away.id,
      type: "Yellow Cards",
      value: String(Math.floor(Math.random() * 3)),
    },
  ];
}

function generateMockPlayers(match: Match): Player[] {
  const positions = ["G", "D", "M", "F"] as const;
  const players: Player[] = [];

  for (let i = 0; i < 11; i++) {
    players.push({
      player_id: 1000 + i,
      team_id: match.teams.home.id,
      name: `${match.teams.home.name} Player ${i + 1}`,
      position: positions[Math.floor(i / 3) % 4],
      stats: [
        { type: "Shots", value: String(Math.floor(Math.random() * 5)) },
        { type: "Passes", value: String(Math.floor(Math.random() * 50) + 10) },
        { type: "Tackles", value: String(Math.floor(Math.random() * 5)) },
        {
          type: "Pass Accuracy %",
          value: String(Math.floor(Math.random() * 20) + 70),
        },
      ],
    });
  }

  for (let i = 0; i < 11; i++) {
    players.push({
      player_id: 2000 + i,
      team_id: match.teams.away.id,
      name: `${match.teams.away.name} Player ${i + 1}`,
      position: positions[Math.floor(i / 3) % 4],
      stats: [
        { type: "Shots", value: String(Math.floor(Math.random() * 5)) },
        { type: "Passes", value: String(Math.floor(Math.random() * 50) + 10) },
        { type: "Tackles", value: String(Math.floor(Math.random() * 5)) },
        {
          type: "Pass Accuracy %",
          value: String(Math.floor(Math.random() * 20) + 70),
        },
      ],
    });
  }

  return players;
}
