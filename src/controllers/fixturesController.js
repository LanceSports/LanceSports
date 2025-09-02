// src/controllers/fixturesController.js
import { getFixturesByDate } from "../services/dbService.js";

export async function getFixturesHandler(req, res) {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date query param required" });

  try {
    const fixtures = await getFixturesByDate(date);
    res.json(fixtures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
