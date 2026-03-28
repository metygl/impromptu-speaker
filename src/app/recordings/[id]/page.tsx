'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Sparkles,
  FileText,
  Clock,
  Calendar,
  RotateCcw,
  Mic,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { AudioPlayer } from '@/components/AudioPlayer';
import { FrameworkCard } from '@/components/FrameworkCard';
import { SpeechAnalysisView } from '@/components/SpeechAnalysisView';
import { TranscriptionProgress } from '@/components/TranscriptionProgress';
import { useAuth } from '@/components/AuthProvider';
import { getFrameworkById } from '@/lib/data/frameworks';
import { useVoiceRecordings } from '@/lib/hooks/useVoiceRecordings';
import { useTranscription } from '@/lib/hooks/useTranscription';
import { Recording } from '@/lib/types';

interface RecordingDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RecordingDetailPage({ params }: RecordingDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { recordings, getRecording, deleteRecording, updateRecording, isLoading: isHookLoading } =
    useVoiceRecordings();
  const {
    transcribe,
    progress: transcriptionProgress,
    isSupported: isTranscriptionSupported,
  } = useTranscription();

  const [recording, setRecording] = useState<Recording | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<
    'idle' | 'transcribing' | 'analyzing' | 'complete' | 'error'
  >('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const isRemoteTranscription = Boolean(user) && !isTranscriptionSupported;

  useEffect(() => {
    if (isHookLoading) return;

    let mounted = true;
    let objectUrl: string | null = null;

    const loadRecording = async () => {
      setIsLoading(true);
      const data = await getRecording(id);
      if (mounted && data) {
        setRecording(data.metadata);
        setAudioBlob(data.blob);
        objectUrl = URL.createObjectURL(data.blob);
        setAudioUrl(objectUrl);
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    loadRecording();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isHookLoading]);

  useEffect(() => {
    const updated = recordings.find((entry) => entry.id === id);
    if (!updated || !recording) return;

    if (
      updated.analyzedAt !== recording.analyzedAt ||
      updated.transcript !== recording.transcript ||
      updated.feedbackId !== recording.feedbackId
    ) {
      setRecording(updated);
    }
  }, [id, recording, recordings]);

  const handleDelete = async () => {
    await deleteRecording(id);
    router.push('/recordings');
  };

  const handleAnalyze = async () => {
    if (!audioBlob || !recording || !user) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep('transcribing');

    try {
      if (isRemoteTranscription) {
        const formData = new FormData();
        formData.append(
          'audio',
          audioBlob,
          `${recording.name.trim().replace(/\s+/g, '-').toLowerCase() || 'recording'}.webm`
        );
        formData.append('topic', recording.topicText);
        formData.append('framework', recording.frameworkName);
        formData.append('durationSeconds', String(recording.durationSeconds));

        if (recording.frameworkId) {
          formData.append('frameworkId', recording.frameworkId);
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        const data: {
          analysis?: Recording['analysis'];
          error?: string;
          feedbackId?: string;
          transcript?: string;
        } | null = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || 'Analysis failed');
        }

        const transcript = data?.transcript?.trim();
        if (!transcript) {
          throw new Error('Analysis returned an empty transcript');
        }

        const nextUpdates = {
          transcript,
          analysis: data?.analysis,
          analyzedAt: new Date().toISOString(),
          feedbackId: data?.feedbackId,
        };

        await updateRecording(id, nextUpdates);
        setRecording((current) => (current ? { ...current, ...nextUpdates } : current));
        setAnalysisStep('complete');
        return;
      }

      const transcript = await transcribe(audioBlob);
      const transcriptUpdates = { transcript };

      await updateRecording(id, transcriptUpdates);
      setRecording((current) => (current ? { ...current, ...transcriptUpdates } : current));

      setAnalysisStep('analyzing');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          topic: recording.topicText,
          framework: recording.frameworkName,
          frameworkId: recording.frameworkId,
        }),
      });

      const data: {
        analysis?: Recording['analysis'];
        error?: string;
        feedbackId?: string;
        transcript?: string;
      } | null = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Analysis failed');
      }

      const normalizedTranscript = data?.transcript?.trim() || transcript;

      const nextUpdates = {
        transcript: normalizedTranscript,
        analysis: data?.analysis,
        analyzedAt: new Date().toISOString(),
        feedbackId: data?.feedbackId,
      };

      await updateRecording(id, nextUpdates);
      setRecording((current) => (current ? { ...current, ...nextUpdates } : current));
      setAnalysisStep('complete');
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      setAnalysisStep('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || isHookLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Recording" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Recording" />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <h2 className="font-display text-xl font-medium text-text-primary">
            Recording not found
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            This recording may have been deleted.
          </p>
          <button
            onClick={() => router.push('/recordings')}
            className="btn btn-primary mt-6"
          >
            Back to Recordings
          </button>
        </div>
      </div>
    );
  }

  const hasAnalysis = Boolean(recording.analysis);
  const hasTranscript = Boolean(recording.transcript);
  const selectedFramework = getFrameworkById(recording.frameworkId);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Recording" />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mt-6 font-display text-2xl font-medium text-text-primary">
            {recording.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDuration(recording.durationSeconds)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(recording.createdAt)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Topic
              </span>
              <p className="mt-2 text-text-primary">{recording.topicText}</p>
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Framework
              </span>
              <p className="mt-2 font-medium text-text-primary">{recording.frameworkName}</p>
            </div>
          </div>

          {selectedFramework ? (
            <FrameworkCard framework={selectedFramework} className="mt-6" />
          ) : null}

          {audioUrl ? (
            <div className="mt-6 rounded-2xl border border-border bg-white p-5">
              <AudioPlayer url={audioUrl} />
            </div>
          ) : null}

          {!hasAnalysis ? (
            <div className="mt-6 rounded-2xl border border-border bg-white p-5">
              {isAnalyzing ? (
                <div>
                  {analysisStep === 'transcribing' ? (
                    isRemoteTranscription ? (
                      <TranscriptionProgress
                        status="preparing-audio"
                        message="Uploading and transcribing audio on the server..."
                      />
                    ) : (
                      <TranscriptionProgress
                        status={transcriptionProgress.status}
                        modelProgress={transcriptionProgress.modelProgress}
                        transcriptionProgress={transcriptionProgress.transcriptionProgress}
                        message={transcriptionProgress.message}
                      />
                    )
                  ) : (
                    <TranscriptionProgress
                      status="transcribing"
                      message="Analyzing transcript with AI..."
                    />
                  )}
                </div>
              ) : null}

              {analysisError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {analysisError}
                </div>
              ) : null}

              {!user ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Sign in to request AI feedback for this local recording.
                  <div className="mt-3">
                    <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
                      Go to sign in
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {isRemoteTranscription ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      iPhone and iPad use transient server transcription so your recording can still be
                      analyzed. Audio is not stored on the server.
                    </div>
                  ) : null}
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !audioBlob}
                    className="btn btn-primary w-full justify-center"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isAnalyzing ? 'Analyzing...' : 'Transcribe & Analyze'}
                  </button>
                </>
              )}
            </div>
          ) : null}

          {hasTranscript ? (
            <div className="mt-6">
              <button
                onClick={() => setIsTranscriptOpen((current) => !current)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-white p-4 text-left transition-colors hover:bg-bg-secondary"
              >
                <span className="flex items-center gap-2 font-display text-lg font-medium text-text-primary">
                  <FileText className="h-5 w-5" />
                  Transcript
                </span>
                {isTranscriptOpen ? (
                  <ChevronUp className="h-5 w-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-secondary" />
                )}
              </button>

              {isTranscriptOpen ? (
                <div className="mt-3 rounded-xl border border-border bg-white p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                    {recording.transcript}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {hasAnalysis && recording.analysis ? (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-medium text-text-primary">
                  <Sparkles className="h-5 w-5" />
                  AI Feedback
                </h2>
                {recording.feedbackId ? (
                  <button
                    onClick={() => router.push(`/feedback/${recording.feedbackId}`)}
                    className="text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Open saved feedback
                  </button>
                ) : null}
              </div>

              <div className="mt-4">
                <SpeechAnalysisView analysis={recording.analysis} />
              </div>
            </div>
          ) : null}

          <div className="mt-8 border-t border-border pt-6 space-y-3">
            <button
              onClick={() => {
                const params = new URLSearchParams({
                  topicId: recording.topicId,
                  topicText: recording.topicText,
                  frameworkId: recording.frameworkId,
                });
                router.push(`/practice?${params.toString()}`);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </button>

            <button
              onClick={() => router.push('/setup')}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              <Mic className="h-4 w-4" />
              Start New Practice
            </button>

            <Link
              href="/feedback"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
            >
              <History className="h-4 w-4" />
              View Past Feedback
            </Link>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Recording
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  Are you sure you want to delete this recording? This action cannot be undone.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
