// types/Match.ts
export interface Match {
  fixture: {
    id: number;
    venue: { id?: number | null; name?: string | null } | null;
    status: { short: string; long: string; elapsed?: number | null };
  };
  league: { id: number; name: string };
  teams: {
    home: { id: number; name: string; logo?: string | null };
    away: { id: number; name: string; logo?: string | null };
  };
  goals: { home?: number | null; away?: number | null };

  // Optional “details” attached to your match (if you have them)
  events?: Array<{
    id?: string | number;
    team?: { id: number; name?: string };
    player?: { id?: number; name?: string | null };
    type: string;     // "Goal" | "Card" | "subst" | ...
    detail?: string;  // "Normal Goal" | "Yellow Card" | ...
    time?: { elapsed?: number | null };
  }>;
  statistics?: Array<{
    team: { id: number; name: string };
    statistics: Array<{ type: string; value: number | string | null }>;
  }>;
  players?: any[]; // populate if you carry player lists on match
}
