import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Edit3, Goal, AlertTriangle, Users, Flag, Clock, Play, Pause, RotateCcw, Target } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MatchEvent, EventType, Team } from '../types/match';

interface EventTimelineProps {
  events: MatchEvent[];
  teams: Team[];
  filters?: EventType[];
  onSelectEvent?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}

const eventIcons: Record<EventType, React.ComponentType<{ className?: string }>> = {
  GOAL: Goal,
  ASSIST: Target,
  FOUL: AlertTriangle,
  CARD_YELLOW: AlertTriangle,
  CARD_RED: AlertTriangle,
  SUBSTITUTION: Users,
  OFFSIDE: Flag,
  KICKOFF: Play,
  PAUSE: Pause,
  RESUME: Play,
  HALF_TIME: Clock,
  FULL_TIME: Clock,
  VAR: RotateCcw,
  PENALTY_SCORED: Goal,
  PENALTY_MISSED: Target
};

const eventColors: Record<EventType, string> = {
  GOAL: 'text-green-500',
  ASSIST: 'text-blue-500',
  FOUL: 'text-yellow-500',
  CARD_YELLOW: 'text-yellow-500',
  CARD_RED: 'text-red-500',
  SUBSTITUTION: 'text-purple-500',
  OFFSIDE: 'text-orange-500',
  KICKOFF: 'text-green-500',
  PAUSE: 'text-gray-500',
  RESUME: 'text-green-500',
  HALF_TIME: 'text-blue-500',
  FULL_TIME: 'text-blue-500',
  VAR: 'text-indigo-500',
  PENALTY_SCORED: 'text-green-500',
  PENALTY_MISSED: 'text-red-500'
};

const getEventTypeLabel = (type: EventType): string => {
  const labels: Record<EventType, string> = {
    GOAL: 'Goal',
    ASSIST: 'Assist',
    FOUL: 'Foul',
    CARD_YELLOW: 'Yellow Card',
    CARD_RED: 'Red Card',
    SUBSTITUTION: 'Substitution',
    OFFSIDE: 'Offside',
    KICKOFF: 'Kickoff',
    PAUSE: 'Pause',
    RESUME: 'Resume',
    HALF_TIME: 'Half Time',
    FULL_TIME: 'Full Time',
    VAR: 'VAR Review',
    PENALTY_SCORED: 'Penalty Goal',
    PENALTY_MISSED: 'Penalty Miss'
  };
  return labels[type] || type;
};

export function EventTimeline({
  events,
  teams,
  filters = [],
  onSelectEvent,
  onEditEvent,
  onDeleteEvent
}: EventTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<EventType[]>([]);

  const filterOptions: EventType[] = ['GOAL', 'CARD_YELLOW', 'CARD_RED', 'SUBSTITUTION', 'VAR', 'PENALTY_SCORED'];

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = event.description?.toLowerCase().includes(query);
        const matchesType = getEventTypeLabel(event.type).toLowerCase().includes(query);
        const team = teams.find(t => t.id === event.teamId);
        const matchesTeam = team?.name.toLowerCase().includes(query);
        
        if (!matchesDescription && !matchesType && !matchesTeam) {
          return false;
        }
      }

      // Type filter
      if (activeFilters.length > 0 && !activeFilters.includes(event.type)) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, activeFilters, teams]);

  const toggleFilter = (filter: EventType) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const EventItem = ({ event }: { event: MatchEvent }) => {
    const team = teams.find(t => t.id === event.teamId);
    const Icon = eventIcons[event.type];
    const iconColor = eventColors[event.type];

    return (
      <div className="slide-in-timeline flex items-start space-x-4 p-4 hover:bg-accent/50 rounded-lg transition-colors group">
        {/* Time */}
        <div className="w-16 text-sm font-mono text-muted-foreground shrink-0">
          {event.clock}
        </div>

        {/* Icon */}
        <div className={`mt-1 ${iconColor} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium">{getEventTypeLabel(event.type)}</span>
                {team && (
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: team.primaryColor }}
                  >
                    {team.shortName || team.name}
                  </Badge>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
              {(event.scoreHome !== undefined && event.scoreAway !== undefined) && (
                <div className="text-xs text-muted-foreground mt-1">
                  Score: {event.scoreHome} - {event.scoreAway}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              {onEditEvent && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditEvent(event.id)}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              {onDeleteEvent && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteEvent(event.id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Match Events</h3>
          <Badge variant="outline">
            {filteredEvents.length} events
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeFilters.length === 0 ? 'default' : 'outline'}
            onClick={() => setActiveFilters([])}
            className="h-7"
          >
            All
          </Button>
          {filterOptions.map(filter => (
            <Button
              key={filter}
              size="sm"
              variant={activeFilters.includes(filter) ? 'default' : 'outline'}
              onClick={() => toggleFilter(filter)}
              className="h-7"
            >
              {getEventTypeLabel(filter)}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No events yet</h4>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery || activeFilters.length > 0 
                  ? 'No events match your current filters. Try adjusting your search or filters.'
                  : 'Match events will appear here as they happen during the game.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEvents.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}