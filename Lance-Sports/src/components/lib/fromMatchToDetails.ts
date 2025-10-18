// lib/fromMatchToDetails.ts
import type { Match } from "../types/Match";

export interface MatchEvent {
  event_id: string;
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}


export interface TeamStat {
  team_id: number;
  type: string;
  value: string;
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
    time: {
      elapsed: e.time?.elapsed ?? 0,
      extra: e.time?.extra ?? null,
    },
    team: {
      id: e.team?.id ?? 0,
      name: e.team?.name ?? "Unknown Team",
      logo: e.team?.logo ?? "",
    },
    player: {
      id: e.player?.id ?? 0,
      name: e.player?.name ?? "Unknown Player",
    },
    assist: {
      id: e.assist?.id ?? null,
      name: e.assist?.name ?? null,
    },
    type: e.type ?? "Unknown",
    detail: e.detail ?? "Unknown Detail",
    comments: e.comments ?? null,
  }));

  const stats: TeamStat[] = (match.statistics ?? []).flatMap((row) =>
    (row.statistics ?? []).map((s) => ({
      team_id: row.team.id,
      type: s.type ?? "Unknown",
      value:
        s.value === null || s.value === undefined
          ? "0"
          : typeof s.value === "number"
          ? String(s.value)
          : String(s.value),
    }))
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
    players: [], // will synthesize if needed in the component
  };
}
