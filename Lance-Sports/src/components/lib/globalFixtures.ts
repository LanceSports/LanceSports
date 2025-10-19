import { fetchLeagueFixtures, LeagueFixturesResponse } from './footyApi';

// Very small global cache for league fixtures.
// Usage:
// import { initLeagueFixtures, getLeagueFixtures, onFixturesReady } from './lib/globalFixtures'
// call initLeagueFixtures() once on app entry, and components can call getLeagueFixtures() to read cached data.

let fixturesPromise: Promise<LeagueFixturesResponse> | null = null;
let fixturesData: LeagueFixturesResponse | null = null;
const listeners: Array<(data: LeagueFixturesResponse | null, err?: Error) => void> = [];

export function initLeagueFixtures() {
  if (fixturesPromise) return fixturesPromise;

  fixturesPromise = fetchLeagueFixtures()
    .then((data) => {
      fixturesData = data;
      listeners.forEach((l) => l(fixturesData));
      return data;
    })
    .catch((err) => {
      listeners.forEach((l) => l(null, err instanceof Error ? err : new Error(String(err))));
      fixturesData = null;
      // rethrow so callers can still catch
      throw err;
    });

  return fixturesPromise;
}

export function getLeagueFixtures(): LeagueFixturesResponse | null {
  return fixturesData;
}

export function onFixturesReady(fn: (data: LeagueFixturesResponse | null, err?: Error) => void) {
  listeners.push(fn);
  // return unsubscribe
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export async function ensureLeagueFixtures(): Promise<LeagueFixturesResponse> {
  if (fixturesData) return fixturesData;
  if (fixturesPromise) return fixturesPromise;
  return initLeagueFixtures() as Promise<LeagueFixturesResponse>;
}

export default {
  initLeagueFixtures,
  getLeagueFixtures,
  onFixturesReady,
  ensureLeagueFixtures,
};
