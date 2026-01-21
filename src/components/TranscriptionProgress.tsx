'use client';

import { cn } from '@/lib/utils';
import { Loader2, Download, FileAudio, CheckCircle, AlertCircle } from 'lucide-react';

interface TranscriptionProgressProps {
  status: 'idle' | 'loading-model' | 'transcribing' | 'complete' | 'error';
  modelProgress?: number;
  transcriptionProgress?: number;
  message?: string;
  className?: string;
}

export function TranscriptionProgress({
  status,
  modelProgress = 0,
  transcriptionProgress = 0,
  message,
  className,
}: TranscriptionProgressProps) {
  if (status === 'idle') return null;

  const getIcon = () => {
    switch (status) {
      case 'loading-model':
        return <Download className="h-5 w-5 text-accent" />;
      case 'transcribing':
        return <FileAudio className="h-5 w-5 text-accent" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-timer-done" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-accent" />;
    }
  };

  const getProgress = () => {
    if (status === 'loading-model') return modelProgress;
    if (status === 'transcribing') return transcriptionProgress;
    if (status === 'complete') return 100;
    return 0;
  };

  const progress = getProgress();
  const showProgressBar = status === 'loading-model' || status === 'transcribing';

  return (
    <div className={cn('rounded-xl bg-bg-secondary p-4', className)}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
          {status === 'loading-model' || status === 'transcribing' ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            getIcon()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            status === 'error' ? 'text-red-600' : 'text-text-primary'
          )}>
            {message || 'Processing...'}
          </p>

          {/* Progress bar */}
          {showProgressBar && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional info for model loading */}
      {status === 'loading-model' && modelProgress < 100 && (
        <p className="mt-3 text-xs text-text-secondary">
          Downloading the Whisper model for the first time. This will be cached for future use.
        </p>
      )}
    </div>
  );
}
