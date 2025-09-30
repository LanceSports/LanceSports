// src/routes/fixturesRoutes.js
import express from "express";
import { fetchFixturesByDate, fetchFixtureDetails } from "../services/apiService.js";
import { saveFixtures } from "../services/dbService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { date } = req.query

  try {
    // 1. Fetch fixtures from API
    const apiFixtures = await fetchFixturesByDate(date);

    if (!apiFixtures?.length) {
      return res.status(200).json([]);
    }

    const fullFixtures = [];

    // 2. Loop through each fixture and fetch detailed info
    for (const apiFixture of apiFixtures) {
      if (!apiFixture.fixture) {
        console.warn("Skipping fixture with missing data:", apiFixture);
        continue;
      }

      const fixtureId = apiFixture.fixture.id;

      try {
        const details = await fetchFixtureDetails(fixtureId);
        fullFixtures.push({ ...apiFixture, ...details });
      } catch (err) {
        console.error(`Error fetching details for fixture ${fixtureId}:`, err.message);
        continue; // skip this fixture if details fail
      }
    }

    if (!fullFixtures.length) {
      return res.status(200).json([]);
    }

    // 3. Save everything (dbService handles leagues, venues, fixtures, teams, events, stats, players, etc.)
    await saveFixtures(fullFixtures);

    // 4. Return successfully processed fixtures
    res.status(200).json(fullFixtures);
  } catch (err) {
    console.error("Error in /fixtures route:", err.message);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

export default router;

/*import express from "express";
import { getFixturesHandler } from "../controllers/fixturesController.js";

const router = express.Router();

router.get("/", getFixturesHandler);

export default router;
*/