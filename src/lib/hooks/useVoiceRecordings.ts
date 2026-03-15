'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Recording } from '../types';
import { useIndexedDB } from './useIndexedDB';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'voiceRecordings';

interface SaveRecordingParams {
  name: string;
  topicId: string;
  topicText: string;
  frameworkId: string;
  frameworkName: string;
  speechDurationSetting: number;
  durationSeconds: number;
}

interface UseVoiceRecordingsReturn {
  recordings: Recording[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  saveRecording: (blob: Blob, params: SaveRecordingParams) => Promise<string>;
  getRecording: (id: string) => Promise<{ metadata: Recording; blob: Blob } | null>;
  updateRecording: (id: string, updates: Partial<Recording>) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;

  // Playback helpers
  getAudioUrl: (id: string) => Promise<string | null>;
  revokeAudioUrl: (url: string) => void;

  // Storage info
  totalStorageUsed: number; // bytes
}

export function useVoiceRecordings(): UseVoiceRecordingsReturn {
  const [recordings, setRecordings, isLocalStorageHydrated] = useLocalStorage<Recording[]>(STORAGE_KEY, []);
  const [operationError, setOperationError] = useState<string | null>(null);

  const audioDb = useIndexedDB<Blob>({ storeName: 'recordings' });

  // Keep a ref to recordings for stable callbacks
  const recordingsRef = useRef(recordings);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  // Calculate total storage used
  const totalStorageUsed = recordings.reduce((total, rec) => total + rec.fileSize, 0);

  const isLoading = !(audioDb.isReady && isLocalStorageHydrated);
  const error = operationError ?? audioDb.error ?? null;

  const saveRecording = useCallback(
    async (blob: Blob, params: SaveRecordingParams): Promise<string> => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const metadata: Recording = {
        id,
        name: params.name,
        createdAt: now,
        durationSeconds: params.durationSeconds,
        topicId: params.topicId,
        topicText: params.topicText,
        frameworkId: params.frameworkId,
        frameworkName: params.frameworkName,
        speechDurationSetting: params.speechDurationSetting,
        fileSize: blob.size,
      };

      try {
        // Save audio blob to IndexedDB
        await audioDb.put(id, blob);

        // Save metadata to localStorage
        setRecordings((prev) => [metadata, ...prev]);

        return id;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save recording';
        setOperationError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [audioDb, setRecordings]
  );

  const getRecording = useCallback(
    async (id: string): Promise<{ metadata: Recording; blob: Blob } | null> => {
      // Use ref to avoid dependency on recordings
      const metadata = recordingsRef.current.find((r) => r.id === id);
      if (!metadata) return null;

      try {
        const blob = await audioDb.get(id);
        if (!blob) return null;

        return { metadata, blob };
      } catch (err) {
        console.error('Failed to get recording:', err);
        return null;
      }
    },
    [audioDb]
  );

  const updateRecording = useCallback(
    async (id: string, updates: Partial<Recording>): Promise<void> => {
      setRecordings((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
      );
    },
    [setRecordings]
  );

  const deleteRecording = useCallback(
    async (id: string): Promise<void> => {
      try {
        // Delete from IndexedDB
        await audioDb.delete(id);

        // Delete from localStorage
        setRecordings((prev) => prev.filter((rec) => rec.id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete recording';
        setOperationError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [audioDb, setRecordings]
  );

  const getAudioUrl = useCallback(
    async (id: string): Promise<string | null> => {
      try {
        const blob = await audioDb.get(id);
        if (!blob) return null;

        return URL.createObjectURL(blob);
      } catch (err) {
        console.error('Failed to get audio URL:', err);
        return null;
      }
    },
    [audioDb]
  );

  const revokeAudioUrl = useCallback((url: string): void => {
    URL.revokeObjectURL(url);
  }, []);

  return {
    recordings,
    isLoading,
    error,
    saveRecording,
    getRecording,
    updateRecording,
    deleteRecording,
    getAudioUrl,
    revokeAudioUrl,
    totalStorageUsed,
  };
}
