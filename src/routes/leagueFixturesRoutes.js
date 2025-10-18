import express from "express";
import { fetchFixturesByLeague, fetchFixtureDetails } from "../services/apiService.js";
import { saveFixturesBatch } from "../services/dbService.js";
import { delay } from "../utils/rateLimit.js";
import { asyncPool } from "../utils/asyncPool.js";

const router = express.Router();

// Leagues + IDs
const LEAGUES = [
  { name: "EPL", id: 39 },
  { name: "UCL", id: 2 },
  { name: "Premier Soccer League", id: 288 },
];

// Helper — safely stringify BigInts before sending JSON
function convertBigInts(obj) {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(convertBigInts);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, convertBigInts(v)]));
  }
  return obj;
}

const RATE_LIMIT_RPM = 450;
const RPS = Math.floor(RATE_LIMIT_RPM / 60); // requests per second allowed
const CONCURRENCY = Math.max(1, Math.floor(RPS * 0.8)); // be conservative (e.g., ~6)
const FAST_RESPONSE = true; // if true: return DB/fixtures quickly, update DB in background

router.get("/", async (req, res) => {
  const season = new Date().getFullYear();
  try {
    const results = [];

    for (const { name, id } of LEAGUES) {
      console.log(`Fetching fixtures for ${name} (${season})`);
      const fixtures = await fetchFixturesByLeague(id, season);

      if (!fixtures?.length) {
        results.push({ league: name, totalFixtures: 0, detailed: 0, fixtures: [] });
        continue;
      }

      // separate upcoming vs past/live
      const upcoming = [];
      const pastOrLive = [];
      for (const f of fixtures) {
        const status = f.fixture?.status?.short || "NS";
        const isPastOrLive = status !== "NS" && status !== "TBD" && status !== "PST";
        if (isPastOrLive) pastOrLive.push(f);
        else upcoming.push(f);
      }

      // If no past/live fixtures, return quickly
      if (!pastOrLive.length) {
        results.push({
          league: name,
          totalFixtures: fixtures.length,
          detailed: 0,
          fixtures: upcoming,
        });
        continue;
      }

      // Option A: FAST_RESPONSE -> return upcoming + any existing DB entries quickly
      // Option B: FRESH_RESPONSE -> await details and return them
      // We'll do: fetch details concurrently (limited), then batch-save

      // fetch details concurrently, limited by CONCURRENCY
      const fetchDetail = async (apiFixture) => {
        const fixtureId = apiFixture.fixture?.id;
        try {
          const details = await fetchFixtureDetails(fixtureId);
          return { ...apiFixture, ...details };
        } catch (err) {
          console.error(`Failed fetching details for ${fixtureId}:`, err.message);
          return { ...apiFixture, events: [], statistics: [], players: [] };
        }
      };

      // concurrency-limited fetch
      const detailedFixtures = await asyncPool(CONCURRENCY, pastOrLive, fetchDetail);

      // Batch save (one set of upserts per table)
      // If you want FAST_RESPONSE you can call this without `await` (fire-and-forget).
      if (FAST_RESPONSE) {
        // fire-and-forget: do not block response
        saveFixturesBatch(detailedFixtures).catch(e => console.error("Background saveFixturesBatch error:", e));
      } else {
        // wait until DB is updated before returning
        await saveFixturesBatch(detailedFixtures);
      }

      // Compose response: upcoming fixtures + detailedFixtures
      const returned = [...detailedFixtures, ...upcoming];
      results.push({
        league: name,
        totalFixtures: fixtures.length,
        detailed: detailedFixtures.length,
        fixtures: returned,
      });
    } // end leagues loop

    const allFixtures = results.flatMap(r => r.fixtures || []);
    res.status(200).json(convertBigInts({
      message: "Fetched (and saved) league fixtures.",
      totalLeagues: results.length,
      totalFixtures: allFixtures.length,
      results,
      fixtures: allFixtures,
    }));
  } catch (err) {
    console.error("Error in /fixtures/leagues route:", err);
    res.status(500).json({ error: "Failed to fetch league fixtures" });
  }
});

export default router;