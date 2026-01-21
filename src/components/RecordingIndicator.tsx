'use client';

import { cn } from '@/lib/utils';

interface RecordingIndicatorProps {
  duration: number; // seconds
  isRecording: boolean;
  isPaused?: boolean;
  className?: string;
}

export function RecordingIndicator({
  duration,
  isRecording,
  isPaused = false,
  className,
}: RecordingIndicatorProps) {
  // Format duration as MM:SS
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  if (!isRecording) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5',
        className
      )}
    >
      {/* Pulsing red dot */}
      <div className="relative flex h-3 w-3 items-center justify-center">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75',
            !isPaused && 'animate-ping'
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2.5 w-2.5 rounded-full',
            isPaused ? 'bg-red-300' : 'bg-red-500'
          )}
        />
      </div>

      {/* Duration and status */}
      <span className="font-mono text-sm font-medium text-red-600">
        {timeDisplay}
      </span>
      {isPaused && (
        <span className="text-xs font-medium uppercase text-red-400">
          Paused
        </span>
      )}
    </div>
  );
}
