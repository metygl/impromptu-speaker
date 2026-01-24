'use client';

import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveRecordingModalProps {
  isOpen: boolean;
  topicText: string;
  frameworkName: string;
  duration: number; // seconds
  defaultName?: string;
  onSave: (name: string) => void;
  onDiscard: () => void;
}

export function SaveRecordingModal({
  isOpen,
  topicText,
  frameworkName,
  duration,
  defaultName = 'Untitled',
  onSave,
  onDiscard,
}: SaveRecordingModalProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Format duration as MM:SS
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const durationDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleSave = async () => {
    setIsSaving(true);
    // Pass the name to parent - parent will use defaultName if empty
    onSave(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDiscard}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-bg-primary p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onDiscard}
          className="absolute right-4 top-4 rounded-full p-1 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <h2 className="font-display text-2xl font-medium text-text-primary">
          Save Recording
        </h2>

        {/* Recording info */}
        <div className="mt-4 rounded-lg bg-bg-secondary p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Duration</span>
            <span className="font-mono font-medium">{durationDisplay}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-text-secondary">Framework</span>
            <span className="font-medium">{frameworkName}</span>
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <span className="text-xs text-text-secondary">Topic</span>
            <p className="mt-1 text-sm leading-relaxed">{topicText}</p>
          </div>
        </div>

        {/* Name input */}
        <div className="mt-4">
          <label
            htmlFor="recording-name"
            className="block text-sm font-medium text-text-secondary"
          >
            Recording Name
          </label>
          <input
            id="recording-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${defaultName} (default)`}
            className="mt-1.5 w-full rounded-lg border border-border bg-bg-primary px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onDiscard}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <Trash2 className="h-4 w-4" />
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover',
              isSaving && 'cursor-not-allowed opacity-50'
            )}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
