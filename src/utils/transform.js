// src/utils/transform.js
export function transformFixture(apiFixture) {
  const fixtureId = apiFixture.fixture.id;

  return {
    fixtures: {
      fixture_id: fixtureId,
      league_id: apiFixture.league.id,
      venue_id: apiFixture.fixture.venue.id,
      match_date: apiFixture.fixture.date,
      timestamp: apiFixture.fixture.timestamp,
      referee: apiFixture.fixture.referee,
      timezone: apiFixture.fixture.timezone,
      status_long: apiFixture.fixture.status.long,
      status_short: apiFixture.fixture.status.short,
      elapsed: apiFixture.fixture.status.elapsed,
      extra: apiFixture.fixture.status.extra,
    },
    leagues: {
      league_id: apiFixture.league.id,
      name: apiFixture.league.name,
      country: apiFixture.league.country,
      logo_url: apiFixture.league.logo,
      flag_url: apiFixture.league.flag,
      season: apiFixture.league.season,
      round: apiFixture.league.round,
      standings: apiFixture.league.standings,
    },
    venues: {
      venue_id: apiFixture.fixture.venue.id,
      name: apiFixture.fixture.venue.name,
      city: apiFixture.fixture.venue.city,
    },
    teams: [
      {
        team_id: apiFixture.teams.home.id,
        name: apiFixture.teams.home.name,
        logo_url: apiFixture.teams.home.logo,
      },
      {
        team_id: apiFixture.teams.away.id,
        name: apiFixture.teams.away.name,
        logo_url: apiFixture.teams.away.logo,
      },
    ],
    fixture_teams: [
      {
        fixture_id: fixtureId,
        team_id: apiFixture.teams.home.id,
        side: "home",
        winner: apiFixture.teams.home.winner,
      },
      {
        fixture_id: fixtureId,
        team_id: apiFixture.teams.away.id,
        side: "away",
        winner: apiFixture.teams.away.winner,
      },
    ],
    fixture_goals: {
      fixture_id: fixtureId,
      home_goals: apiFixture.goals.home,
      away_goals: apiFixture.goals.away,
    },
    fixture_scores: {
      fixture_id: fixtureId,
      halftime_home: apiFixture.score.halftime.home,
      halftime_away: apiFixture.score.halftime.away,
      fulltime_home: apiFixture.score.fulltime.home,
      fulltime_away: apiFixture.score.fulltime.away,
      extratime_home: apiFixture.score.extratime.home,
      extratime_away: apiFixture.score.extratime.away,
      penalty_home: apiFixture.score.penalty.home,
      penalty_away: apiFixture.score.penalty.away,
    },
    fixture_periods: {
      fixture_id: fixtureId,
      first_half_start: apiFixture.fixture.periods.first,
      second_half_start: apiFixture.fixture.periods.second,
    },
  };
}
