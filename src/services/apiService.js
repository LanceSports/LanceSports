// src/services/apiService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY;

// Helper: retry on 429
async function fetchWithRetry(fetchFn, retries = 3) {
  try {
    return await fetchFn();
  } catch (err) {
    if (err.response?.status === 429 && retries > 0) {
      const retryAfter = parseInt(err.response.headers["retry-after"] || "1", 10);
      const waitMs = retryAfter * 1000;
      console.warn(`429 Too Many Requests. Retrying after ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
      return fetchWithRetry(fetchFn, retries - 1);
    }
    throw err;
  }
}

// Fetch fixtures by date
export async function fetchFixturesByDate(date) {
  return fetchWithRetry(() =>
    axios
      .get(`${API_BASE}/fixtures`, {
        params: { date },
        headers: { "x-apisports-key": API_KEY },
      })
      .then((res) => res.data.response)
  );
}

// Fetch detailed info for a single fixture
export async function fetchFixtureDetails(fixtureId) {
  return fetchWithRetry(async () => {
    const [eventsRes, statsRes, playersRes] = await Promise.all([
      axios.get(`${API_BASE}/fixtures/events`, {
        params: { fixture: fixtureId },
        headers: { "x-apisports-key": API_KEY },
      }),
      axios.get(`${API_BASE}/fixtures/statistics`, {
        params: { fixture: fixtureId },
        headers: { "x-apisports-key": API_KEY },
      }),
      axios.get(`${API_BASE}/fixtures/players`, {
        params: { fixture: fixtureId },
        headers: { "x-apisports-key": API_KEY },
      }),
    ]);

    return {
      events: eventsRes.data.response || [],
      statistics: statsRes.data.response || [],
      players: playersRes.data.response || [],
    };
  });
}

// Fetch fixtures by league
export async function fetchFixturesByLeague(leagueId, season) {
  return fetchWithRetry(() =>
    axios
      .get(`${API_BASE}/fixtures`, {
        params: { league: leagueId, season },
        headers: { "x-apisports-key": API_KEY },
      })
      .then((res) => res.data.response)
  );
}
export async function fetchStandings(leagueId, season) {
  try {
    const res = await axios.get(`${API_BASE}/standings`, {
      params: { league: leagueId, season },
      headers: { "x-apisports-key": API_KEY },
    });

    return res.data.response.flatMap((entry) =>
      entry.league.standings.flatMap((group) =>
        group.map((t) => ({
          league_id: entry.league.id,
          season: entry.league.season,
          team_id: t.team.id,
          team_name: t.team.name,
          rank: t.rank,
          points: t.points,
          goals_diff: t.goalsDiff,
          form: t.form,
          played: t.all.played,
          win: t.all.win,
          draw: t.all.draw,
          lose: t.all.lose,
          goals_for: t.all.goals.for,
          goals_against: t.all.goals.against,
          updated_at: new Date().toISOString(),
        }))
      )
    );
  } catch (err) {
    console.error(`Error fetching standings for league ${leagueId}:`, err.message);
    return [];
  }
}


export async function fetchOdds(leagueId, season) {
  try {
    const res = await axios.get(`${API_BASE}/odds`, {
      params: { league: leagueId, season },
      headers: { "x-apisports-key": API_KEY },
    });
    return res.data.response || [];
  } catch (err) {
    console.error(`Error fetching odds for league ${leagueId}:`, err.message);
    return [];
  }
}



/*import axios from "axios";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY;

export async function fetchFixturesByDate(date) {
   //console.log("fetchFixturesByDate CALLED with date:", date);
  try {
      //console.log("Hello World!");
      const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { date },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
      
    });
    //console.log("Hello World!");
    //console.log("Raw API response:", res.error);
    //console.log("Raw API response:", JSON.stringify(res.data, null, 2));
    return res.data.response; // only fixtures array
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    throw err;
  }
}
*/




/*
import axios from "axios";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY;

export async function fetchFixturesByDate(date) {
  try {
      console.log("Hello World!");
      const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { date },
      headers: { "x-apisports-key": API_KEY }
    });
    return res.data.response; // only fixtures array
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    throw err;
  }
}
*/