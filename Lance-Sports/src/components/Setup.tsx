import React from 'react';
import { MatchSetupForm } from './MatchSetupForm';
import { useMatchStore } from '../hooks/useMatchStore';

export function Setup() {
  const { state, createMatch } = useMatchStore();

  const handleCreateMatch = (matchData: any) => {
    createMatch(matchData);
    // Redirect to live view after creation
    window.location.hash = '#live';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Setup</h1>
        <p className="text-muted-foreground">
          Create and configure new matches for live broadcasting
        </p>
      </div>

      <MatchSetupForm
        teams={state.teams}
        onCreate={handleCreateMatch}
      />
    </div>
  );
}