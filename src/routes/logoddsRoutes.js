import { convertBigInts } from "../fixturesRoutes.js";
import express from "express";
import { fetchStandings, fetchOdds, fetchFixturesByLeague } from "../services/apiService.js";
import { saveStandings, saveOdds } from "../services/dbService.js";


const router = express.Router();

const LEAGUES = {
  EPL: 39,
  UCL: 2,
  WC: 1,
  AFCON: 6,
};

const CURRENT_YEAR = new Date().getFullYear();


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
      // 1️⃣ Fetch odds
      const oddsData = await fetchOdds(leagueId, CURRENT_YEAR);

      // 2️⃣ Fetch fixtures to get team names
      const fixtures = await fetchFixturesByLeague(leagueId, CURRENT_YEAR);
      const fixtureMap = Object.fromEntries(
        fixtures.map(f => [f.fixture.id, { home: f.teams.home.name, away: f.teams.away.name }])
      );

      // 3️⃣ Group by fixture
      const groupedByFixture = {};
      for (const entry of oddsData) {
        const fixtureId = entry.fixture.id;
        const fixtureDate = entry.fixture.date;
        const teams = fixtureMap[fixtureId] || { home: "Home Team", away: "Away Team" };

        if (!groupedByFixture[fixtureId]) {
          groupedByFixture[fixtureId] = {
            fixture_id: fixtureId,
            fixture_date: fixtureDate,
            league_id: entry.league.id,
            season: entry.league.season,
            home_team: teams.home,
            away_team: teams.away,
            bookmakers: { Betway: {}, "10Bet": {} },
            updated_at: new Date().toISOString(),
          };
        }

        for (const bookmaker of entry.bookmakers || []) {
          if (["Betway", "10Bet"].includes(bookmaker.name)) {
            bookmaker.bets.forEach(b => {
              groupedByFixture[fixtureId].bookmakers[bookmaker.name][b.name] = b.values;
            });
          }
        }
      }

      const groupedArray = Object.values(groupedByFixture);

      // 4️⃣ Save to DB
      await saveOdds(groupedArray);

      allOdds.push(...groupedArray);
    }

    res.status(200).json(allOdds);
  } catch (err) {
    console.error("Error fetching odds:", err);
    res.status(500).json({ error: "Failed to fetch betting odds" });
  }
});

// ✅ /odds/:leagueId (specific league)
router.get("/odds/:leagueId", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;

    // 1️⃣ Fetch odds
    const oddsData = await fetchOdds(leagueId, CURRENT_YEAR);

    // 2️⃣ Fetch fixtures to get team names
    const fixtures = await fetchFixturesByLeague(leagueId, CURRENT_YEAR);
    const fixtureMap = Object.fromEntries(
      fixtures.map(f => [f.fixture.id, { home: f.teams.home.name, away: f.teams.away.name }])
    );

    // 3️⃣ Group by fixture
    const groupedByFixture = {};
    for (const entry of oddsData) {
      const fixtureId = entry.fixture.id;
      const fixtureDate = entry.fixture.date;
      const teams = fixtureMap[fixtureId] || { home: "Home Team", away: "Away Team" };

      if (!groupedByFixture[fixtureId]) {
        groupedByFixture[fixtureId] = {
          fixture_id: fixtureId,
          fixture_date: fixtureDate,
          league_id: entry.league.id,
          season: entry.league.season,
          home_team: teams.home,
          away_team: teams.away,
          bookmakers: { Betway: [], "10Bet": [] },
          updated_at: new Date().toISOString(),
        };
      }

      for (const bookmaker of entry.bookmakers || []) {
        if (["Betway", "10Bet"].includes(bookmaker.name)) {
          groupedByFixture[fixtureId].bookmakers[bookmaker.name].push({
            bets: bookmaker.bets.map(b => ({ market: b.name, values: b.values })),
          });
        }
      }
    }

    const groupedArray = Object.values(groupedByFixture);

    // 4️⃣ Save to DB
    await saveOdds(groupedArray);

    res.status(200).json(convertBigInts(groupedArray));
  } catch (err) {
    console.error("Error fetching odds:", err);
    res.status(500).json({ error: "Failed to fetch betting odds" });
  }
});
export default router;