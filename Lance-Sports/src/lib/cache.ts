// Simple localStorage JSON cache with TTL
// Clears cache on page refresh to ensure fresh data

type CachedEntry<T> = {
  timestamp: number;
  ttlMs: number;
  value: T;
};

// Clear cache on page refresh
const REFRESH_KEY = 'lancesports_page_refresh';
const currentRefreshId = Date.now().toString();
const lastRefreshId = safeGetItem(REFRESH_KEY);

if (lastRefreshId !== currentRefreshId) {
  // Page was refreshed, clear all cache entries
  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        window.localStorage.removeItem(key);
      }
    });
    safeSetItem(REFRESH_KEY, currentRefreshId);
  } catch {
    // ignore errors
  }
}

function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota or privacy errors
  }
}

export function getCachedJSON<T = unknown>(key: string): T | null {
  const raw = safeGetItem(key);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as CachedEntry<T>;
    if (typeof entry.timestamp !== 'number' || typeof entry.ttlMs !== 'number') return null;
    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) return null;
    return entry.value;
  } catch {
    return null;
  }
}

export function setCachedJSON<T = unknown>(key: string, value: T, ttlMs: number): void {
  const entry: CachedEntry<T> = { timestamp: Date.now(), ttlMs, value };
  safeSetItem(key, JSON.stringify(entry));
}

export async function fetchWithCacheJSON<T = unknown>(
  url: string,
  ttlMs: number, // ttlMs is the time to live in milliseconds
  init?: RequestInit
): Promise<{ data: T; fromCache: boolean }> {
  const key = `cache:${url}`;
  const cached = getCachedJSON<T>(key);
  if (cached) {
    return { data: cached, fromCache: true };
  }
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Non-JSON response: ${text.slice(0, 80)}`);
  }
  const data = (await res.json()) as T;
  setCachedJSON(key, data, ttlMs);
  return { data, fromCache: false };
}


