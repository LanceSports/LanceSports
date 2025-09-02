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


    // insert leagues
    let { error: leaguesError } = await supabase
      .from("leagues")
      .upsert(transformed.leagues, { onConflict: "league_id" });
    if (leaguesError) throw leaguesError;


    // insert venues
    let { error: venuesError } = await supabase
      .from("venues")
      .upsert(transformed.venues, { onConflict: "venue_id" });
    if (venuesError) throw venuesError;
    
    // insert fixtures
    let { error: fixturesError } = await supabase
      .from("fixtures")
      .upsert(transformed.fixtures, { onConflict: "fixture_id" });
    if (fixturesError) throw fixturesError;

    

    // insert teams (home + away)
    let { error: teamsError } = await supabase
      .from("teams")
      .upsert(transformed.teams, { onConflict: "team_id" });
    if (teamsError) throw teamsError;

    // insert fixture_teams (relations)
    let { error: fixtureTeamsError } = await supabase
      .from("fixture_teams")
      .upsert(transformed.fixture_teams, { onConflict: "fixture_id,team_id" });
    if (fixtureTeamsError) throw fixtureTeamsError;

    // insert fixture_goals
    let { error: goalsError } = await supabase
      .from("fixture_goals")
      .upsert(transformed.fixture_goals, { onConflict: "fixture_id" });
    if (goalsError) throw goalsError;

    // insert fixture_scores
    let { error: scoresError } = await supabase
      .from("fixture_scores")
      .upsert(transformed.fixture_scores, { onConflict: "fixture_id" });
    if (scoresError) throw scoresError;

    // insert fixture_periods
    let { error: periodsError } = await supabase
      .from("fixture_periods")
      .upsert(transformed.fixture_periods, { onConflict: "fixture_id" });
    if (periodsError) throw periodsError;
  }
}
