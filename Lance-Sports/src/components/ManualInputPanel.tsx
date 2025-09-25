import React, { useState } from 'react';
import { 
  Goal, AlertTriangle, Users, Flag, Play, Pause, 
  RotateCcw, Target, Plus, Minus, Save, X 
} from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Match, Team, EventType, Player } from '../types/match';

interface ManualInputPanelProps {
  match?: Match;
  teams: Team[];
  players: Player[];
  onAddEvent?: (event: {
    matchId: string;
    clock: string;
    teamId?: string;
    type: EventType;
    description?: string;
    playerId?: string;
    assistId?: string;
    playerInId?: string;
    playerOutId?: string;
  }) => void;
  onPause?: () => void;
  onResume?: () => void;
  onAdjustScore?: (homeDelta: number, awayDelta: number) => void;
}

interface EventFormData {
  type: EventType;
  teamId?: string;
  playerId?: string;
  assistId?: string;
  playerInId?: string;
  playerOutId?: string;
  description?: string;
  reason?: string;
}

const eventButtons = [
  { type: 'GOAL' as EventType, label: 'Goal', icon: Goal, color: 'bg-green-100 hover:bg-green-200 text-green-800', shortcut: 'G' },
  { type: 'CARD_YELLOW' as EventType, label: 'Yellow Card', icon: AlertTriangle, color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800', shortcut: 'Y' },
  { type: 'CARD_RED' as EventType, label: 'Red Card', icon: AlertTriangle, color: 'bg-red-100 hover:bg-red-200 text-red-800', shortcut: 'R' },
  { type: 'SUBSTITUTION' as EventType, label: 'Substitution', icon: Users, color: 'bg-purple-100 hover:bg-purple-200 text-purple-800', shortcut: 'S' },
  { type: 'FOUL' as EventType, label: 'Foul', icon: AlertTriangle, color: 'bg-orange-100 hover:bg-orange-200 text-orange-800', shortcut: 'F' },
  { type: 'OFFSIDE' as EventType, label: 'Offside', icon: Flag, color: 'bg-blue-100 hover:bg-blue-200 text-blue-800', shortcut: 'O' },
  { type: 'VAR' as EventType, label: 'VAR', icon: RotateCcw, color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800', shortcut: 'V' },
  { type: 'PENALTY_SCORED' as EventType, label: 'Penalty Goal', icon: Target, color: 'bg-green-100 hover:bg-green-200 text-green-800', shortcut: 'P' },
  { type: 'PENALTY_MISSED' as EventType, label: 'Penalty Miss', icon: Target, color: 'bg-red-100 hover:bg-red-200 text-red-800', shortcut: 'M' }
];

export function ManualInputPanel({
  match,
  teams,
  players,
  onAddEvent,
  onPause,
  onResume,
  onAdjustScore
}: ManualInputPanelProps) {
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    type: 'GOAL'
  });

  const isMatchActive = match && match.status !== 'FT';
  const isLive = match?.status === 'LIVE';
  const isPaused = match?.status === 'PAUSED';

  const homeTeam = match ? teams.find(t => t.id === match.homeTeamId) : undefined;
  const awayTeam = match ? teams.find(t => t.id === match.awayTeamId) : undefined;

  const getTeamPlayers = (teamId: string) => {
    return players.filter(p => p.teamId === teamId);
  };

  const handleQuickEvent = (type: EventType) => {
    setEventFormData({ type });
    setIsEventFormOpen(true);
  };

  const handleSubmitEvent = () => {
    if (!match || !onAddEvent) return;

    // Generate description based on event type
    let description = eventFormData.description || '';
    
    if (eventFormData.type === 'GOAL' && eventFormData.playerId) {
      const player = players.find(p => p.id === eventFormData.playerId);
      description = `#${player?.number || ''} ${player?.name || 'Player'} scores`;
      if (eventFormData.assistId) {
        const assist = players.find(p => p.id === eventFormData.assistId);
        description += ` (assist: #${assist?.number || ''} ${assist?.name || ''})`;
      }
    } else if (eventFormData.type === 'SUBSTITUTION' && eventFormData.playerInId && eventFormData.playerOutId) {
      const playerIn = players.find(p => p.id === eventFormData.playerInId);
      const playerOut = players.find(p => p.id === eventFormData.playerOutId);
      description = `#${playerIn?.number || ''} ${playerIn?.name || ''} replaces #${playerOut?.number || ''} ${playerOut?.name || ''}`;
    } else if ((eventFormData.type === 'CARD_YELLOW' || eventFormData.type === 'CARD_RED') && eventFormData.playerId) {
      const player = players.find(p => p.id === eventFormData.playerId);
      description = `#${player?.number || ''} ${player?.name || 'Player'}`;
      if (eventFormData.reason) {
        description += ` - ${eventFormData.reason}`;
      }
    }

    onAddEvent({
      matchId: match.id,
      clock: match.clock,
      type: eventFormData.type,
      teamId: eventFormData.teamId,
      playerId: eventFormData.playerId,
      assistId: eventFormData.assistId,
      playerInId: eventFormData.playerInId,
      playerOutId: eventFormData.playerOutId,
      description: description || eventFormData.description
    });

    // Reset form
    setEventFormData({ type: 'GOAL' });
    setIsEventFormOpen(false);
  };

  const EventForm = () => (
    <div className="space-y-4">
      {/* Team selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Team</label>
        <Select value={eventFormData.teamId || ''} onValueChange={(value) => setEventFormData(prev => ({ ...prev, teamId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Player selection for relevant events */}
      {(eventFormData.type === 'GOAL' || eventFormData.type === 'CARD_YELLOW' || eventFormData.type === 'CARD_RED' || eventFormData.type === 'PENALTY_SCORED' || eventFormData.type === 'PENALTY_MISSED') && eventFormData.teamId && (
        <div>
          <label className="text-sm font-medium mb-2 block">Player</label>
          <Select value={eventFormData.playerId || ''} onValueChange={(value) => setEventFormData(prev => ({ ...prev, playerId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {getTeamPlayers(eventFormData.teamId).map(player => (
                <SelectItem key={player.id} value={player.id}>
                  #{player.number} {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Assist selection for goals */}
      {eventFormData.type === 'GOAL' && eventFormData.teamId && (
        <div>
          <label className="text-sm font-medium mb-2 block">Assist (optional)</label>
          <Select value={eventFormData.assistId || ''} onValueChange={(value) => setEventFormData(prev => ({ ...prev, assistId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select assist player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No assist</SelectItem>
              {getTeamPlayers(eventFormData.teamId).map(player => (
                <SelectItem key={player.id} value={player.id}>
                  #{player.number} {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Substitution players */}
      {eventFormData.type === 'SUBSTITUTION' && eventFormData.teamId && (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">Player coming in</label>
            <Select value={eventFormData.playerInId || ''} onValueChange={(value) => setEventFormData(prev => ({ ...prev, playerInId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select player coming in" />
              </SelectTrigger>
              <SelectContent>
                {getTeamPlayers(eventFormData.teamId).map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Player going out</label>
            <Select value={eventFormData.playerOutId || ''} onValueChange={(value) => setEventFormData(prev => ({ ...prev, playerOutId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select player going out" />
              </SelectTrigger>
              <SelectContent>
                {getTeamPlayers(eventFormData.teamId).map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    #{player.number} {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Reason for cards */}
      {(eventFormData.type === 'CARD_YELLOW' || eventFormData.type === 'CARD_RED') && (
        <div>
          <label className="text-sm font-medium mb-2 block">Reason</label>
          <Input
            placeholder="e.g., Late challenge, Unsporting behavior"
            value={eventFormData.reason || ''}
            onChange={(e) => setEventFormData(prev => ({ ...prev, reason: e.target.value }))}
          />
        </div>
      )}

      {/* Additional description */}
      <div>
        <label className="text-sm font-medium mb-2 block">Additional notes (optional)</label>
        <Textarea
          placeholder="Add any additional details..."
          value={eventFormData.description || ''}
          onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => setIsEventFormOpen(false)}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSubmitEvent}>
          <Save className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
    </div>
  );

  if (!match) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No match selected. Please select a match from the header.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Match Control</h3>
          <Badge variant={isLive ? 'destructive' : 'secondary'}>
            {match.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Match control buttons */}
        <div className="flex justify-center space-x-2">
          {isPaused ? (
            <Button onClick={onResume} disabled={!isMatchActive} className="bg-green-500 hover:bg-green-600">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button onClick={onPause} disabled={!isLive} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
        </div>

        <Separator />

        {/* Score adjustment */}
        <div>
          <h4 className="font-medium mb-3">Score Adjustment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">{homeTeam?.name}</p>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAdjustScore?.(-1, 0)}
                  disabled={!isMatchActive || match.scoreHome === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-2xl font-bold w-8">{match.scoreHome}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAdjustScore?.(1, 0)}
                  disabled={!isMatchActive}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium">{awayTeam?.name}</p>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAdjustScore?.(0, -1)}
                  disabled={!isMatchActive || match.scoreAway === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-2xl font-bold w-8">{match.scoreAway}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAdjustScore?.(0, 1)}
                  disabled={!isMatchActive}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick event buttons */}
        <div>
          <h4 className="font-medium mb-3">Quick Events</h4>
          <div className="grid grid-cols-3 gap-2">
            {eventButtons.map(button => {
              const IconComponent = button.icon;
              return (
                <Sheet key={button.type} open={isEventFormOpen && eventFormData.type === button.type} onOpenChange={setIsEventFormOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className={`${button.color} border relative`}
                      onClick={() => handleQuickEvent(button.type)}
                      disabled={!isMatchActive}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {button.label}
                      <kbd className="absolute top-1 right-1 text-xs bg-white/20 px-1 rounded">
                        {button.shortcut}
                      </kbd>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Add {button.label}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <EventForm />
                    </div>
                  </SheetContent>
                </Sheet>
              );
            })}
          </div>
        </div>

        {!isMatchActive && (
          <div className="text-center text-sm text-muted-foreground">
            Match control is disabled when the match is finished.
          </div>
        )}
      </CardContent>
    </Card>
  );
}