// src/routes/fixturesRoutes.js
import express from "express";
import { fetchFixturesByDate, fetchFixtureDetails } from "../services/apiService.js";
import {
  saveFixtures,
  saveFixtureEvents,
  saveFixtureStats,
  saveFixturePlayers,
  saveFixturePlayerStats,
} from "../services/dbService.js";
import { transformFixture } from "../utils/transform.js";

const router = express.Router();

router.get("/:date", async (req, res) => {
  const { date } = req.params;

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

      // Fetch events, stats, players for this fixture
      let details;
      try {
        details = await fetchFixtureDetails(fixtureId);
      } catch (err) {
        console.error(`Error fetching details for fixture ${fixtureId}:`, err.message);
        continue; // skip this fixture if details fail
      }

      // Merge API fixture with detailed info
      fullFixtures.push({ ...apiFixture, ...details });
    }

    if (!fullFixtures.length) {
      return res.status(200).json([]);
    }

    // 3. Transform + save all data
    for (const apiFixture of fullFixtures) {
      const transformed = transformFixture(apiFixture);

      if (transformed.leagues.length) await saveFixtures({ leagues: transformed.leagues });
      if (transformed.venues.length) await saveFixtures({ venues: transformed.venues });
      if (transformed.teams.length) await saveFixtures({ teams: transformed.teams });
      if (transformed.fixtures.length) await saveFixtures({ fixtures: transformed.fixtures });
      if (transformed.fixture_teams.length) await saveFixtures({ fixture_teams: transformed.fixture_teams });
      if (transformed.fixture_goals.length) await saveFixtures({ fixture_goals: transformed.fixture_goals });
      if (transformed.fixture_scores.length) await saveFixtures({ fixture_scores: transformed.fixture_scores });
      if (transformed.fixture_periods.length) await saveFixtures({ fixture_periods: transformed.fixture_periods });

      if (transformed.fixture_events.length) await saveFixtureEvents(transformed.fixture_events);
      if (transformed.fixture_stats.length) await saveFixtureStats(transformed.fixture_stats);
      if (transformed.fixture_players.length) await saveFixturePlayers(transformed.fixture_players);
      if (transformed.fixture_player_stats.length) await saveFixturePlayerStats(transformed.fixture_player_stats);
    }

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