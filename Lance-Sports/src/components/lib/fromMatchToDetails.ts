// lib/fromMatchToDetails.ts
import type { Match } from "../types/Match";

export interface MatchEvent {
  event_id: string;
  team_id: number;
  player_id: number;
  player_name: string;
  type: string;
  detail: string;
  elapsed: number;
}


export interface TeamStat {
  team_id: number;
  type: string;
  value: string | null;
}

export interface PlayerStat { type: string; value: string }
export interface Player {
  player_id: number;
  team_id: number;
  name: string;
  position: string;
  stats: PlayerStat[];
}

export interface MatchDetailData {
  fixture_id: number;
  league: { league_id: number; name: string };
  venue: { venue_id: number; name: string };
  teams: {
    home: { team_id: number; name: string; logo?: string };
    away: { team_id: number; name: string; logo?: string };
  };
  goals: { home: number; away: number };
  status: { short: string; long: string };
  events: MatchEvent[];
  stats: TeamStat[];
  players: Player[];
}

const toNum = (v: unknown, d = 0) =>
  typeof v === "number" && !Number.isNaN(v)
    ? v
    : typeof v === "string"
    ? Number(v.replace(/[^\d.-]/g, "")) || d
    : d;

export function fromMatchToDetails(match: Match): MatchDetailData {
  const events: MatchEvent[] = (match.events ?? []).map((e, i) => ({
    event_id: String(e.id ?? `${match.fixture.id}-${i}`),
    team_id: e.team?.id ?? 0,
    player_id: e.player?.id ?? 0,
    player_name: e.player?.name ?? "Unknown Player",
    type: e.type ?? "Unknown",
    detail: e.detail ?? "Unknown Detail",
    elapsed: e.time?.elapsed ?? 0,
  }));

  const stats: TeamStat[] = (match.statistics ?? []).flatMap((row) =>
    (row.statistics ?? []).map((s) => ({
      team_id: row.team.id,
      type: s.type ?? "Unknown",
      value:
        s.value === null || s.value === undefined
          ? null  // Keep null values as null instead of converting to "0"
          : typeof s.value === "number"
          ? String(s.value)
          : String(s.value),
    }))
  );

  // Process players data from the new structure
  const players: Player[] = (match.players ?? []).flatMap((teamData) =>
    (teamData.players ?? []).map((playerData) => {
      const playerStats = playerData.statistics?.[0]; // Get the first (and typically only) statistics object
      const playerStatArray: PlayerStat[] = [];

      // Extract key statistics and convert to PlayerStat format
      if (playerStats?.games) {
        playerStatArray.push({ type: "Position", value: playerStats.games.position || "Unknown" });
        if (playerStats.games.rating) {
          playerStatArray.push({ type: "Rating", value: playerStats.games.rating });
        }
        if (playerStats.games.minutes !== null) {
          playerStatArray.push({ type: "Minutes", value: String(playerStats.games.minutes) });
        }
      }

      if (playerStats?.goals) {
        if (playerStats.goals.total !== null) {
          playerStatArray.push({ type: "Goals", value: String(playerStats.goals.total) });
        }
        if (playerStats.goals.assists !== null) {
          playerStatArray.push({ type: "Assists", value: String(playerStats.goals.assists) });
        }
      }

      if (playerStats?.shots) {
        if (playerStats.shots.total !== null) {
          playerStatArray.push({ type: "Shots", value: String(playerStats.shots.total) });
        }
        if (playerStats.shots.on !== null) {
          playerStatArray.push({ type: "Shots on Target", value: String(playerStats.shots.on) });
        }
      }

      if (playerStats?.passes) {
        if (playerStats.passes.total !== null) {
          playerStatArray.push({ type: "Passes", value: String(playerStats.passes.total) });
        }
        if (playerStats.passes.accuracy !== null) {
          playerStatArray.push({ type: "Pass Accuracy %", value: String(playerStats.passes.accuracy) });
        }
      }

      if (playerStats?.tackles) {
        if (playerStats.tackles.total !== null) {
          playerStatArray.push({ type: "Tackles", value: String(playerStats.tackles.total) });
        }
      }

      if (playerStats?.cards) {
        const yellowCards = playerStats.cards.yellow || 0;
        const redCards = playerStats.cards.red || 0;
        if (yellowCards > 0) {
          playerStatArray.push({ type: "Yellow Cards", value: String(yellowCards) });
        }
        if (redCards > 0) {
          playerStatArray.push({ type: "Red Cards", value: String(redCards) });
        }
      }

      return {
        player_id: playerData.player.id,
        team_id: teamData.team.id,
        name: playerData.player.name,
        position: playerStats?.games?.position || "Unknown",
        stats: playerStatArray,
      };
    })
  );

  return {
    fixture_id: match.fixture.id,
    league: { league_id: match.league.id, name: match.league.name },
    venue: {
      venue_id: match.fixture.venue?.id ?? 0,
      name: match.fixture.venue?.name ?? "Unknown Venue",
    },
    teams: {
      home: {
        team_id: match.teams.home.id,
        name: match.teams.home.name,
        logo: match.teams.home.logo ?? undefined,
      },
      away: {
        team_id: match.teams.away.id,
        name: match.teams.away.name,
        logo: match.teams.away.logo ?? undefined,
      },
    },
    goals: {
      home: toNum(match.goals.home, 0),
      away: toNum(match.goals.away, 0),
    },
    status: {
      short: match.fixture.status.short,
      long: match.fixture.status.long,
    },
    events,
    stats,
    players,
  };
}
