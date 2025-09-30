// src/services/dbService.js
import supabase from "../config/supabase.js"; 
import { transformFixture } from "../utils/transform.js";


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
      ),

      fixture_events (
        event_id,
        team_id,
        player_id,
        type,
        detail,
        comments,
        elapsed,
        extra
      ),

      fixture_stats (
        team_id,
        type,
        value
      ),

      fixture_players (
        team_id,
        player_id,
        name,
        number,
        position,
        grid,

        fixture_player_stats (
          type,
          value
        )
      )
    `)
    .gte("match_date", `${date}T00:00:00Z`)
    .lt("match_date", `${date}T23:59:59Z`);

  if (error) throw error;
  return data;
}


// Save/update fixtures (upsert)
export async function saveFixtures(apiFixtures) {
  for (const apiFixture of apiFixtures) {
    const transformed = transformFixture(apiFixture);

    // === Core entities ===
    if (transformed.leagues.length) {
      const { error } = await supabase
        .from("leagues")
        .upsert(transformed.leagues, { onConflict: "league_id" });
      if (error) throw error;
    }

    if (transformed.venues.length) {
      const { error } = await supabase
        .from("venues")
        .upsert(transformed.venues, { onConflict: "venue_id" });
      if (error) throw error;
    }

    if (transformed.teams.length) {
      const { error } = await supabase
        .from("teams")
        .upsert(transformed.teams, { onConflict: "team_id" });
      if (error) throw error;
    }

    if (transformed.fixtures.length) {
      const { error } = await supabase
        .from("fixtures")
        .upsert(transformed.fixtures, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    // === Relations ===
    if (transformed.fixture_teams.length) {
      const { error } = await supabase
        .from("fixture_teams")
        .upsert(transformed.fixture_teams, { onConflict: ["fixture_id", "team_id"] });
      if (error) throw error;
    }

    if (transformed.fixture_goals.length) {
      const { error } = await supabase
        .from("fixture_goals")
        .upsert(transformed.fixture_goals, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    if (transformed.fixture_scores.length) {
      const { error } = await supabase
        .from("fixture_scores")
        .upsert(transformed.fixture_scores, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    if (transformed.fixture_periods.length) {
      const { error } = await supabase
        .from("fixture_periods")
        .upsert(transformed.fixture_periods, { onConflict: "fixture_id" });
      if (error) throw error;
    }

    // === Events, stats, players ===
    if (transformed.fixture_events.length) {
      const { error } = await supabase
        .from("fixture_events")
        .upsert(transformed.fixture_events, { onConflict: "event_id" });
      if (error) throw error;
    }

    if (transformed.fixture_stats.length) {
      const { error } = await supabase
        .from("fixture_stats")
        .upsert(transformed.fixture_stats, { onConflict: ["fixture_id", "team_id", "type"] });
      if (error) throw error;
    }

    if (transformed.fixture_players.length) {
      const { error } = await supabase
        .from("fixture_players")
        .upsert(transformed.fixture_players, { onConflict: ["fixture_id", "team_id", "player_id"] });
      if (error) throw error;
    }

    if (transformed.fixture_player_stats.length) {
      const { error } = await supabase
        .from("fixture_player_stats")
        .upsert(transformed.fixture_player_stats, { onConflict: ["fixture_id", "team_id", "player_id", "type"] });
      if (error) throw error;
    }
  }
}
