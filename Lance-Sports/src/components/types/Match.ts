// types/Match.ts
export interface Match {
  fixture: {
    id: number;
    date: string;
    periods: { first: number | null; second: number | null };
    referee: string | null;
    timezone: string;
    timestamp: number;
    venue: { id: number; name: string; city: string };
    status: { short: string; long: string; elapsed?: number | null; extra?: number | null };
  };
  league: { 
    id: number; 
    name: string;
    country: string;
    flag: string;
    logo: string;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner?: boolean | null };
    away: { id: number; name: string; logo: string; winner?: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };

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
    team: { id: number; name: string; logo?: string; update?: string };
    statistics: Array<{ type: string; value: number | string | null }>;
  }>;

  players?: Array<{
    team: { id: number; name: string; logo: string; update?: string };
    players: Array<{
      player: {
        id: number;
        name: string;
        photo?: string;
      };
      statistics: Array<{
        games?: {
          minutes: number | null;
          number: number | null;
          position: string;
          rating: string | null;
          captain: boolean;
          substitute: boolean;
        };
        offsides?: number | null;
        shots?: {
          total: number | null;
          on: number | null;
        };
        goals?: {
          total: number | null;
          conceded: number | null;
          assists: number | null;
          saves: number | null;
        };
        passes?: {
          total: number | null;
          key: number | null;
          accuracy: number | null;
        };
        tackles?: {
          total: number | null;
          blocks: number | null;
          interceptions: number | null;
        };
        duels?: {
          total: number | null;
          won: number | null;
        };
        dribbles?: {
          attempts: number | null;
          success: number | null;
          past: number | null;
        };
        fouls?: {
          drawn: number | null;
          committed: number | null;
        };
        cards?: {
          yellow: number | null;
          yellowred: number | null;
          red: number | null;
        };
        penalty?: {
          won: number | null;
          commited: number | null;
          scored: number | null;
          missed: number | null;
          saved: number | null;
        };
      }>;
    }>;
  }>;
}

