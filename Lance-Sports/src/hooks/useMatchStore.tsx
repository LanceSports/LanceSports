import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Match, MatchEvent, Team, Player, MatchStatus, EventType } from '../types/match.ts';

interface MatchState {
  teams: Team[];
  matches: Match[];
  events: MatchEvent[];
  players: Player[];
  selectedMatchId?: string;
}

type MatchAction =
  | { type: 'SELECT_MATCH'; matchId: string }
  | { type: 'CREATE_MATCH'; match: Omit<Match, 'id'> }
  | { type: 'UPDATE_MATCH'; matchId: string; updates: Partial<Match> }
  | { type: 'ADD_EVENT'; event: Omit<MatchEvent, 'id' | 'createdAt'> }
  | { type: 'UPDATE_CLOCK'; matchId: string; clock: string }
  | { type: 'SET_STATUS'; matchId: string; status: MatchStatus }
  | { type: 'ADJUST_SCORE'; matchId: string; homeDelta: number; awayDelta: number }
  | { type: 'SET_POSSESSION'; matchId: string; teamId?: string }
  | { type: 'DELETE_EVENT'; eventId: string };

const initialState: MatchState = {
  teams: [
    {
      id: 't1',
      name: 'Lance City',
      shortName: 'LCT',
      primaryColor: '#22C55E',
      logoUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=64&h=64&fit=crop&crop=center'
    },
    {
      id: 't2',
      name: 'Green United',
      shortName: 'GRU',
      primaryColor: '#16A34A',
      logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=64&h=64&fit=crop&crop=center'
    }
  ],
  matches: [
    {
      id: 'm1',
      league: 'Demo League',
      venue: 'Lance Arena',
      scheduledStart: '2025-08-20T18:00:00+02:00',
      status: 'LIVE',
      clock: '32:45',
      homeTeamId: 't1',
      awayTeamId: 't2',
      possessionTeamId: 't1',
      scoreHome: 1,
      scoreAway: 0
    }
  ],
  events: [
    {
      id: 'e1',
      matchId: 'm1',
      createdAt: '2025-08-20T17:35:00+02:00',
      clock: '12:33',
      teamId: 't1',
      type: 'GOAL',
      description: '#9 finishes from close range',
      scoreHome: 1,
      scoreAway: 0
    },
    {
      id: 'e2',
      matchId: 'm1',
      createdAt: '2025-08-20T17:48:00+02:00',
      clock: '25:12',
      teamId: 't2',
      type: 'CARD_YELLOW',
      description: 'Late challenge on #8'
    }
  ],
  players: [
    { id: 'p1', teamId: 't1', name: 'John Striker', number: 9, position: 'Forward' },
    { id: 'p2', teamId: 't1', name: 'Mike Defender', number: 4, position: 'Defence' },
    { id: 'p3', teamId: 't2', name: 'Alex Midfielder', number: 8, position: 'Midfield' },
    { id: 'p4', teamId: 't2', name: 'Sam Keeper', number: 1, position: 'Goalkeeper' }
  ],
  selectedMatchId: 'm1'
};

function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case 'SELECT_MATCH':
      return { ...state, selectedMatchId: action.matchId };

    case 'CREATE_MATCH':
      const newMatch: Match = {
        ...action.match,
        id: `m${Date.now()}`
      };
      return {
        ...state,
        matches: [...state.matches, newMatch],
        selectedMatchId: newMatch.id
      };

    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.matchId ? { ...match, ...action.updates } : match
        )
      };

    case 'ADD_EVENT':
      const newEvent: MatchEvent = {
        ...action.event,
        id: `e${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        events: [newEvent, ...state.events]
      };

    case 'UPDATE_CLOCK':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.matchId ? { ...match, clock: action.clock } : match
        )
      };

    case 'SET_STATUS':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.matchId ? { ...match, status: action.status } : match
        )
      };

    case 'ADJUST_SCORE':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.matchId
            ? {
                ...match,
                scoreHome: Math.max(0, match.scoreHome + action.homeDelta),
                scoreAway: Math.max(0, match.scoreAway + action.awayDelta)
              }
            : match
        )
      };

    case 'SET_POSSESSION':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.matchId ? { ...match, possessionTeamId: action.teamId } : match
        )
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.eventId)
      };

    default:
      return state;
  }
}

interface MatchContextType {
  state: MatchState;
  selectMatch: (matchId: string) => void;
  createMatch: (match: Omit<Match, 'id'>) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  addEvent: (event: Omit<MatchEvent, 'id' | 'createdAt'>) => void;
  updateClock: (matchId: string, clock: string) => void;
  setStatus: (matchId: string, status: MatchStatus) => void;
  adjustScore: (matchId: string, homeDelta: number, awayDelta: number) => void;
  setPossession: (matchId: string, teamId?: string) => void;
  deleteEvent: (eventId: string) => void;
  selectedMatch?: Match;
  homeTeam?: Team;
  awayTeam?: Team;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(matchReducer, initialState);

  const selectMatch = useCallback((matchId: string) => {
    dispatch({ type: 'SELECT_MATCH', matchId });
  }, []);

  const createMatch = useCallback((match: Omit<Match, 'id'>) => {
    dispatch({ type: 'CREATE_MATCH', match });
  }, []);

  const updateMatch = useCallback((matchId: string, updates: Partial<Match>) => {
    dispatch({ type: 'UPDATE_MATCH', matchId, updates });
  }, []);

  const addEvent = useCallback((event: Omit<MatchEvent, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_EVENT', event });
  }, []);

  const updateClock = useCallback((matchId: string, clock: string) => {
    dispatch({ type: 'UPDATE_CLOCK', matchId, clock });
  }, []);

  const setStatus = useCallback((matchId: string, status: MatchStatus) => {
    dispatch({ type: 'SET_STATUS', matchId, status });
  }, []);

  const adjustScore = useCallback((matchId: string, homeDelta: number, awayDelta: number) => {
    dispatch({ type: 'ADJUST_SCORE', matchId, homeDelta, awayDelta });
  }, []);

  const setPossession = useCallback((matchId: string, teamId?: string) => {
    dispatch({ type: 'SET_POSSESSION', matchId, teamId });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', eventId });
  }, []);

  const selectedMatch = state.selectedMatchId
    ? state.matches.find(m => m.id === state.selectedMatchId)
    : undefined;

  const homeTeam = selectedMatch
    ? state.teams.find(t => t.id === selectedMatch.homeTeamId)
    : undefined;

  const awayTeam = selectedMatch
    ? state.teams.find(t => t.id === selectedMatch.awayTeamId)
    : undefined;

  return (
    <MatchContext.Provider
      value={{
        state,
        selectMatch,
        createMatch,
        updateMatch,
        addEvent,
        updateClock,
        setStatus,
        adjustScore,
        setPossession,
        deleteEvent,
        selectedMatch,
        homeTeam,
        awayTeam
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatchStore() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatchStore must be used within a MatchProvider');
  }
  return context;
}