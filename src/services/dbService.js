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

export async function saveFixtures(apiFixtures) {
  for (const apiFixture of apiFixtures) {
    const transformed = transformFixture(apiFixture);

    // 🔹 Upsert logic for leagues, venues, fixtures, teams...
    // (same as you already have)

    // Upsert fixture_events
    const events = transformed.fixture_events || [];
    if (events.length) {
      let { error: eventsError } = await supabase
        .from("fixture_events")
        .upsert(events, { onConflict: "event_id" });
      if (eventsError) throw eventsError;
    }

    // Upsert fixture_stats
    const stats = transformed.fixture_stats || [];
    if (stats.length) {
      let { error: statsError } = await supabase
        .from("fixture_stats")
        .upsert(stats, { onConflict: ["fixture_id","team_id","type"] });
      if (statsError) throw statsError;
    }

    // 🔹 Handle players + stats with our local helper
    const { players, playerStats } = transformFixturePlayers(apiFixture);

    if (players.length) {
      let { error: playersError } = await supabase
        .from("fixture_players")
        .upsert(players, { onConflict: ["fixture_id","team_id","player_id"] });
      if (playersError) throw playersError;
    }

    if (playerStats.length) {
      let { error: playerStatsError } = await supabase
        .from("fixture_player_stats")
        .upsert(playerStats, { onConflict: ["fixture_id","team_id","player_id","type"] });
      if (playerStatsError) throw playerStatsError;
    }
  }
}
