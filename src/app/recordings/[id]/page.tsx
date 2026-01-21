'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Sparkles, FileText, Clock, Calendar } from 'lucide-react';
import { Header } from '@/components/Header';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TranscriptionProgress } from '@/components/TranscriptionProgress';
import { useVoiceRecordings } from '@/lib/hooks/useVoiceRecordings';
import { useTranscription } from '@/lib/hooks/useTranscription';
import { Recording, SpeechAnalysis } from '@/lib/types';

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
  const { recordings, getRecording, deleteRecording, updateRecording, isLoading: isHookLoading } = useVoiceRecordings();
  const { transcribe, progress: transcriptionProgress } = useTranscription();

  const [recording, setRecording] = useState<Recording | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'transcribing' | 'analyzing' | 'complete' | 'error'>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load recording data - wait for hook to be ready first
  useEffect(() => {
    // Don't try to load until the hook is ready
    if (isHookLoading) return;

    let mounted = true;

    const loadRecording = async () => {
      setIsLoading(true);
      const data = await getRecording(id);
      if (mounted && data) {
        setRecording(data.metadata);
        setAudioBlob(data.blob);
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    loadRecording();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isHookLoading]);

  // Update recording metadata when it changes in the list (e.g., after analysis)
  useEffect(() => {
    const updated = recordings.find((r) => r.id === id);
    if (updated && recording && updated.analyzedAt !== recording.analyzedAt) {
      setRecording(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordings, id]);

  const handleDelete = async () => {
    await deleteRecording(id);
    router.push('/recordings');
  };

  const handleAnalyze = async () => {
    if (!audioBlob || !recording) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep('transcribing');

    try {
      // Step 1: Transcribe the audio
      const transcript = await transcribe(audioBlob);

      // Update recording with transcript
      await updateRecording(id, { transcript });

      // Step 2: Analyze with Codex
      setAnalysisStep('analyzing');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          topic: recording.topicText,
          framework: recording.frameworkName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const { analysis } = await response.json();

      // Update recording with analysis
      await updateRecording(id, {
        transcript,
        analysis,
        analyzedAt: new Date().toISOString(),
      });

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
        <Header title="Recording" showBack onBack={() => router.push('/recordings')} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Recording" showBack onBack={() => router.push('/recordings')} />
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

  const hasAnalysis = !!recording.analysis;
  const hasTranscript = !!recording.transcript;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Recording" showBack onBack={() => router.push('/recordings')} />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Recording name */}
          <h1 className="mt-6 font-display text-2xl font-medium text-text-primary">
            {recording.name}
          </h1>

          {/* Metadata */}
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

          {/* Audio player */}
          {audioBlob && (
            <div className="mt-6">
              <AudioPlayer blob={audioBlob} />
            </div>
          )}

          {/* Topic and Framework */}
          <div className="mt-6 space-y-4">
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
              <p className="mt-2 font-medium text-text-primary">
                {recording.frameworkName}
              </p>
            </div>
          </div>

          {/* Analyze section */}
          {!hasAnalysis && (
            <div className="mt-6">
              {/* Progress indicator */}
              {isAnalyzing && (
                <div className="mb-4">
                  {analysisStep === 'transcribing' && (
                    <TranscriptionProgress
                      status={transcriptionProgress.status}
                      modelProgress={transcriptionProgress.modelProgress}
                      transcriptionProgress={transcriptionProgress.transcriptionProgress}
                      message={transcriptionProgress.message}
                    />
                  )}
                  {analysisStep === 'analyzing' && (
                    <TranscriptionProgress
                      status="transcribing"
                      message="Analyzing transcript with AI..."
                    />
                  )}
                </div>
              )}

              {/* Error display */}
              {analysisError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{analysisError}</p>
                  <button
                    onClick={() => setAnalysisError(null)}
                    className="mt-2 text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Analyze button */}
              {!isAnalyzing && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !audioBlob}
                  className="btn btn-primary w-full justify-center"
                >
                  <Sparkles className="h-4 w-4" />
                  Transcribe & Analyze
                </button>
              )}
            </div>
          )}

          {/* Transcript section */}
          {hasTranscript && (
            <div className="mt-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-medium text-text-primary">
                <FileText className="h-5 w-5" />
                Transcript
              </h2>
              <div className="mt-3 rounded-xl border border-border bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                  {recording.transcript}
                </p>
              </div>
            </div>
          )}

          {/* Analysis section */}
          {hasAnalysis && recording.analysis && (
            <div className="mt-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-medium text-text-primary">
                <Sparkles className="h-5 w-5" />
                Analysis
              </h2>

              {/* Overall score */}
              {recording.analysis.overallScore && (
                <div className="mt-3 flex items-center justify-center rounded-xl bg-accent-subtle p-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-accent">
                      {recording.analysis.overallScore}
                    </span>
                    <span className="text-lg text-accent">/10</span>
                    <p className="mt-1 text-sm text-text-secondary">Overall Score</p>
                  </div>
                </div>
              )}

              {/* Analysis sections */}
              <div className="mt-4 space-y-3">
                {[
                  { key: 'clarityAndStructure', label: 'Clarity & Structure' },
                  { key: 'concisenessAndWordChoice', label: 'Conciseness & Word Choice' },
                  { key: 'emotionalResonance', label: 'Emotional Resonance' },
                  { key: 'toneAndPresence', label: 'Tone & Presence' },
                  { key: 'audienceConnection', label: 'Audience Connection' },
                ].map(({ key, label }) => {
                  const section = recording.analysis![key as keyof typeof recording.analysis] as {
                    score: number;
                    feedback: string;
                  };
                  if (!section || typeof section !== 'object') return null;

                  return (
                    <div key={key} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">{label}</span>
                        <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-sm font-medium">
                          {section.score}/10
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">{section.feedback}</p>
                    </div>
                  );
                })}
              </div>

              {/* Improvements */}
              {recording.analysis.improvements && recording.analysis.improvements.length > 0 && (
                <div className="mt-4 rounded-xl border border-border bg-white p-4">
                  <span className="font-medium text-text-primary">Key Improvements</span>
                  <ul className="mt-3 space-y-2">
                    {recording.analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex gap-2 text-sm text-text-secondary">
                        <span className="flex-shrink-0 font-medium text-accent">
                          {index + 1}.
                        </span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Delete button */}
          <div className="mt-8 border-t border-border pt-6">
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
