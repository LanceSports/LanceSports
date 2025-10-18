// src/services/dbService.js
import supabase from "../config/supabase.js"; 
import { transformFixture } from "../utils/transform.js";

// 🔹 Local helper instead of importing
function transformFixturePlayers(apiFixture) {
  const players = [];
  const playerStats = [];

  if (apiFixture.players) {
    for (const team of apiFixture.players) {
      for (const player of team.players) {
        // Basic player info
        players.push({
          fixture_id: apiFixture.fixture.id,
          team_id: team.team.id,
          player_id: player.player.id,
          name: player.player.name,
          number: player.player.number,
          position: player.player.pos,
          grid: player.player.grid
        });

        // Player statistics
        if (player.statistics?.[0]) {
          for (const [type, value] of Object.entries(player.statistics[0])) {
            playerStats.push({
              fixture_id: apiFixture.fixture.id,
              team_id: team.team.id,
              player_id: player.player.id,
              type,
              value
            });
          }
        }
      }
    }
  }

  return { players, playerStats };
}

export async function getFixturesByDate(date) {
  const { data, error } = await supabase
    .from("fixtures")
    .select(`
      fixture_id,
      match_date,
      referee,
      timezone,
      status_long,
      status_short,
      elapsed,
      extra,
      leagues (
        league_id,
        name,
        country,
        logo_url,
        flag_url,
        season,
        round
      ),
      venues (
        venue_id,
        name,
        city
      ),
      fixture_goals (
        home_goals,
        away_goals
      ),
      fixture_scores (
        halftime_home, halftime_away,
        fulltime_home, fulltime_away,
        extratime_home, extratime_away,
        penalty_home, penalty_away
      ),
      fixture_periods (
        first_half_start,
        second_half_start
      ),
      fixture_teams (
        team_id,
        side,
        winner,
        teams (
          team_id,
          name,
          logo_url
        )
      )
    `)
    .gte("match_date", `${date}T00:00:00Z`)
    .lt("match_date", `${date}T23:59:59Z`);

  if (error) throw error;
  return data;
}

// Helper: Convert BigInt → String (safe for Supabase JSON serialization)
function sanitizeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}


//Sequential DB Operations per fixture
export async function saveFixtures(apiFixtures) {
  for (const apiFixture of apiFixtures) {
    const transformed = transformFixture(apiFixture);

    // 🔹 Sanitize all transformed data
    const leagues = sanitizeBigInt(transformed.leagues || []);
    const venues = sanitizeBigInt(transformed.venues || []);
    const fixtures = sanitizeBigInt(transformed.fixtures || []);
    const teams = sanitizeBigInt(transformed.teams || []);
    const fixtureTeams = sanitizeBigInt(transformed.fixture_teams || []);
    const fixtureGoals = sanitizeBigInt(transformed.fixture_goals || []);
    const fixtureScores = sanitizeBigInt(transformed.fixture_scores || []);
    const fixturePeriods = sanitizeBigInt(transformed.fixture_periods || []);
    const events = sanitizeBigInt(transformed.fixture_events || []);
    const stats = sanitizeBigInt(transformed.fixture_stats || []);

    const { players, playerStats } = transformFixturePlayers(apiFixture);
    const sanitizedPlayers = sanitizeBigInt(players || []);
    const sanitizedPlayerStats = sanitizeBigInt(playerStats || []);

    // 🔹 Upserts
    if (leagues.length) {
      let { error } = await supabase
        .from("leagues")
        .upsert(leagues, { onConflict: "league_id" });
      if (error) throw error;
    }

    if (venues.length) {
      let { error } = await supabase
        .from("venues")
        .upsert(venues, { onConflict: "venue_id" });
      if (error) throw error;
    }

    if (fixtures.length) {
      let { error } = await supabase
        .from("fixtures")
        .upsert(fixtures, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    if (teams.length) {
      let { error } = await supabase
        .from("teams")
        .upsert(teams, { onConflict: "team_id" });
      if (error) throw error;
    }

    if (fixtureTeams.length) {
      let { error } = await supabase
        .from("fixture_teams")
        .upsert(fixtureTeams, { onConflict: ["fixture_id","team_id"] });
      if (error) throw error;
    }

    if (fixtureGoals.length) {
      let { error } = await supabase
        .from("fixture_goals")
        .upsert(fixtureGoals, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    if (fixtureScores.length) {
      let { error } = await supabase
        .from("fixture_scores")
        .upsert(fixtureScores, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    if (fixturePeriods.length) {
      let { error } = await supabase
        .from("fixture_periods")
        .upsert(fixturePeriods, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    if (events.length) {
      let { error } = await supabase
        .from("fixture_events")
        .upsert(events, { onConflict: "event_id" });
      if (error) throw error;
    }

    if (stats.length) {
      let { error } = await supabase
        .from("fixture_stats")
        .upsert(stats, { onConflict: ["fixture_id","team_id","type"] });
      if (error) throw error;
    }

    if (sanitizedPlayers.length) {
      let { error } = await supabase
        .from("fixture_players")
        .upsert(sanitizedPlayers, { onConflict: ["fixture_id","team_id","player_id"] });
      if (error) throw error;
    }

    if (sanitizedPlayerStats.length) {
      let { error } = await supabase
        .from("fixture_player_stats")
        .upsert(sanitizedPlayerStats, { onConflict: ["fixture_id","team_id","player_id","type"] });
      if (error) throw error;
    }
  }
}


// Batch DB Operations for multiple fixtures
export async function saveFixturesBatch(apiFixtures = []) {
  // Collect all entities in arrays
  const leagues = [];
  const venues = [];
  const fixtures = [];
  const teams = [];
  const fixtureTeams = [];
  const fixtureGoals = [];
  const fixtureScores = [];
  const fixturePeriods = [];
  const fixtureEvents = [];
  const fixtureStats = [];
  const fixturePlayers = [];
  const fixturePlayerStats = [];

  for (const apiFixture of apiFixtures) {
    const t = transformFixture(apiFixture);

    // transformFixture should return arrays (consistent shapes)
    if (t.leagues) leagues.push(...(Array.isArray(t.leagues) ? t.leagues : [t.leagues]));
    if (t.venues) venues.push(...(Array.isArray(t.venues) ? t.venues : [t.venues]));
    if (t.fixtures) fixtures.push(...(Array.isArray(t.fixtures) ? t.fixtures : [t.fixtures]));
    if (t.teams) teams.push(...(Array.isArray(t.teams) ? t.teams : [t.teams]));
    if (t.fixture_teams) fixtureTeams.push(...t.fixture_teams);
    if (t.fixture_goals) fixtureGoals.push(...(Array.isArray(t.fixture_goals) ? t.fixture_goals : [t.fixture_goals]));
    if (t.fixture_scores) fixtureScores.push(...(Array.isArray(t.fixture_scores) ? t.fixture_scores : [t.fixture_scores]));
    if (t.fixture_periods) fixturePeriods.push(...(Array.isArray(t.fixture_periods) ? t.fixture_periods : [t.fixture_periods]));
    if (t.fixture_events) fixtureEvents.push(...t.fixture_events);
    if (t.fixture_stats) fixtureStats.push(...t.fixture_stats);

    // players/stats might be returned by separate helper
    const { players = [], playerStats = [] } = (t.fixture_players_payload || {});
    if (players.length) fixturePlayers.push(...players);
    if (playerStats.length) fixturePlayerStats.push(...playerStats);
  }

  // sanitize BigInt -> string
  const sLeagues = sanitizeBigInt(leagues);
  const sVenues = sanitizeBigInt(venues);
  const sFixtures = sanitizeBigInt(fixtures);
  const sTeams = sanitizeBigInt(teams);
  const sFixtureTeams = sanitizeBigInt(fixtureTeams);
  const sFixtureGoals = sanitizeBigInt(fixtureGoals);
  const sFixtureScores = sanitizeBigInt(fixtureScores);
  const sFixturePeriods = sanitizeBigInt(fixturePeriods);
  const sFixtureEvents = sanitizeBigInt(fixtureEvents);
  const sFixtureStats = sanitizeBigInt(fixtureStats);
  const sFixturePlayers = sanitizeBigInt(fixturePlayers);
  const sFixturePlayerStats = sanitizeBigInt(fixturePlayerStats);

  // Do fewer DB calls: one per table
  if (sLeagues.length) {
    const { error } = await supabase.from("leagues").upsert(sLeagues, { onConflict: "league_id" });
    if (error) throw error;
  }
  if (sVenues.length) {
    const { error } = await supabase.from("venues").upsert(sVenues, { onConflict: "venue_id" });
    if (error) throw error;
  }
  if (sFixtures.length) {
    const { error } = await supabase.from("fixtures").upsert(sFixtures, { onConflict: "fixture_id" });
    if (error) throw error;
  }
  if (sTeams.length) {
    const { error } = await supabase.from("teams").upsert(sTeams, { onConflict: "team_id" });
    if (error) throw error;
  }
  if (sFixtureTeams.length) {
    const { error } = await supabase.from("fixture_teams").upsert(sFixtureTeams, { onConflict: ["fixture_id", "team_id"] });
    if (error) throw error;
  }
  if (sFixtureGoals.length) {
    const { error } = await supabase.from("fixture_goals").upsert(sFixtureGoals, { onConflict: "fixture_id" });
    if (error) throw error;
  }
  if (sFixtureScores.length) {
    const { error } = await supabase.from("fixture_scores").upsert(sFixtureScores, { onConflict: "fixture_id" });
    if (error) throw error;
  }
  if (sFixturePeriods.length) {
    const { error } = await supabase.from("fixture_periods").upsert(sFixturePeriods, { onConflict: "fixture_id" });
    if (error) throw error;
  }
  if (sFixtureEvents.length) {
    const { error } = await supabase.from("fixture_events").upsert(sFixtureEvents, { onConflict: "event_id" });
    if (error) throw error;
  }
  if (sFixtureStats.length) {
    const { error } = await supabase.from("fixture_stats").upsert(sFixtureStats, { onConflict: ["fixture_id", "team_id", "type"] });
    if (error) throw error;
  }
  if (sFixturePlayers.length) {
    const { error } = await supabase.from("fixture_players").upsert(sFixturePlayers, { onConflict: ["fixture_id", "team_id", "player_id"] });
    if (error) throw error;
  }
  if (sFixturePlayerStats.length) {
    const { error } = await supabase.from("fixture_player_stats").upsert(sFixturePlayerStats, { onConflict: ["fixture_id", "team_id", "player_id", "type"] });
    if (error) throw error;
  }
}

export async function saveStandings(standings) {
  const { error } = await supabase
    .from("league_standings")
    .upsert(standings, { onConflict: ["league_id", "season", "team_id"] });
  if (error) throw error;
}

export async function saveOdds(odds) {
  // odds is an array of objects with fixture_id, league_id, season, fixture_date, home_team, away_team, bookmakers, updated_at
  const { error } = await supabase
    .from("odds")
    .upsert(
      odds.map((o) => ({
        fixture_id: o.fixture_id,
        league_id: o.league_id,
        season: o.season,
        fixture_date: o.fixture_date,
        home_team: o.home_team,
        away_team: o.away_team,
        bookmakers: o.bookmakers, // stored as JSONB
        updated_at: o.updated_at,
      })),
      { onConflict: ["fixture_id"] } // we only care about fixture uniqueness
    );

  if (error) throw error;
}



