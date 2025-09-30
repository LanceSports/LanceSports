
import express from "express";
import { getFixturesByDate, saveFixtures } from "../services/dbService.js";
import { fetchFixturesByDate } from "../services/apiService.js";


const router = express.Router();

// GET fixtures by date
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Missing required 'date' parameter" });
    }

    // 1. Check DB first
    let fixtures = await getFixturesByDate(date);

    if (!fixtures || fixtures.length === 0) {
      // 2. If empty, fetch from external API
      const apiFixtures = await fetchFixturesByDate(date);

      // 3. Save to DB (this also saves events, stats, players, etc.)
      await saveFixtures(apiFixtures);

      // 4. Query again to return consistent format from DB
      fixtures = await getFixturesByDate(date);
    }

    res.json(fixtures);
  } catch (err) {
    console.error("Error in GET /fixtures:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;



/*import express from "express";
import { getFixturesHandler } from "../controllers/fixturesController.js";

const router = express.Router();

router.get("/", getFixturesHandler);

export default router;
*/