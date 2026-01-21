'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, HardDrive } from 'lucide-react';
import { Header } from '@/components/Header';
import { RecordingCard } from '@/components/RecordingCard';
import { useVoiceRecordings } from '@/lib/hooks/useVoiceRecordings';
import { useAudioPlayback } from '@/lib/hooks/useAudioPlayback';

function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RecordingsPage() {
  const router = useRouter();
  const {
    recordings,
    isLoading,
    totalStorageUsed,
    deleteRecording,
    getAudioUrl,
    revokeAudioUrl,
  } = useVoiceRecordings();

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const audioPlayback = useAudioPlayback();

  // Handle audio URL cleanup
  useEffect(() => {
    return () => {
      if (currentAudioUrl) {
        revokeAudioUrl(currentAudioUrl);
      }
    };
  }, [currentAudioUrl, revokeAudioUrl]);

  // Handle playback end
  useEffect(() => {
    if (!audioPlayback.isPlaying && playingId && audioPlayback.progress >= 0.99) {
      setPlayingId(null);
    }
  }, [audioPlayback.isPlaying, audioPlayback.progress, playingId]);

  const handlePlay = async (id: string) => {
    // Stop current playback if different recording
    if (playingId && playingId !== id) {
      audioPlayback.unload();
      if (currentAudioUrl) {
        revokeAudioUrl(currentAudioUrl);
      }
    }

    const url = await getAudioUrl(id);
    if (url) {
      setCurrentAudioUrl(url);
      audioPlayback.loadUrl(url);
      setPlayingId(id);
      // Small delay to ensure audio is loaded
      setTimeout(() => audioPlayback.play(), 100);
    }
  };

  const handlePause = () => {
    audioPlayback.pause();
  };

  const handleDelete = async (id: string) => {
    if (playingId === id) {
      audioPlayback.unload();
      setPlayingId(null);
    }
    await deleteRecording(id);
  };

  const handleCardClick = (id: string) => {
    router.push(`/recordings/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Recordings" showBack onBack={() => router.push('/')} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Recordings" showBack onBack={() => router.push('/')} />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Storage info */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-bg-secondary px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <HardDrive className="h-4 w-4" />
              <span>Storage used</span>
            </div>
            <span className="text-sm font-medium">
              {formatStorageSize(totalStorageUsed)}
            </span>
          </div>

          {/* Recordings list */}
          {recordings.length > 0 ? (
            <div className="mt-6 space-y-3">
              {recordings.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  isPlaying={playingId === recording.id && audioPlayback.isPlaying}
                  onPlay={() => handlePlay(recording.id)}
                  onPause={handlePause}
                  onDelete={() => handleDelete(recording.id)}
                  onClick={() => handleCardClick(recording.id)}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
                <Mic className="h-8 w-8 text-text-secondary" />
              </div>
              <h2 className="mt-4 font-display text-xl font-medium text-text-primary">
                No recordings yet
              </h2>
              <p className="mt-2 max-w-xs text-sm text-text-secondary">
                Complete a practice session to save your first recording. Your
                recordings will appear here.
              </p>
              <button
                onClick={() => router.push('/setup')}
                className="btn btn-primary mt-6"
              >
                Start Practice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
