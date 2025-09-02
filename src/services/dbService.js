// src/services/dbService.js
import supabase from "../config/supabase.js";

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

// Save/update fixtures (upsert)
export async function saveFixtures(fixtures) {
  const { error } = await supabase
    .from("fixtures")
    .upsert(fixtures, { onConflict: "fixture_id" });

  if (error) throw error;
}
