// src/services/apiService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_SPORTS_KEY;

// Fetch basic fixtures by date (you already have this)
export async function fetchFixturesByDate(date) {
  try {
    const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { date },
      headers: { "x-apisports-key": API_KEY },
    });
    //console.log("Raw API response:", JSON.stringify(res.data, null, 2));
    return res.data.response;
    

  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
    throw err;
  }
}

// ✅ New: Fetch detailed info for a single fixture
export async function fetchFixtureDetails(fixtureId) {
  try {
    // 1. Fixture events
    const eventsPromise = axios.get(`${API_BASE}/fixtures/events`, {
      params: { fixture: fixtureId },
      headers: { "x-apisports-key": API_KEY },
    });

    // 2. Fixture statistics
    const statsPromise = axios.get(`${API_BASE}/fixtures/statistics`, {
      params: { fixture: fixtureId },
      headers: { "x-apisports-key": API_KEY },
    });

    // 3. Fixture players
    const playersPromise = axios.get(`${API_BASE}/players`, {
      params: { fixture: fixtureId },
      headers: { "x-apisports-key": API_KEY },
    });

    // Wait for all to complete
    const [eventsRes, statsRes, playersRes] = await Promise.all([
      eventsPromise,
      statsPromise,
      playersPromise,
    ]);

    return {
      events: eventsRes.data.response || [],
      statistics: statsRes.data.response || [],
      players: playersRes.data.response || [],
    };
  } catch (err) {
    console.error(`Error fetching details for fixture ${fixtureId}:`, err.message);
    return { events: [], statistics: [], players: [] }; // return empty arrays on failure
  }
}


export async function fetchFixturesByLeague(leagueId, season) {
  try {
    const res = await axios.get(`${API_BASE}/fixtures`, {
      params: { league: leagueId, season },
      headers: { "x-apisports-key": API_KEY },
    });
    return res.data.response;
  } catch (err) {
    console.error(`Error fetching fixtures for league ${leagueId}:`, err.message);
    throw err;
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