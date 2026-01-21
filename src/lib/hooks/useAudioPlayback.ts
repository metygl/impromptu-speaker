'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0-1
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  seekToProgress: (progress: number) => void;
  setPlaybackRate: (rate: number) => void;
  playbackRate: number;
  load: (blob: Blob) => void;
  loadUrl: (url: string) => void;
  unload: () => void;
}

export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Update time display during playback
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.paused) {
        setIsPlaying(false);
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      // Remove event listeners before clearing src to prevent error events
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setIsLoaded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const initAudio = useCallback(
    (src: string) => {
      cleanup();

      const audio = new Audio();
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.oncanplaythrough = () => {
        setIsLoaded(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(audio.duration);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      audio.onerror = () => {
        // Only log if it's a real error (not an empty src or about:blank)
        if (audio.src && audio.src !== '' && !audio.src.includes('about:blank')) {
          // MediaError codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED
          const errorCode = audio.error?.code;
          const errorMessages: Record<number, string> = {
            1: 'Loading aborted',
            2: 'Network error',
            3: 'Decode error',
            4: 'Source not supported',
          };
          const errorMsg = errorCode ? errorMessages[errorCode] || `Error code ${errorCode}` : 'Unknown error';
          console.warn('Audio loading issue:', errorMsg, '- Source:', audio.src.substring(0, 50));
        }
        setIsLoaded(false);
      };

      audio.playbackRate = playbackRate;
      audio.preload = 'auto';
      audio.src = src;
      audio.load();
    },
    [cleanup, playbackRate]
  );

  const load = useCallback(
    (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      initAudio(url);
    },
    [initAudio]
  );

  const loadUrl = useCallback(
    (url: string) => {
      initAudio(url);
    },
    [initAudio]
  );

  const unload = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const play = useCallback(() => {
    if (audioRef.current && isLoaded) {
      audioRef.current.play();
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [isLoaded, updateTime]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const seekToProgress = useCallback(
    (progress: number) => {
      if (duration > 0) {
        seek(progress * duration);
      }
    },
    [duration, seek]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setPlaybackRateState(rate);
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;

  return {
    isPlaying,
    isLoaded,
    currentTime,
    duration,
    progress,
    play,
    pause,
    toggle,
    seek,
    seekToProgress,
    setPlaybackRate,
    playbackRate,
    load,
    loadUrl,
    unload,
  };
}
