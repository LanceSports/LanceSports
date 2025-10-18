
import express from "express";
import { fetchStandings, fetchOdds } from "../services/apiService.js";
import { saveStandings, saveOdds } from "../services/dbService.js";

const router = express.Router();

const LEAGUES = {
  EPL: 39,
  UCL: 2,
  WC: 1,
  AFCON: 6,
};

const CURRENT_YEAR = new Date().getFullYear();

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


router.get("/standings", async (req, res) => {
  try {
    const allStandings = [];

    for (const leagueId of Object.values(LEAGUES)) {
      const data = await fetchStandings(leagueId, CURRENT_YEAR);
      await saveStandings(data);
      allStandings.push(...data);
    }

    res.status(200).json(allStandings);
  } catch (err) {
    console.error("Error fetching standings:", err);
    res.status(500).json({ error: "Failed to fetch league standings" });
  }
});


 //Specific league
router.get("/standings/:leagueId", async (req, res) => {
  const { leagueId } = req.params;
  try {
    const data = await fetchStandings(leagueId, CURRENT_YEAR);
    await saveStandings(data);
    res.status(200).json(convertBigInts(data));
  } catch (err) {
    console.error("Error fetching standings for league", leagueId, err);
    res.status(500).json({ error: "Failed to fetch league standings" });
  }
});

//Fetch and group odds by fixture/bookmaker
router.get("/odds", async (req, res) => {
  try {
    const allOdds = [];

    for (const leagueId of Object.values(LEAGUES)) {
      const data = await fetchOdds(leagueId, CURRENT_YEAR);

      const groupedByFixture = {};

      for (const entry of data) {
        const fixtureId = entry.fixture.id;
        const fixtureDate = entry.fixture.date;

        // Extract home and away team names
        const homeTeam = entry.teams?.home?.name || "Home Team";
        const awayTeam = entry.teams?.away?.name || "Away Team";

        if (!groupedByFixture[fixtureId]) {
          groupedByFixture[fixtureId] = {
            fixture_id: fixtureId,
            fixture_date: fixtureDate,
            league_id: entry.league.id,
            season: entry.league.season,
            home_team: homeTeam,
            away_team: awayTeam,
            bookmakers: {
              Betway: {},
              "10Bet": {},
            },
            updated_at: new Date().toISOString(),
          };
        }

        for (const bookmaker of entry.bookmakers || []) {
          if (["Betway", "10Bet"].includes(bookmaker.name)) {
            // Flatten bets into market_name → values mapping
            bookmaker.bets.forEach((b) => {
              groupedByFixture[fixtureId].bookmakers[bookmaker.name][b.name] =
                b.values;
            });
          }
        }
      }

      const groupedArray = Object.values(groupedByFixture);

      // Save to DB
      await saveOdds(groupedArray);

      allOdds.push(...groupedArray);
    }

    res.status(200).json(allOdds);
  } catch (err) {
    console.error("Error fetching odds:", err);
    res.status(500).json({ error: "Failed to fetch betting odds" });
  }
});



// Specific league
router.get("/odds/:leagueId", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const data = await fetchOdds(leagueId, CURRENT_YEAR);

    // Group by fixture
    const groupedByFixture = {};

    for (const entry of data) {
      const fixtureId = entry.fixture.id;
      const fixtureDate = entry.fixture.date;
      const homeTeam = entry.teams.home.name;
      const awayTeam = entry.teams.away.name;

      // Initialize fixture if not in map
      if (!groupedByFixture[fixtureId]) {
        groupedByFixture[fixtureId] = {
          fixture_id: fixtureId,
          fixture_date: fixtureDate,
          league_id: entry.league.id,
          season: entry.league.season,
          home_team: homeTeam,
          away_team: awayTeam,
          bookmakers: {
            Betway: [],
            "10Bet": [],
          },
          updated_at: new Date().toISOString(),
        };
      }

      // Iterate through bookmakers for this fixture
      for (const bookmaker of entry.bookmakers || []) {
        if (["Betway", "10Bet"].includes(bookmaker.name)) {
          groupedByFixture[fixtureId].bookmakers[bookmaker.name].push({
            // No need to store market_name separately, just store bets
            bets: bookmaker.bets.map((b) => ({
              market: b.name,
              values: b.values,
            })),
          });
        }
      }
    }

    const groupedArray = Object.values(groupedByFixture);

    // Save to DB
    await saveOdds(groupedArray);

    // Return the grouped array to frontend
    res.status(200).json(convertBigInts(groupedArray));
  } catch (err) {
    console.error("Error fetching odds:", err);
    res.status(500).json({ error: "Failed to fetch betting odds" });
  }
});


export default router;