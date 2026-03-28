'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (remainingSeconds: number) => void;
}

interface UseTimerReturn {
  remainingSeconds: number;
  isRunning: boolean;
  progress: number; // 0 to 1
  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
  formatTime: () => string;
}

export function useTimer({
  initialSeconds,
  onComplete,
  onTick,
}: UseTimerOptions): UseTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  const remainingSecondsRef = useRef(remainingSeconds);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  const syncRemainingSeconds = useCallback(() => {
    if (deadlineRef.current === null) {
      return remainingSecondsRef.current;
    }

    return Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRunning || remainingSecondsRef.current <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    const tick = () => {
      const nextValue = syncRemainingSeconds();

      if (nextValue !== remainingSecondsRef.current) {
        remainingSecondsRef.current = nextValue;
        setRemainingSeconds(nextValue);
        onTickRef.current?.(nextValue);
      }

      if (nextValue <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        deadlineRef.current = null;
        setIsRunning(false);
        onCompleteRef.current?.();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 250);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, syncRemainingSeconds]);

  const start = useCallback(() => {
    if (remainingSecondsRef.current > 0) {
      deadlineRef.current = Date.now() + remainingSecondsRef.current * 1000;
      setIsRunning(true);
    }
  }, []);

  const pause = useCallback(() => {
    const nextValue = syncRemainingSeconds();
    deadlineRef.current = null;
    remainingSecondsRef.current = nextValue;
    setRemainingSeconds(nextValue);
    setIsRunning(false);
  }, [syncRemainingSeconds]);

  const reset = useCallback((newSeconds?: number) => {
    const nextValue = newSeconds ?? initialSeconds;
    deadlineRef.current = null;
    remainingSecondsRef.current = nextValue;
    setIsRunning(false);
    setRemainingSeconds(nextValue);
  }, [initialSeconds]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  const progress = initialSeconds > 0 ? remainingSeconds / initialSeconds : 0;

  return {
    remainingSeconds,
    isRunning,
    progress,
    start,
    pause,
    reset,
    formatTime,
  };
}
