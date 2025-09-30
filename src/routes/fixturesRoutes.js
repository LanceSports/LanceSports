import express from "express";
import { fetchFixturesByDate } from "../services/apiService.js";
import { 
  saveFixtures,
  saveFixtureEvents,
  saveFixtureStats,
  saveFixturePlayers,
  saveFixturePlayerStats,
  getFixturesByDate
} from "../services/dbService.js";
import { 
  transformFixtureEvents,
  transformFixtureStats,
  transformFixturePlayers
} from "../utils/transform.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { date } = req.query;

  try {
    // 1. Try to fetch from DB first
    let fixtures = await getFixturesByDate(date);

    if (!fixtures || fixtures.length === 0) {
      // 2. If no data in DB, fetch from API
      const apiFixtures = await fetchFixturesByDate(date);

      // 3. Save core fixtures
      await saveFixtures(apiFixtures);

      // 4. Save related entities (events, stats, players)
      for (const apiFixture of apiFixtures) {
        // events
        const events = transformFixtureEvents(apiFixture);
        await saveFixtureEvents(events);

        // stats
        const stats = transformFixtureStats(apiFixture);
        await saveFixtureStats(stats);

        // players + player stats
        const { players, playerStats } = transformFixturePlayers(apiFixture);
        await saveFixturePlayers(players);
        await saveFixturePlayerStats(playerStats);
      }

      // 5. Reload enriched fixtures from DB
      fixtures = await getFixturesByDate(date);
    }

    res.json({ fixtures });
  } catch (err) {
    console.error("Error in /fixtures:", err);
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