'use client';

import { cn } from '@/lib/utils';

interface TimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  phase: 'prep' | 'speech' | 'done';
  className?: string;
}

export function Timer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  phase,
  className,
}: TimerProps) {
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isWarning = phase === 'speech' && remainingSeconds <= 30 && remainingSeconds > 0;
  const isFinalCountdown = remainingSeconds <= 10 && remainingSeconds > 0;

  // SVG dimensions
  const size = 280;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Format time
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Get color based on phase
  const getStrokeColor = () => {
    if (phase === 'done') return 'var(--timer-done)';
    if (isWarning) return 'var(--timer-warning)';
    if (phase === 'prep') return 'var(--timer-prep)';
    return 'var(--timer-speech)';
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        phase === 'prep' && isRunning && 'timer-breathe',
        className
      )}
    >
      {/* Background glow for speech phase */}
      {phase === 'speech' && isRunning && (
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-2xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${getStrokeColor()} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* SVG Timer Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono text-5xl font-medium tracking-tight transition-all duration-300',
            isFinalCountdown && 'scale-110',
            phase === 'done' && 'text-timer-done'
          )}
          style={{
            color: phase !== 'done' ? getStrokeColor() : undefined,
          }}
        >
          {timeDisplay}
        </span>

        {/* Phase label */}
        <span className="mt-2 text-sm uppercase tracking-widest text-text-secondary">
          {phase === 'prep' && 'Prepare'}
          {phase === 'speech' && (isWarning ? 'Wrap up' : 'Speaking')}
          {phase === 'done' && 'Complete'}
        </span>
      </div>

      {/* Pulse ring for final countdown */}
      {isFinalCountdown && isRunning && (
        <div
          className="absolute inset-0 rounded-full border-4 timer-pulse"
          style={{ borderColor: getStrokeColor() }}
        />
      )}
    </div>
  );
}
