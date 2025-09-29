import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMatchClock } from '../hooks/useMatchClock';
import { Match, Team, MatchStatus } from '../types/match.ts';
import { ScorecardMenu } from "./ScoreMenu";

interface ScoreboardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onClockUpdate?: (clock: string) => void;
  onRequestTogglePause?: () => void;
  onRequestEditScore?: () => void;
  onRequestSetPossession?: (teamId?: string) => void;
}

const getStatusBadgeVariant = (status: MatchStatus) => {
  switch (status) {
    case 'LIVE':
      return 'destructive';
    case 'PAUSED':
      return 'warning';
    case 'FT':
    case 'HT':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: MatchStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled';
    case 'LIVE':
      return 'Live';
    case 'PAUSED':
      return 'Paused';
    case 'HT':
      return 'Half Time';
    case 'FT':
      return 'Full Time';
    case 'ET':
      return 'Extra Time';
    case 'PEN':
      return 'Penalties';
    default:
      return status;
  }
};

export function Scoreboard({
  match,
  homeTeam,
  awayTeam,
  onClockUpdate,
  onRequestTogglePause,
  onRequestEditScore,
  onRequestSetPossession
}: ScoreboardProps) {
  const [scoreAnimation, setScoreAnimation] = useState<'home' | 'away' | null>(null);
  const [previousScore, setPreviousScore] = useState({ home: match.scoreHome, away: match.scoreAway });

  const { clock } = useMatchClock({
    initialClock: match.clock,
    status: match.status,
    onClockUpdate
  });

  // Animate score changes
  useEffect(() => {
    if (match.scoreHome !== previousScore.home) {
      setScoreAnimation('home');
      setTimeout(() => setScoreAnimation(null), 300);
    }
    if (match.scoreAway !== previousScore.away) {
      setScoreAnimation('away');
      setTimeout(() => setScoreAnimation(null), 300);
    }
    setPreviousScore({ home: match.scoreHome, away: match.scoreAway });
  }, [match.scoreHome, match.scoreAway, previousScore]);

  const TeamCard = ({ 
    team, 
    score, 
    isHome, 
    hasPossession 
  }: { 
    team: Team; 
    score: number; 
    isHome: boolean; 
    hasPossession: boolean;
  }) => (
    <Card className={`p-6 ${hasPossession ? 'ring-2 ring-primary' : ''} transition-all duration-200`}>
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={team.logoUrl} alt={team.name} />
          <AvatarFallback style={{ backgroundColor: team.primaryColor || '#7C3AED' }}>
            {team.shortName || team.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h3 className="font-semibold text-lg">{team.name}</h3>
          <p className="text-sm text-muted-foreground">{isHome ? 'Home' : 'Away'}</p>
        </div>

        {hasPossession && (
          <div className="w-full h-1 bg-primary rounded-full pulse-live"></div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Match info */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">{match.league}</h2>
        <p className="text-muted-foreground">{match.venue}</p>
      </div>

      {/* Main scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Home team */}
        <TeamCard
          team={homeTeam}
          score={match.scoreHome}
          isHome={true}
          hasPossession={match.possessionTeamId === homeTeam.id}
        />

        {/* Center score and clock */}
        <div className="text-center space-y-4">
          {/* Score */}
          <div className="flex items-center justify-center space-x-8">
            <div 
              className={`text-6xl font-bold ${
                scoreAnimation === 'home' ? 'score-change text-primary' : ''
              }`}
            >
              {match.scoreHome}
            </div>
            <div className="text-2xl text-muted-foreground">-</div>
            <div 
              className={`text-6xl font-bold ${
                scoreAnimation === 'away' ? 'score-change text-primary' : ''
              }`}
            >
              {match.scoreAway}
            </div>
          </div>

          {/* Clock and Status */}
          <div className="space-y-2">
            <div className="text-3xl font-mono font-semibold">
              {clock}
            </div>
            <Badge 
              variant={getStatusBadgeVariant(match.status)}
              className="text-sm px-3 py-1"
            >
              {getStatusLabel(match.status)}
            </Badge>
          </div>

          {/* Quick stats row (optional slot) */}
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold">Shots</div>
              <div>7 - 4</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">On Target</div>
              <div>3 - 1</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Fouls</div>
              <div>2 - 5</div>
            </div>
          </div>
        </div>

        {/* Away team */}
        <TeamCard
          team={awayTeam}
          score={match.scoreAway}
          isHome={false}
          hasPossession={match.possessionTeamId === awayTeam.id}
        />
      </div>

      {/* Possession indicator */}
      {match.possessionTeamId && (
        <div className="mt-6 flex justify-center">
          <div className="bg-muted rounded-full p-2 text-sm">
            Possession: {match.possessionTeamId === homeTeam.id ? homeTeam.name : awayTeam.name}
          </div>
        </div>
      )}
      
       {/* Scorecard menu tabs (Lineups & Timeline) */}
      <div className="mt-10">
        <ScorecardMenu />
      </div>

    </div>
  );
}