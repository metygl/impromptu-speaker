'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerSelectorProps {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function TimerSelector({
  durationSeconds,
  onDurationChange,
  min = 60,
  max = 600,
  step = 30,
  className,
}: TimerSelectorProps) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  const decrease = () => {
    const newValue = Math.max(min, durationSeconds - step);
    onDurationChange(newValue);
  };

  const increase = () => {
    const newValue = Math.min(max, durationSeconds + step);
    onDurationChange(newValue);
  };

  const presets = [
    { label: '2 min', value: 120 },
    { label: '3 min', value: 180 },
    { label: '5 min', value: 300 },
  ];

  return (
    <div className={className}>
      <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-text-secondary">
        Speech Duration
      </label>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={decrease}
          disabled={durationSeconds <= min}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-text-primary transition-colors hover:bg-bg-secondary disabled:opacity-40"
        >
          <Minus className="h-5 w-5" />
        </button>

        <div className="flex min-w-[100px] flex-col items-center">
          <span className="font-mono text-4xl font-medium text-text-primary">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-text-secondary">minutes</span>
        </div>

        <button
          onClick={increase}
          disabled={durationSeconds >= max}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-text-primary transition-colors hover:bg-bg-secondary disabled:opacity-40"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Presets */}
      <div className="mt-4 flex justify-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onDurationChange(preset.value)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              durationSeconds === preset.value
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
