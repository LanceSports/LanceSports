import { useState, useEffect, useCallback } from 'react';

interface UserData {
  id: string;
  name: string;
  username?: string;
  displayName?: string;
  email: string;
  avatar_url?: string;
  picture?: string;
  google_id?: string;
  sessionStart?: string;
  expiresAt?: string;
}

interface SessionHook {
  isSignedIn: boolean;
  userData: UserData | null;
  signIn: (userData: UserData) => Promise<void>;
  signOut: () => void;
  refreshSession: () => void;
}

const SESSION_KEY = 'lancesports_user';
const SIGNED_IN_KEY = 'lancesports_signed_in';
const SESSION_DURATION = 0.5* 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function useSession(): SessionHook {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Listen for storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_KEY || e.key === SIGNED_IN_KEY) {
        loadSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadSession = useCallback(() => {
    try {
      const savedUserData = localStorage.getItem(SESSION_KEY);
      const savedSignedIn = localStorage.getItem(SIGNED_IN_KEY);

      if (savedUserData && savedSignedIn === 'true') {
        const userData: UserData = JSON.parse(savedUserData);

        // Check if session has expired
        if (userData.expiresAt && new Date(userData.expiresAt) < new Date()) {
          console.log('❌ Session expired, clearing...');
          signOut();
          return;
        }

        // Session is valid
        setIsSignedIn(true);
        setUserData(userData);
        console.log('✅ Session restored:', userData.name);
        
        // Log session info
        if (userData.sessionStart) {
          const sessionAge = Math.round((Date.now() - new Date(userData.sessionStart).getTime()) / (1000 * 60 * 60));
          console.log(`📅 Session age: ${sessionAge} hours`);
        }
      } else {
        // No valid session
        setIsSignedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('❌ Error loading session:', error);
      signOut();
    }
  }, []);

  const signIn = useCallback(async (userData: UserData): Promise<void> => {
    try {
      // Add session metadata
      const sessionData: UserData = {
        ...userData,
        sessionStart: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
      };

      // Save to localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(SIGNED_IN_KEY, 'true');

      // Update state
      setIsSignedIn(true);
      setUserData(sessionData);

      console.log('✅ User signed in:', sessionData.name);
      console.log('✅ Session saved to localStorage');
      
      // Return a resolved promise to indicate completion
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Error saving session:', error);
      return Promise.reject(error);
    }
  }, []);

  const signOut = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SIGNED_IN_KEY);

    // Update state
    setIsSignedIn(false);
    setUserData(null);

    console.log('✅ User signed out');
    console.log('✅ Session cleared from localStorage');
  }, []);

  const refreshSession = useCallback(() => {
    if (userData) {
      // Extend session duration
      const updatedUserData: UserData = {
        ...userData,
        expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      console.log('✅ Session refreshed');
    }
  }, [userData]);

  return {
    isSignedIn,
    userData,
    signIn,
    signOut,
    refreshSession
  };
}