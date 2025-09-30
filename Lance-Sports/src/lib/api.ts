import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get the current user's JWT token from Supabase
const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.error('No active session:', error);
      return null;
    }
    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Generic function to make authenticated API calls
const authenticatedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available. Please sign in again.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  return response.json();
};

// API functions for different endpoints
export const api = {
  // Health check (no auth required)
  health: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // Get user profile (requires auth)
  getUserProfile: () => authenticatedRequest('/user/profile'),

  // Get user's matches (requires auth)
  getUserMatches: () => authenticatedRequest('/user/matches'),

  // Get public sports data (optional auth)
  getPublicSports: async () => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/public/sports`, { headers });
    return response.json();
  },

  // Create a new match (requires auth)
  createMatch: (matchData: {
    homeTeam: string;
    awayTeam: string;
    sport: string;
    date?: string;
  }) => authenticatedRequest('/matches', {
    method: 'POST',
    body: JSON.stringify(matchData),
  }),

  // Test authentication
  testAuth: () => authenticatedRequest('/user/profile'),
};

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch {
    return false;
  }
};

// Utility function to get current user info
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
};
