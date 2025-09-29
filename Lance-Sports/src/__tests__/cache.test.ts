import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { getCachedJSON, setCachedJSON, fetchWithCacheJSON } from '../lib/cache';

// Create a fresh in-memory localStorage mock per test
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
  setItem: vi.fn((key: string, val: string) => {
    store[key] = val;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
};

describe('cache.ts JSON cache', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.restoreAllMocks();
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(mockLocalStorage as any);
  });

  it('stores and retrieves cached JSON respecting key', () => {
    setCachedJSON('cache:test', { hello: 'world' }, 10_000);
    const read = getCachedJSON<{ hello: string }>('cache:test');
    expect(read).toEqual({ hello: 'world' });
  });

  it('returns null when cache missing', () => {
    const read = getCachedJSON('cache:missing');
    expect(read).toBeNull();
  });

  it('evicts expired entries based on ttlMs', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    setCachedJSON('cache:exp', { v: 1 }, 1);
    // advance time beyond ttl
    vi.spyOn(Date, 'now').mockReturnValue(now + 5);
    const read = getCachedJSON('cache:exp');
    expect(read).toBeNull();
  });

  it('fetchWithCacheJSON performs network then caches', async () => {
    const url = 'https://example.com/data';
    const mock = { ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ a: 1 }) } as any;
    global.fetch = vi.fn().mockResolvedValue(mock);
    const res1 = await fetchWithCacheJSON<typeof mock>(url, 60_000);
    expect(res1.fromCache).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const res2 = await fetchWithCacheJSON<typeof mock>(url, 60_000);
    expect(res2.fromCache).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('fetchWithCacheJSON throws on non-OK response', async () => {
    const url = 'https://example.com/bad';
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({}) } as any);
    await expect(fetchWithCacheJSON(url, 1_000)).rejects.toThrow(/HTTP 500/);
  });

  it('fetchWithCacheJSON throws on non-JSON content-type', async () => {
    const url = 'https://example.com/text';
    global.fetch = vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'text/plain' }), text: async () => 'hi' } as any);
    await expect(fetchWithCacheJSON(url, 1_000)).rejects.toThrow(/Non-JSON/);
  });
});



