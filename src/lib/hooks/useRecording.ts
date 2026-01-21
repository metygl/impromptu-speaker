'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRecordingOptions {
  onComplete?: (blob: Blob, durationSeconds: number) => void;
  onError?: (error: Error) => void;
}

interface UseRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  pause: () => void;
  resume: () => void;
  hasPermission: boolean | null; // null = unknown
  requestPermission: () => Promise<boolean>;
}

// Determine the best supported audio format
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm'; // fallback
}

export function useRecording(options: UseRecordingOptions = {}): UseRecordingReturn {
  const { onComplete, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check permission status on mount
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return;

    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        setHasPermission(result.state === 'granted');
        result.onchange = () => {
          setHasPermission(result.state === 'granted');
        };
      })
      .catch(() => {
        // Permission query not supported
        setHasPermission(null);
      });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const updateDuration = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
    setDuration(Math.floor(elapsed));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      return true;
    } catch (err) {
      setHasPermission(false);
      return false;
    }
  }, []);

  const start = useCallback(async (): Promise<void> => {
    setError(null);
    chunksRef.current = [];
    pausedDurationRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        const errorMessage = 'Recording failed';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      };

      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(updateDuration, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      setHasPermission(false);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [onError, updateDuration]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const finalDuration = Math.floor(
          (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000
        );

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        mediaRecorderRef.current = null;
        chunksRef.current = [];

        onComplete?.(blob, finalDuration);
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, [onComplete]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      // Track when we paused
      pausedDurationRef.current -= Date.now();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Account for paused time
      pausedDurationRef.current += Date.now();

      // Restart the timer
      timerRef.current = setInterval(updateDuration, 1000);
    }
  }, [updateDuration]);

  return {
    isRecording,
    isPaused,
    duration,
    error,
    start,
    stop,
    pause,
    resume,
    hasPermission,
    requestPermission,
  };
}
