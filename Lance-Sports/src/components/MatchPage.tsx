import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react';

interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: { first: number | null; second: number | null };
    venue: { id: number | null; name: string | null; city: string | null };
    status: { long: string; short: string; elapsed: number | null; extra: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export function MatchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.state?.match as Fixture | undefined;

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Match Not Found</h2>
              <p className="text-muted-foreground">
                No match data available. Please go back and select a match.
              </p>
              <Button onClick={() => navigate('/football-leagues')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Matches
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { fixture, league, teams, goals, score } = match;
  const matchDate = new Date(fixture.date);
  const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'P']);
  const finishedStatuses = new Set(['FT', 'AET', 'PEN']);
  const isLive = liveStatuses.has(fixture.status.short);
  const isFinished = finishedStatuses.has(fixture.status.short);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FT': return 'bg-green-100 text-green-800';
      case 'NS': return 'bg-blue-100 text-blue-800';
      case '1H': case '2H': case 'HT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/football-leagues')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{teams.home.name} vs {teams.away.name}</h1>
              <p className="text-muted-foreground mt-1">{league.name}</p>
            </div>
            <Badge className={`px-3 py-1 ${getStatusColor(fixture.status.short)}`}>
              {fixture.status.long}
            </Badge>
          </div>
        </div>

        {/* Main Match Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-center">Match Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8">
                {/* Home Team */}
                <div className="text-center">
                  <img 
                    src={teams.home.logo} 
                    alt={teams.home.name}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <h3 className="font-semibold text-lg">{teams.home.name}</h3>
                  <div className="text-4xl font-bold text-primary mt-2">
                    {goals.home ?? '-'}
                  </div>
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  {isLive && (
                    <div className="text-sm text-red-600 font-medium mt-1">
                      LIVE
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="text-center">
                  <img 
                    src={teams.away.logo} 
                    alt={teams.away.name}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <h3 className="font-semibold text-lg">{teams.away.name}</h3>
                  <div className="text-4xl font-bold text-primary mt-2">
                    {goals.away ?? '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Details */}
          <Card>
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {matchDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {matchDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {fixture.venue.name && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{fixture.venue.name}</span>
                </div>
              )}

              {fixture.venue.city && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{fixture.venue.city}</span>
                </div>
              )}

              {fixture.referee && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Referee</p>
                  <p className="text-sm font-medium">{fixture.referee}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Score Breakdown */}
        {(score.halftime.home !== null || score.fulltime.home !== null) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {score.halftime.home !== null && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Half Time</p>
                    <p className="font-semibold">{score.halftime.home} - {score.halftime.away}</p>
                  </div>
                )}
                {score.fulltime.home !== null && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Full Time</p>
                    <p className="font-semibold">{score.fulltime.home} - {score.fulltime.away}</p>
                  </div>
                )}
                {score.extratime.home !== null && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Extra Time</p>
                    <p className="font-semibold">{score.extratime.home} - {score.extratime.away}</p>
                  </div>
                )}
                {score.penalty.home !== null && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Penalties</p>
                    <p className="font-semibold">{score.penalty.home} - {score.penalty.away}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* League Info */}
        <Card>
          <CardHeader>
            <CardTitle>League Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img 
                src={league.logo} 
                alt={league.name}
                className="w-12 h-12"
              />
              <div>
                <h3 className="font-semibold">{league.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {league.country} • Season {league.season} • {league.round}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
