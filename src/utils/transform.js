// src/utils/transform.js

// Transform fixture events
function transformFixtureEvents(apiFixture) {
  const fixtureId = apiFixture.fixture.id;
  if (!apiFixture.events) return [];

  return apiFixture.events.map((event, idx) => ({
    event_id: BigInt(fixtureId) * 1000n + BigInt(idx),
    fixture_id: fixtureId,
    team_id: event.team?.id || null,
    player_id: event.player?.id || null,
    type: event.type,
    detail: event.detail || null,
    comments: event.comments || null,
    elapsed: event.time?.elapsed || null,
    extra: event.time?.extra || null,
  }));
}

// Transform fixture stats
function transformFixtureStats(apiFixture) {
  const fixtureId = apiFixture.fixture.id;
  if (!apiFixture.statistics) return [];

  return apiFixture.statistics.flatMap((teamStats) =>
    teamStats.statistics.map((stat) => ({
      fixture_id: fixtureId,
      team_id: teamStats.team.id,
      type: stat.type,
      value: stat.value !== null ? stat.value.toString() : null,
    }))
  );
}

// Transform fixture players + stats
function transformFixturePlayers(apiFixture) {
  const fixtureId = apiFixture.fixture.id;
  if (!apiFixture.players) return { players: [], playerStats: [] };

  const players = [];
  const playerStats = [];

  apiFixture.players.forEach((teamBlock) => {
    const teamId = teamBlock.team.id;

    teamBlock.players.forEach((playerWrapper) => {
      const p = playerWrapper.player;

      players.push({
        fixture_id: fixtureId,
        team_id: teamId,
        player_id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        grid: p.grid,
      });

      if (playerWrapper.statistics) {
        playerWrapper.statistics.forEach((statObj) => {
          for (const [key, value] of Object.entries(statObj)) {
            playerStats.push({
              fixture_id: fixtureId,
              team_id: teamId,
              player_id: p.id,
              type: key,
              value: value !== null ? value.toString() : null,
            });
          }
        });
      }
    });
  });

  return { players, playerStats };
}

// ✅ Main transform (batch-ready)
export function transformFixture(apiFixture) {
  const fixtureId = apiFixture.fixture.id;

  const fixtures = [{
    fixture_id: fixtureId,
    match_date: apiFixture.fixture.date,
    referee: apiFixture.fixture.referee,
    timezone: apiFixture.fixture.timezone,
    status_long: apiFixture.fixture.status?.long,
    status_short: apiFixture.fixture.status?.short,
    elapsed: apiFixture.fixture.elapsed,
    extra: apiFixture.fixture.extra,
  }];

  const leagues = apiFixture.league ? [{
    league_id: apiFixture.league.id,
    name: apiFixture.league.name,
    country: apiFixture.league.country,
    logo_url: apiFixture.league.logo,
    flag_url: apiFixture.league.flag,
    season: apiFixture.league.season,
    round: apiFixture.league.round,
  }] : [];

  const venues = apiFixture.venue ? [{
    venue_id: apiFixture.venue.id,
    name: apiFixture.venue.name,
    city: apiFixture.venue.city,
  }] : [];

  const teams = apiFixture.teams ? [
    { team_id: apiFixture.teams.home.id, name: apiFixture.teams.home.name, logo_url: apiFixture.teams.home.logo },
    { team_id: apiFixture.teams.away.id, name: apiFixture.teams.away.name, logo_url: apiFixture.teams.away.logo }
  ] : [];

  const fixture_teams = apiFixture.teams ? [
    { fixture_id: fixtureId, team_id: apiFixture.teams.home.id, side: "home", winner: apiFixture.teams.home.winner },
    { fixture_id: fixtureId, team_id: apiFixture.teams.away.id, side: "away", winner: apiFixture.teams.away.winner },
  ] : [];

  const fixture_goals = apiFixture.goals ? [{
    fixture_id: fixtureId,
    home_goals: apiFixture.goals.home,
    away_goals: apiFixture.goals.away,
  }] : [];

  const fixture_scores = apiFixture.scores ? [{
    fixture_id: fixtureId,
    halftime_home: apiFixture.scores.halftime?.home,
    halftime_away: apiFixture.scores.halftime?.away,
    fulltime_home: apiFixture.scores.fulltime?.home,
    fulltime_away: apiFixture.scores.fulltime?.away,
    extratime_home: apiFixture.scores.extratime?.home,
    extratime_away: apiFixture.scores.extratime?.away,
    penalty_home: apiFixture.scores.penalty?.home,
    penalty_away: apiFixture.scores.penalty?.away,
  }] : [];

  const fixture_periods = apiFixture.periods ? [{
    fixture_id: fixtureId,
    first_half_start: apiFixture.periods.first?.start,
    second_half_start: apiFixture.periods.second?.start,
  }] : [];

  const fixture_events = transformFixtureEvents(apiFixture);
  const fixture_stats = transformFixtureStats(apiFixture);
  const { players: fixture_players, playerStats: fixture_player_stats } = transformFixturePlayers(apiFixture);

  // ✅ Flattened structure ready for batch save
  return {
    leagues,
    venues,
    fixtures,
    teams,
    fixture_teams,
    fixture_goals,
    fixture_scores,
    fixture_periods,
    fixture_events,
    fixture_stats,
    fixture_players,
    fixture_player_stats,
  };
}


/*// Transform fixture events
export function transformFixtureEvents(apiFixture) {
  const fixtureId = apiFixture.fixture.id;
  if (!apiFixture.events) return [];

  return apiFixture.events.map((event, idx) => ({
    // Use a numeric ID by combining fixtureId and index safely
    event_id: BigInt(fixtureId) * 1000n + BigInt(idx), 
    fixture_id: fixtureId,
    team_id: event.team?.id || null,
    player_id: event.player?.id || null,
    type: event.type,
    detail: event.detail || null,
    comments: event.comments || null,
    elapsed: event.time?.elapsed || null,
    extra: event.time?.extra || null,
  }));
}

// Transform fixture stats
function transformFixtureStats(apiFixture) {
  const fixtureId = apiFixture.fixture.id;
  if (!apiFixture.statistics) return [];

  return apiFixture.statistics.flatMap((teamStats) =>
    teamStats.statistics.map((stat) => ({
      fixture_id: fixtureId,
      team_id: teamStats.team.id,
      type: stat.type,
      value: stat.value !== null ? stat.value.toString() : null,
    }))
  );
}

// Transform fixture players + stats
function transformFixturePlayers(apiFixture) {
  const fixtureId = apiFixture.fixture.id;
  if (!apiFixture.players) return { players: [], playerStats: [] };

  const players = [];
  const playerStats = [];

  apiFixture.players.forEach((teamBlock) => {
    const teamId = teamBlock.team.id;

    teamBlock.players.forEach((playerWrapper) => {
      const p = playerWrapper.player;

      players.push({
        fixture_id: fixtureId,
        team_id: teamId,
        player_id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        grid: p.grid,
      });

      if (playerWrapper.statistics) {
        playerWrapper.statistics.forEach((statObj) => {
          for (const [key, value] of Object.entries(statObj)) {
            playerStats.push({
              fixture_id: fixtureId,
              team_id: teamId,
              player_id: p.id,
              type: key,
              value: value !== null ? value.toString() : null,
            });
          }
        });
      }
    });
  });

  return { players, playerStats };
}

// Main transform
export function transformFixture(apiFixture) {
  const fixtureId = apiFixture.fixture.id;

  const fixtures = [{
    fixture_id: fixtureId,
    match_date: apiFixture.fixture.date,
    referee: apiFixture.fixture.referee,
    timezone: apiFixture.fixture.timezone,
    status_long: apiFixture.fixture.status?.long,
    status_short: apiFixture.fixture.status?.short,
    elapsed: apiFixture.fixture.elapsed,
    extra: apiFixture.fixture.extra,
  }];

  const leagues = apiFixture.league ? [{
    league_id: apiFixture.league.id,
    name: apiFixture.league.name,
    country: apiFixture.league.country,
    logo_url: apiFixture.league.logo,
    flag_url: apiFixture.league.flag,
    season: apiFixture.league.season,
    round: apiFixture.league.round,
  }] : [];

  const venues = apiFixture.venue ? [{
    venue_id: apiFixture.venue.id,
    name: apiFixture.venue.name,
    city: apiFixture.venue.city,
  }] : [];

  const teams = apiFixture.teams ? [
    { team_id: apiFixture.teams.home.id, name: apiFixture.teams.home.name, logo_url: apiFixture.teams.home.logo },
    { team_id: apiFixture.teams.away.id, name: apiFixture.teams.away.name, logo_url: apiFixture.teams.away.logo }
  ] : [];

  const fixture_teams = apiFixture.teams ? [
    { fixture_id: fixtureId, team_id: apiFixture.teams.home.id, side: "home", winner: apiFixture.teams.home.winner },
    { fixture_id: fixtureId, team_id: apiFixture.teams.away.id, side: "away", winner: apiFixture.teams.away.winner },
  ] : [];

  const fixture_goals = apiFixture.goals ? [{
    fixture_id: fixtureId,
    home_goals: apiFixture.goals.home,
    away_goals: apiFixture.goals.away,
  }] : [];

  const fixture_scores = apiFixture.scores ? [{
    fixture_id: fixtureId,
    halftime_home: apiFixture.scores.halftime?.home,
    halftime_away: apiFixture.scores.halftime?.away,
    fulltime_home: apiFixture.scores.fulltime?.home,
    fulltime_away: apiFixture.scores.fulltime?.away,
    extratime_home: apiFixture.scores.extratime?.home,
    extratime_away: apiFixture.scores.extratime?.away,
    penalty_home: apiFixture.scores.penalty?.home,
    penalty_away: apiFixture.scores.penalty?.away,
  }] : [];

  const fixture_periods = apiFixture.periods ? [{
    fixture_id: fixtureId,
    first_half_start: apiFixture.periods.first?.start,
    second_half_start: apiFixture.periods.second?.start,
  }] : [];

  // Events, stats, players, and player stats
  const fixture_events = transformFixtureEvents(apiFixture);
  const fixture_stats = transformFixtureStats(apiFixture);
  const { players: fixture_players, playerStats: fixture_player_stats } = transformFixturePlayers(apiFixture);

  return {
    fixtures,
    leagues,
    venues,
    teams,
    fixture_teams,
    fixture_goals,
    fixture_scores,
    fixture_periods,
    fixture_events,
    fixture_stats,
    fixture_players,
    fixture_player_stats
  };
}
*/