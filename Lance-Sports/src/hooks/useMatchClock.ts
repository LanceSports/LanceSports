import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchStatus } from '../types/match';

interface UseMatchClockProps {
  initialClock: string;
  status: MatchStatus;
  onClockUpdate?: (clock: string) => void;
}

export function useMatchClock({ initialClock, status, onClockUpdate }: UseMatchClockProps) {
  const [clock, setClock] = useState(initialClock);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Parse MM:SS format to total seconds
  const parseClockToSeconds = useCallback((timeString: string): number => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  }, []);

  // Format seconds to MM:SS
  const formatSecondsToCloud = useCallback((totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    const initialSeconds = parseClockToSeconds(clock);
    startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);

    intervalRef.current = setInterval(() => {
      if (status === 'LIVE') {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const currentSeconds = initialSeconds + elapsed;
        const newClock = formatSecondsToCloud(currentSeconds);
        setClock(newClock);
        onClockUpdate?.(newClock);
      }
    }, 1000);
  }, [clock, status, parseClockToSeconds, formatSecondsToCloud, onClockUpdate]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      pausedTimeRef.current = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
    }
  }, []);

  const resume = useCallback(() => {
    if (!intervalRef.current && status === 'LIVE') {
      start();
    }
  }, [start, status]);

  const reset = useCallback((newClock: string) => {
    pause();
    setClock(newClock);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  }, [pause]);

  // Auto-start/stop based on status
  useEffect(() => {
    if (status === 'LIVE') {
      start();
    } else {
      pause();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, start, pause]);

  // Update clock when initialClock changes externally
  useEffect(() => {
    setClock(initialClock);
    pausedTimeRef.current = 0;
  }, [initialClock]);

  return {
    clock,
    start,
    pause,
    resume,
    reset,
    isRunning: intervalRef.current !== null
  };
}