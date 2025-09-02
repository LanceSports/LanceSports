// src/routes/fixturesRoutes.js
import express from "express";
import { fetchFixturesByDate } from "../services/apiService.js";
import { saveFixtures } from "../services/dbService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { date } = req.query;
  try {
    const fixtures = await fetchFixturesByDate(date);  
    await saveFixtures(fixtures);
    res.json({ fixtures });
  } catch (err) {
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