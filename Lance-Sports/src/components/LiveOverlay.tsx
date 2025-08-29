import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Scoreboard } from './Scoreboard';
import { EventTimeline } from './EventTimeline';
import { ManualInputPanel } from './ManualInputPanel';
import { useMatchStore } from '../hooks/useMatchStore';

export function LiveOverlay() {
  const {
    state,
    selectedMatch,
    homeTeam,
    awayTeam,
    updateClock,
    setStatus,
    addEvent,
    adjustScore,
    setPossession,
    deleteEvent
  } = useMatchStore();

  const handlePause = () => {
    if (selectedMatch) {
      setStatus(selectedMatch.id, 'PAUSED');
      addEvent({
        matchId: selectedMatch.id,
        clock: selectedMatch.clock,
        type: 'PAUSE',
        description: 'Match paused'
      });
    }
  };

  const handleResume = () => {
    if (selectedMatch) {
      setStatus(selectedMatch.id, 'LIVE');
      addEvent({
        matchId: selectedMatch.id,
        clock: selectedMatch.clock,
        type: 'RESUME',
        description: 'Match resumed'
      });
    }
  };

  const handleAdjustScore = (homeDelta: number, awayDelta: number) => {
    if (selectedMatch) {
      adjustScore(selectedMatch.id, homeDelta, awayDelta);
      
      // Add event for score adjustment
      if (homeDelta !== 0 || awayDelta !== 0) {
        const newHomeScore = Math.max(0, selectedMatch.scoreHome + homeDelta);
        const newAwayScore = Math.max(0, selectedMatch.scoreAway + awayDelta);
        
        addEvent({
          matchId: selectedMatch.id,
          clock: selectedMatch.clock,
          type: 'GOAL', // This would be a manual adjustment event type in a real app
          description: `Score manually adjusted to ${newHomeScore}-${newAwayScore}`,
          scoreHome: newHomeScore,
          scoreAway: newAwayScore
        });
      }
    }
  };

  const handleAddEvent = (eventData: any) => {
    addEvent(eventData);
  };

  const matchEvents = selectedMatch 
    ? state.events.filter(event => event.matchId === selectedMatch.id)
    : [];

  if (!selectedMatch || !homeTeam || !awayTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Active Match</h2>
            <p className="text-muted-foreground mb-6">
              Please select a match from the header dropdown to view the live overlay, 
              or create a new match to get started.
            </p>
            <Button onClick={() => window.location.hash = '#setup'}>
              Create New Match
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Scoreboard - Always visible at top */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border rounded-lg p-4">
        <Scoreboard
          match={selectedMatch}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          onClockUpdate={(clock) => updateClock(selectedMatch.id, clock)}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Timeline - Takes up more space */}
        <div className="lg:col-span-2">
          <EventTimeline
            events={matchEvents}
            teams={[homeTeam, awayTeam]}
            onDeleteEvent={deleteEvent}
          />
        </div>

        {/* Manual Input Panel - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-96">
            <ManualInputPanel
              match={selectedMatch}
              teams={[homeTeam, awayTeam]}
              players={state.players}
              onAddEvent={handleAddEvent}
              onPause={handlePause}
              onResume={handleResume}
              onAdjustScore={handleAdjustScore}
            />
          </div>
        </div>
      </div>

      {/* Mobile-optimized stacked layout */}
      <div className="lg:hidden space-y-6">
        <ManualInputPanel
          match={selectedMatch}
          teams={[homeTeam, awayTeam]}
          players={state.players}
          onAddEvent={handleAddEvent}
          onPause={handlePause}
          onResume={handleResume}
          onAdjustScore={handleAdjustScore}
        />
      </div>
    </div>
  );
}