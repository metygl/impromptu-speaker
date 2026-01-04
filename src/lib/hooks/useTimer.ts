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
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  // Timer logic
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newValue = prev - 1;
          onTickRef.current?.(newValue);

          if (newValue <= 0) {
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  const start = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
    }
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setRemainingSeconds(newSeconds ?? initialSeconds);
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
