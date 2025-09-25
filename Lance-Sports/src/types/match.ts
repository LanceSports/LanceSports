export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'HT' | 'FT' | 'ET' | 'PEN';

export type EventType = 
  | 'GOAL' 
  | 'ASSIST' 
  | 'FOUL' 
  | 'CARD_YELLOW' 
  | 'CARD_RED' 
  | 'SUBSTITUTION' 
  | 'OFFSIDE' 
  | 'KICKOFF' 
  | 'PAUSE' 
  | 'RESUME' 
  | 'HALF_TIME' 
  | 'FULL_TIME' 
  | 'VAR' 
  | 'PENALTY_SCORED' 
  | 'PENALTY_MISSED';

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number?: number;
  position?: string;
}

export interface Match {
  id: string;
  league?: string;
  venue?: string;
  scheduledStart: string; // ISO string
  status: MatchStatus;
  clock: string; // 'MM:SS' format
  homeTeamId: string;
  awayTeamId: string;
  possessionTeamId?: string;
  scoreHome: number;
  scoreAway: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  createdAt: string; // ISO string
  clock: string; // game time when event occurred
  teamId?: string;
  type: EventType;
  description?: string;
  playerInId?: string;
  playerOutId?: string;
  playerId?: string;
  assistId?: string;
  scoreHome?: number;
  scoreAway?: number;
  meta?: Record<string, any>;
}

export interface MatchStore {
  teams: Team[];
  matches: Match[];
  events: MatchEvent[];
  players: Player[];
  selectedMatchId?: string;
}