import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession } from '../hooks/useSession';

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((k: string) => (k in store ? store[k] : null)),
  setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
  removeItem: vi.fn((k: string) => { delete store[k]; }),
};

describe('useSession', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.restoreAllMocks();
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(mockLocalStorage as any);
  });

  it('starts signed out by default', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userData).toBeNull();
  });

  it('signs in and persists user data', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.signIn({ id: '1', name: 'Test User', email: 't@example.com' });
    });
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.userData?.name).toBe('Test User');
    expect(store['lancesports_user']).toBeTruthy();
    expect(store['lancesports_signed_in']).toBe('true');
  });

  it('signs out and clears storage', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.signIn({ id: '1', name: 'Test User', email: 't@example.com' });
    });
    act(() => {
      result.current.signOut();
    });
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userData).toBeNull();
    expect(store['lancesports_user']).toBeUndefined();
  });

  it('refreshSession extends expiry', () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      result.current.signIn({ id: '1', name: 'Test User', email: 't@example.com' });
    });
    const before = result.current.userData?.expiresAt;
    act(() => {
      result.current.refreshSession();
    });
    const after = result.current.userData?.expiresAt;
    expect(before && after && after > before).toBe(true);
  });
});



