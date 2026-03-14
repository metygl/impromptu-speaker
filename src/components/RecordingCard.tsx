'use client';

import { useState } from 'react';
import { Play, Pause, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Recording } from '@/lib/types';

interface RecordingCardProps {
  recording: Recording;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RecordingCard({
  recording,
  isPlaying = false,
  onPlay,
  onPause,
  onDelete,
  onClick,
  className,
}: RecordingCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const hasAnalysis = !!recording.analysis;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group card relative rounded-2xl p-4 transition-all',
        onClick && 'cursor-pointer hover:border-border-strong hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Play button */}
        <button
          onClick={handlePlayPause}
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all',
            isPlaying
              ? 'bg-accent text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-accent hover:text-white'
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-text-primary">
              {recording.name}
            </h3>
            {hasAnalysis && (
              <span className="flex items-center gap-1 rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
                <Sparkles className="h-3 w-3" />
                Analyzed
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-sm text-text-secondary">
            {recording.topicText}
          </p>

          <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
            <span className="font-mono">{formatDuration(recording.durationSeconds)}</span>
            <span className="text-border-strong">•</span>
            <span>{formatDate(recording.createdAt)}</span>
            <span className="text-border-strong">•</span>
            <span>{formatFileSize(recording.fileSize)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={handleDeleteClick}
                className="rounded-lg p-2 text-text-secondary opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {onClick && (
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              )}
            </>
          ) : (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleCancelDelete}
                className="rounded-lg px-2 py-1 text-xs font-medium text-text-secondary hover:bg-bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
