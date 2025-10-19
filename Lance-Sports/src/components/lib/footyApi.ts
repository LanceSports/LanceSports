// src/lib/footyApi.ts
// Uses Vite env if present, otherwise your Render URL.
// IMPORTANT: do not include a trailing slash.
const BASE =
  (import.meta as any)?.env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://lancesports-fixtures-api.onrender.com";

const CHATBOT = "https://lancesports-3kmd.onrender.com"

export async function askFootyBot(message: string): Promise<string> {
  const resp = await fetch(`${CHATBOT}/api/football-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!resp.ok) {
    // Bubble up a readable error for the UI
    const text = await resp.text().catch(() => "");
    throw new Error(`API ${resp.status} ${resp.statusText}: ${text}`.trim());
  }

  const data = await resp.json().catch(() => ({}));
  return data?.reply ?? "Sorry, I couldn't generate a reply.";
}

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number | null;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
      extra: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
  events: Array<{
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
  }>;
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    statistics: Array<{
      type: string;
      value: number | string | null;
    }>;
  }>;
  players: any[];
}

export interface LeagueFixturesResponse {
  message: string;
  totalLeagues: number;
  totalFixtures: number;
  results: Array<{
    league: string;
    totalFixtures: number;
    detailed: number;
    fixtures: ApiFixture[];
  }>;
}

export async function fetchLeagueFixtures(): Promise<LeagueFixturesResponse> {
  // Create a timeout promise that rejects after 15 minutes (900 seconds)
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout - API is taking too long to respond (15+ minutes)'));
    }, 15 * 60 * 1000); // 15 minutes
  });

  // Create the fetch promise

  /* LIVE API CALL : fetch(`${BASE}/leagueFixtures`....)*/
  
  const fetchPromise =fetch(`${BASE}/leagueFixtures`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  try {
    // Race between fetch and timeout
    const resp = await Promise.race([fetchPromise, timeoutPromise]);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`API ${resp.status} ${resp.statusText}: ${text}`.trim());
    }

    const data = await resp.json().catch(() => ({}));
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('API is taking too long to respond. This is normal for the first request as the server needs to wake up. Please try again in a few minutes.');
      }
      throw error;
    }
    throw new Error('Unknown error occurred while fetching data');
  }
}
