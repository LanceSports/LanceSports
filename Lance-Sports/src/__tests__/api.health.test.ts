import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';

describe('api.health', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (import.meta as any).env = { VITE_API_URL: 'http://localhost:3001/api' };
  });

  it('returns health JSON on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'OK' }) });
    const res = await api.health();
    expect(res.status).toBe('OK');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/health');
  });

  it('handles non-JSON gracefully (still attempts .json())', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const res = await api.health();
    expect(res).toEqual({});
  });
});



