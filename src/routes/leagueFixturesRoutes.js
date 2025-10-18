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
const DELAY_BETWEEN_LEAGUES = 3000; // ms delay to avoid HTTP 429


router.get("/", async (req, res) => {
  const season = new Date().getFullYear();
  const results = [];

  try {
    console.log("Route hit: /leagueFixtures");

    for (const { name, id } of LEAGUES) {
      console.log(`Fetching fixtures for ${name} (${season})`);

      try {
        const fixtures = await fetchFixturesByLeague(id, season);
        console.log(`→ ${fixtures?.length || 0} fixtures received`);

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

        // fetch details concurrently but safely
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

        const detailedFixtures = await asyncPool(CONCURRENCY, pastOrLive, fetchDetail);

        // deduplicate fixtures by fixture id before saving
        const dedupedFixtures = Object.values(
          detailedFixtures.reduce((acc, f) => {
            const id = f.fixture?.id;
            if (!acc[id]) acc[id] = f;
            return acc;
          }, {})
        );

        // save to DB safely
        if (FAST_RESPONSE) {
          saveFixturesBatch(dedupedFixtures)
            .catch((e) => console.error("Background saveFixturesBatch error:", e.message));
        } else {
          try {
            await saveFixturesBatch(dedupedFixtures);
          } catch (e) {
            if (e.message.includes("ON CONFLICT")) {
              console.warn(`⚠️ Skipping duplicate conflict for ${name}`);
            } else {
              console.error(`DB save error for ${name}:`, e.message);
            }
          }
        }

        results.push({
          league: name,
          totalFixtures: fixtures.length,
          detailed: dedupedFixtures.length,
          fixtures: [...dedupedFixtures, ...upcoming],
        });

        // wait between leagues to avoid API-Sports rate limit (429)
        console.log(`⏳ Waiting ${DELAY_BETWEEN_LEAGUES / 1000}s before next league...`);
        await delay(DELAY_BETWEEN_LEAGUES);

      } catch (leagueErr) {
        console.error(`Error fetching fixtures for league ${name}:`, leagueErr.message);
        results.push({
          league: name,
          error: leagueErr.message,
          fixtures: [],
          totalFixtures: 0,
        });
      }
    }

    const allFixtures = results.flatMap(r => r.fixtures || []);
    res.status(200).json(convertBigInts({
      message: "Fetched (and saved) league fixtures.",
      totalLeagues: results.length,
      totalFixtures: allFixtures.length,
      results,
      fixtures: allFixtures,
    }));

  } catch (err) {
    console.error("Error in /leagueFixtures route:", err);
    res.status(500).json({ error: "Failed to fetch league fixtures", details: err.message });
  }
});

export default router;