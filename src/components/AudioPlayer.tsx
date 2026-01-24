'use client';

import { useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';

interface AudioPlayerProps {
  blob?: Blob;
  url?: string;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ blob, url, className }: AudioPlayerProps) {
  const {
    isPlaying,
    isLoaded,
    currentTime,
    duration,
    progress,
    toggle,
    seekToProgress,
    setPlaybackRate,
    playbackRate,
    load,
    loadUrl,
    unload,
  } = useAudioPlayback();

  const progressBarRef = useRef<HTMLDivElement>(null);

  // Use refs to always have access to the latest functions
  const loadRef = useRef(load);
  const loadUrlRef = useRef(loadUrl);
  const unloadRef = useRef(unload);

  // Keep refs updated
  useEffect(() => {
    loadRef.current = load;
    loadUrlRef.current = loadUrl;
    unloadRef.current = unload;
  });

  // Load audio when blob or url changes
  useEffect(() => {
    if (blob) {
      loadRef.current(blob);
    } else if (url) {
      loadUrlRef.current(url);
    }

    return () => {
      unloadRef.current();
    };
  }, [blob, url]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !isLoaded) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    seekToProgress(Math.max(0, Math.min(1, clickPosition)));
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    <div className={cn('rounded-xl bg-bg-secondary p-4', className)}>
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={toggle}
          disabled={!isLoaded}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white transition-all',
            'hover:bg-accent-hover active:scale-95',
            !isLoaded && 'cursor-not-allowed opacity-50'
          )}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        {/* Progress section */}
        <div className="flex-1">
          {/* Progress bar - wrapper with larger click area */}
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="group relative flex h-6 cursor-pointer items-center"
          >
            {/* Visible track */}
            <div className="h-2 w-full rounded-full bg-border" />

            {/* Progress fill */}
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-accent transition-all"
              style={{ width: `${progress * 100}%` }}
            />

            {/* Scrubber handle */}
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-accent opacity-0 shadow-md transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progress * 100}% - 8px)` }}
            />
          </div>

          {/* Time display */}
          <div className="mt-1 flex justify-between text-xs text-text-secondary">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Speed control */}
        <button
          onClick={handleSpeedChange}
          disabled={!isLoaded}
          className={cn(
            'rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition-colors',
            'hover:bg-border hover:text-text-primary',
            !isLoaded && 'cursor-not-allowed opacity-50'
          )}
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
