// src/routes/fixturesRoutes.js
import express from "express";
import { fetchFixturesByDate, fetchFixtureDetails } from "../services/apiService.js";
import { transformFixture } from "../utils/transform.js";
import { saveFixtures } from "../services/dbService.js";

const router = express.Router();

// GET /fixtures?date=YYYY-MM-DD
router.get("/", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing date query parameter" });
  }

  try {
    // 1️⃣ Fetch fixtures for the date
    const fixtures = await fetchFixturesByDate(date);

    // 2️⃣ Loop through each fixture to fetch detailed info
    const detailedFixtures = [];
    for (const fixture of fixtures) {
      try {
        const fixtureId = fixture.fixture.id;
        // fetch events, stats, players, player stats
        const details = await fetchFixtureDetails(fixtureId);

        // Merge base fixture data with detailed data
        const fullFixture = { ...fixture, ...details };
        detailedFixtures.push(fullFixture);
      } catch (innerErr) {
        console.error(`Error fetching details for fixture ${fixture.fixture.id}:`, innerErr.message);
      }
    }

    // 3️⃣ Transform all detailed fixtures for DB insertion
    const transformedFixtures = detailedFixtures.map(transformFixture);

    // 4️⃣ Save each fixture (and all nested tables) to DB
    for (const tf of transformedFixtures) {
      await saveFixtures([tf]);
    }

    // 5️⃣ Return transformed fixtures to the user
    res.json(transformedFixtures);
  } catch (err) {
    console.error("Error fetching fixtures:", err.message);
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