'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileAudio,
  FileText,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { FlowActions } from '@/components/FlowActions';
import { Header } from '@/components/Header';
import { PageIntro } from '@/components/PageIntro';
import { SpeechAnalysisView } from '@/components/SpeechAnalysisView';
import { useVoiceRecordings } from '@/lib/hooks/useVoiceRecordings';
import { SpeechFeedbackRecord } from '@/lib/types';

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { recordings, getRecording, updateRecording, isLoading: areRecordingsLoading } =
    useVoiceRecordings();
  const [feedback, setFeedback] = useState<SpeechFeedbackRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [hasCheckedLocalRecording, setHasCheckedLocalRecording] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/feedback/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load feedback');
        }
        if (isMounted) {
          setFeedback(data.feedback);
          setIsLoading(false);
        }
      })
      .catch((nextError) => {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load feedback');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (areRecordingsLoading) return;

    let isMounted = true;
    let objectUrl: string | null = null;

    const loadLocalRecording = async () => {
      const linkedRecording = recordings.find((recording) => recording.feedbackId === id);

      if (!linkedRecording) {
        if (isMounted) {
          setLocalAudioUrl(null);
          setHasCheckedLocalRecording(true);
        }
        return;
      }

      const recordingData = await getRecording(linkedRecording.id);
      if (!isMounted) return;

      if (!recordingData) {
        setLocalAudioUrl(null);
        setHasCheckedLocalRecording(true);
        return;
      }

      objectUrl = URL.createObjectURL(recordingData.blob);
      setLocalAudioUrl(objectUrl);
      setHasCheckedLocalRecording(true);
    };

    void loadLocalRecording();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [areRecordingsLoading, getRecording, id, recordings]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete feedback');
      }

      const linkedRecordings = recordings.filter((recording) => recording.feedbackId === id);
      await Promise.all(
        linkedRecordings.map((recording) =>
          updateRecording(recording.id, {
            feedbackId: undefined,
          })
        )
      );

      router.push('/feedback');
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to delete feedback');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Feedback" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Feedback" />
        <div className="flex flex-1 items-center px-4 py-8">
          <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || 'Feedback not found'}
          </div>
        </div>
      </div>
    );
  }

  const handlePracticeAgain = () => {
    if (!feedback.frameworkId) {
      router.push('/setup');
      return;
    }

    const searchParams = new URLSearchParams({
      topicId: feedback.id,
      topicText: feedback.topicText,
      frameworkId: feedback.frameworkId,
    });

    router.push(`/practice?${searchParams.toString()}`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Feedback" />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <PageIntro
            eyebrow={feedback.frameworkName}
            title={feedback.topicText}
            description="Detailed review of this saved session, including local playback when available, transcript, and structured AI feedback."
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-bg-secondary px-4 py-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4" />
              {formatDate(feedback.createdAt)}
            </div>
          </PageIntro>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-xl text-text-primary">
              <FileAudio className="h-5 w-5" />
              Local recording
            </h2>

            {localAudioUrl ? (
              <div className="mt-4">
                <AudioPlayer url={localAudioUrl} />
              </div>
            ) : hasCheckedLocalRecording ? (
              <div className="mt-4">
                <AudioPlayer className="opacity-60" />
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  No local recording is available for this session on this device.
                </p>
              </div>
            ) : (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-bg-secondary" />
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => setIsTranscriptOpen((current) => !current)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-white p-5 text-left transition-colors hover:bg-bg-secondary"
            >
              <span className="flex items-center gap-2 font-display text-xl text-text-primary">
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
              <div className="mt-3 rounded-2xl border border-border bg-white p-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                  {feedback.transcript}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <SpeechAnalysisView analysis={feedback.analysis} />
          </div>

          <FlowActions description="Move forward into a fresh session, repeat this prompt, or remove this saved record from your history.">
            <button
              onClick={() => router.push('/setup')}
              className="btn btn-primary w-full justify-center"
            >
              Start a New Session
            </button>

            <button
              onClick={handlePracticeAgain}
              className="btn btn-secondary w-full justify-center"
            >
              <RotateCcw className="h-4 w-4" />
              Practice This Again
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn w-full justify-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete saved feedback
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm leading-relaxed text-red-700">
                  Delete this saved feedback session? The transcript and AI evaluation will be
                  removed from your history. Local recordings stay on this device.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </FlowActions>
        </div>
      </div>
    </div>
  );
}
