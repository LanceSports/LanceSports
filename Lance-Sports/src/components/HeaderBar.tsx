import React, { useState, useEffect } from 'react';
import { Moon, Sun, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useMatchStore } from '../hooks/useMatchStore';

export function HeaderBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { state, selectMatch, selectedMatch } = useMatchStore();

  // Update system time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', {
      hour12: false,
      timeZone: 'Africa/Johannesburg'
    });
  };

  const isLive = selectedMatch?.status === 'LIVE';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-primary to-primary-700 text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-xl font-bold">LanceSports</h1>
          </div>
          
          {/* Live indicator */}
          {isLive && (
            <Badge 
              variant="destructive" 
              className="pulse-live bg-red-500 hover:bg-red-500"
            >
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              LIVE
            </Badge>
          )}
        </div>

        {/* Center section - Match selector */}
        <div className="flex-1 max-w-md mx-8">
          <Select
            value={state.selectedMatchId || ''}
            onValueChange={selectMatch}
          >
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select a match" />
            </SelectTrigger>
            <SelectContent>
              {state.matches.map(match => {
                const homeTeam = state.teams.find(t => t.id === match.homeTeamId);
                const awayTeam = state.teams.find(t => t.id === match.awayTeamId);
                return (
                  <SelectItem key={match.id} value={match.id}>
                    <div className="flex items-center space-x-2">
                      <span>{homeTeam?.shortName || homeTeam?.name}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span>{awayTeam?.shortName || awayTeam?.name}</span>
                      <Badge 
                        variant={match.status === 'LIVE' ? 'destructive' : 'secondary'}
                        className="ml-2"
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Right section - Time and controls */}
        <div className="flex items-center space-x-4">
          {/* System time */}
          <div className="text-sm font-mono bg-white/10 px-3 py-1 rounded-md">
            {formatTime(currentTime)}
          </div>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-white hover:bg-white/10"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}