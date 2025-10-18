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

  events?: Array<{
    id?: string | number;
    time?: { elapsed?: number | null; extra?: number | null };
    team?: { id: number; name?: string; logo?: string };
    player?: { id?: number; name?: string | null };
    assist?: { id?: number | null; name?: string | null };
    type?: string;
    detail?: string;
    comments?: string | null;
  }>;

  statistics?: Array<{
    team: { id: number; name: string };
    statistics: Array<{ type: string; value: number | string | null }>;
  }>;

  players?: any[];
}

