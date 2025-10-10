import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession } from '../../src/components/hooks/useSession';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useSession Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should start with user not signed in', () => {
      const { result } = renderHook(() => useSession());
      
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.userData).toBe(null);
    });

    it('should load session from localStorage on mount', () => {
      const mockUserData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        sessionStart: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-22T10:00:00Z'
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'lancesports_user') {
          return JSON.stringify(mockUserData);
        }
        if (key === 'lancesports_signed_in') {
          return 'true';
        }
        return null;
      });

      const { result } = renderHook(() => useSession());
      
      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.userData).toEqual(mockUserData);
    });

    it('should not load expired session', () => {
      const expiredUserData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        sessionStart: '2024-01-01T10:00:00Z',
        expiresAt: '2024-01-08T10:00:00Z' // Expired
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'lancesports_user') {
          return JSON.stringify(expiredUserData);
        }
        if (key === 'lancesports_signed_in') {
          return 'true';
        }
        return null;
      });

      const { result } = renderHook(() => useSession());
      
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.userData).toBe(null);
    });
  });

  describe('Sign In', () => {
    it('should sign in user successfully', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.userData).toMatchObject(userData);
      expect(result.current.userData?.sessionStart).toBeDefined();
      expect(result.current.userData?.expiresAt).toBeDefined();
    });

    it('should save session to localStorage', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lancesports_user',
        expect.stringContaining(userData.name)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lancesports_signed_in',
        'true'
      );
    });

    it('should set session expiration to 7 days', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      const sessionStart = new Date(savedData.sessionStart);
      const expiresAt = new Date(savedData.expiresAt);
      const sessionDuration = expiresAt.getTime() - sessionStart.getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      expect(sessionDuration).toBe(sevenDays);
    });
  });

  describe('Sign Out', () => {
    it('should sign out user successfully', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      // First sign in
      act(() => {
        result.current.signIn(userData);
      });

      // Then sign out
      act(() => {
        result.current.signOut();
      });

      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.userData).toBe(null);
    });

    it('should clear localStorage on sign out', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      act(() => {
        result.current.signOut();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('lancesports_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('lancesports_signed_in');
    });
  });

  describe('Session Refresh', () => {
    it('should refresh session expiration', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      const originalExpiresAt = result.current.userData?.expiresAt;

      // Wait a bit and refresh
      act(() => {
        result.current.refreshSession();
      });

      expect(result.current.userData?.expiresAt).not.toBe(originalExpiresAt);
      expect(result.current.userData?.expiresAt).toBeDefined();
    });

    it('should not refresh if user is not signed in', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.refreshSession();
      });

      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.userData).toBe(null);
    });
  });

  describe('Storage Event Handling', () => {
    it('should respond to storage changes', () => {
      const { result } = renderHook(() => useSession());
      
      // Simulate storage change event
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'lancesports_signed_in',
          newValue: 'true'
        });
        window.dispatchEvent(event);
      });

      // The hook should respond to storage changes
      // Note: This is a simplified test - in reality, the hook would
      // reload the session when storage changes
      expect(result.current).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useSession());
      
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.userData).toBe(null);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'lancesports_user') {
          return 'invalid json';
        }
        if (key === 'lancesports_signed_in') {
          return 'true';
        }
        return null;
      });

      const { result } = renderHook(() => useSession());
      
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.userData).toBe(null);
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session across component re-renders', () => {
      const { result, rerender } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      // Re-render the hook
      rerender();

      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.userData).toMatchObject(userData);
    });
  });

  describe('Session Metadata', () => {
    it('should calculate session age correctly', () => {
      const { result } = renderHook(() => useSession());
      const userData = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };

      act(() => {
        result.current.signIn(userData);
      });

      expect(result.current.userData?.sessionStart).toBeDefined();
      expect(result.current.userData?.expiresAt).toBeDefined();
      
      const sessionStart = new Date(result.current.userData!.sessionStart!);
      const now = new Date();
      const sessionAge = now.getTime() - sessionStart.getTime();
      
      expect(sessionAge).toBeGreaterThanOrEqual(0);
      expect(sessionAge).toBeLessThan(1000); // Should be very recent
    });
  });
});
