// src/routes/fixturesRoutes.js
import express from "express";
import { fetchFixturesByDate, fetchFixtureDetails } from "../services/apiService.js";
import { saveFixtures } from "../services/dbService.js";
import { transformFixture } from "../utils/transform.js";

const router = express.Router();

const MAX_DETAILS_CALLS = 5;

// Helper to safely stringify BigInts
// Recursive conversion of BigInt to string
function convertBigInts(obj) {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(convertBigInts);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigInts(v)])
    );
  }
  return obj;
}


router.get("/", async (req, res) => {
  const { date } = req.query;

  try {
    const apiFixtures = await fetchFixturesByDate(date);
    if (!apiFixtures?.length) return res.status(200).json([]);

    const fullFixtures = [];
    let detailedCalls = 0;

    for (const apiFixture of apiFixtures) {
      if (!apiFixture.fixture) continue;
      const fixtureId = apiFixture.fixture.id;

      let details = {};
      // Only fetch detailed info if under the cap
      if (detailedCalls < MAX_DETAILS_CALLS) {
        try {
          details = await fetchFixtureDetails(fixtureId);
          detailedCalls++;
        } catch (err) {
          console.error(`Failed fetching details for fixture ${fixtureId}:`, err.message);
        }
      }

      fullFixtures.push({ ...apiFixture, ...details });
    }

    // Transform + save only detailed fixtures
    for (const apiFixture of fullFixtures) {
      const transformed = transformFixture(apiFixture);
      await saveFixtures([apiFixture]); // your dbService handles upserts
    }

    res.status(200).json(convertBigInts(fullFixtures));
  } catch (err) {
    console.error("Error in /fixtures route:", err);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

export default router;

/*// src/routes/fixturesRoutes.js
import express from "express";
import { fetchFixturesByDate, fetchFixtureDetails } from "../services/apiService.js";
import { saveFixtures } from "../services/dbService.js";
import { transformFixture } from "../utils/transform.js";
import { delay } from "../utils/rateLimit.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date query parameter is required, e.g., ?date=2025-09-30" });
  }

  try {
    // 1️⃣ Fetch fixtures for the date
    const apiFixtures = await fetchFixturesByDate(date);

    if (!apiFixtures?.length) {
      return res.status(200).json([]);
    }

    const detailedFixtures = [];
    const RATE_LIMIT_DELAY = 7000; // 7 seconds between requests (free plan: 10 req/min)

    // 2️⃣ Loop through each fixture to fetch detailed info
    for (const fixture of apiFixtures) {
      if (!fixture.fixture) {
        console.warn("Skipping fixture with missing data:", fixture);
        continue;
      }

      const fixtureId = fixture.fixture.id;

      try {
        const details = await fetchFixtureDetails(fixtureId);
        detailedFixtures.push({ ...fixture, ...details });
      } catch (err) {
        console.error(`Error fetching details for fixture ${fixtureId}:`, err.message);
        continue;
      }

      // Wait to respect API rate limit
      await delay(RATE_LIMIT_DELAY);
    }

    if (!detailedFixtures.length) {
      return res.status(200).json([]);
    }

    // 3️⃣ Transform + save each fixture (upsert to DB)
    for (const fixture of detailedFixtures) {
      await saveFixtures([fixture]);
    }

    // 4️⃣ Return the fixtures
    res.status(200).json(detailedFixtures);
  } catch (err) {
    console.error("Error in /fixtures route:", err.message);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

export default router;
*/

/*import express from "express";
import { getFixturesHandler } from "../controllers/fixturesController.js";

const router = express.Router();

router.get("/", getFixturesHandler);

export default router;
*/