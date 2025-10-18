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



