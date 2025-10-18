import express from "express";
import { fetchFixturesByLeague, fetchFixtureDetails } from "../services/apiService.js";
import { saveFixtures } from "../services/dbService.js";
import { delay } from "../utils/rateLimit.js";

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

router.get("/", async (req, res) => {
  const season = new Date().getFullYear(); // current year
  const RATE_LIMIT_DELAY = 200; // 5 calls/s (≈300 rpm)

  const results = [];

  try {
    for (const { name, id } of LEAGUES) {
      console.log(`Fetching fixtures for ${name} (${season})`);

      // 1️⃣ Fetch fixtures for this league & year
      const fixtures = await fetchFixturesByLeague(id, season);

      if (!fixtures?.length) {
        results.push({ league: name, totalFixtures: 0, detailed: 0, fixtures: [] });
        continue;
      }

      const detailedFixtures = [];
      let processed = 0;

      // 2️⃣ Fetch details (live + past + upcoming)
      for (const fixture of fixtures) {
        if (!fixture.fixture) continue;
        const fixtureId = fixture.fixture.id;

        try {
          const details = await fetchFixtureDetails(fixtureId);
          detailedFixtures.push({ ...fixture, ...details });
          processed++;
        } catch (err) {
          console.error(`❌ ${name}: failed fetching fixture ${fixtureId}`, err.message);
        }

        await delay(RATE_LIMIT_DELAY);
      }

      // 3️⃣ Save to DB
      await saveFixtures(detailedFixtures);

      // 4️⃣ Collect for response
      results.push({
        league: name,
        totalFixtures: fixtures.length,
        detailed: processed,
        fixtures: detailedFixtures,
      });
    }

    // 5️⃣ Flatten all fixtures and send full payload
    const allFixtures = results.flatMap(r => r.fixtures || []);

    res.status(200).json(
      convertBigInts({
        message: "✅ Successfully fetched, saved, and returned league fixtures.",
        totalLeagues: results.length,
        totalFixtures: allFixtures.length,
        results,
        fixtures: allFixtures,
      })
    );
  } catch (err) {
    console.error("Error in /fixtures/leagues route:", err.message);
    res.status(500).json({ error: "Failed to fetch league fixtures" });
  }
});

export default router;