'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Square,
  Lock,
  Save,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Timer } from '@/components/Timer';
import { TopicCard } from '@/components/TopicCard';
import { FrameworkCard } from '@/components/FrameworkCard';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { SaveRecordingModal } from '@/components/SaveRecordingModal';
import { useAuth } from '@/components/AuthProvider';
import { defaultBuiltInDeck, getAllDecks } from '@/lib/data/decks';
import { frameworks } from '@/lib/data/frameworks';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useTimer } from '@/lib/hooks/useTimer';
import { useAudio } from '@/lib/hooks/useAudio';
import { useRecording } from '@/lib/hooks/useRecording';
import { useVoiceRecordings } from '@/lib/hooks/useVoiceRecordings';
import {
  getCompatibleFrameworksForTopic,
  getRandomTopic,
  getRandomFrameworkFromList,
  normalizeSelectedFrameworkIds,
} from '@/lib/utils';
import { Deck, PracticeSettings, Topic, Framework, PracticePhase } from '@/lib/types';

const DEFAULT_SETTINGS: PracticeSettings = {
  selectedDeckId: defaultBuiltInDeck.id,
  selectedFrameworkIds: defaultBuiltInDeck.allowedFrameworkIds ?? frameworks.map((f) => f.id),
  speechDurationSeconds: 180,
  prepDurationSeconds: 60,
};

function buildDefaultRecordingName(topicText: string, frameworkName: string): string {
  const trimmedTopic = topicText.trim().replace(/\s+/g, ' ');
  const shortTopic =
    trimmedTopic.length > 48 ? `${trimmedTopic.slice(0, 45).trimEnd()}...` : trimmedTopic;

  return `${frameworkName} - ${shortTopic}`;
}

export default function PracticePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [customDecks] = useLocalStorage<Deck[]>('customDecks', []);
  const [settings] = useLocalStorage<PracticeSettings>('practiceSettings', DEFAULT_SETTINGS);
  const { saveRecording, isLoading: isRecordingsLoading, error: recordingsError } = useVoiceRecordings();

  const [phase, setPhase] = useState<PracticePhase>('prep');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasStartedRecordingRef = useRef(false);

  const { play: playBell } = useAudio({ src: '/bell.mp3' });

  const isAiEnabled = Boolean(user);

  const recording = useRecording({
    onComplete: (blob, duration) => {
      setRecordingBlob(blob);
      setRecordingDuration(duration);
      setSaveError(null);
      setIsSaveModalOpen(true);
    },
  });

  const allDecks = getAllDecks(customDecks);
  const currentDeck =
    allDecks.find((deck) => deck.id === settings.selectedDeckId) ?? defaultBuiltInDeck;

  const resetRecordingState = useCallback(() => {
    setRecordingBlob(null);
    setRecordingDuration(0);
    setIsSaveModalOpen(false);
    setSaveError(null);
  }, []);

  const generateNew = useCallback(() => {
    const newTopic = getRandomTopic(currentDeck);
    const compatibleFrameworks = getCompatibleFrameworksForTopic(
      currentDeck,
      newTopic,
      frameworks
    );
    const selectedFrameworkIds = normalizeSelectedFrameworkIds(
      compatibleFrameworks,
      settings.selectedFrameworkIds
    );
    const newFramework = getRandomFrameworkFromList(
      compatibleFrameworks,
      selectedFrameworkIds
    );

    setTopic(newTopic);
    setFramework(newFramework);
    setPhase('prep');
    resetRecordingState();
  }, [currentDeck, resetRecordingState, settings.selectedFrameworkIds]);

  const beginSpeechRecording = useCallback(() => {
    if (!isAiEnabled || hasStartedRecordingRef.current) {
      return;
    }

    hasStartedRecordingRef.current = true;
    void recording.start();
  }, [isAiEnabled, recording]);

  useEffect(() => {
    setIsHydrated(true);

    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topicId');
    const topicText = params.get('topicText');
    const frameworkId = params.get('frameworkId');

    if (topicId && topicText && frameworkId) {
      setTopic({ id: topicId, text: topicText });
      const specifiedFramework = frameworks.find((f) => f.id === frameworkId);
      if (specifiedFramework) {
        setFramework(specifiedFramework);
      } else {
        generateNew();
      }
    } else {
      generateNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!recordingsError) return;

    setSaveError(recordingsError);
  }, [recordingsError]);

  const prepTimer = useTimer({
    initialSeconds: settings.prepDurationSeconds,
    onComplete: () => {
      setPhase('speech');
      speechTimer.reset(settings.speechDurationSeconds);
      speechTimer.start();
      beginSpeechRecording();
    },
  });

  const speechTimer = useTimer({
    initialSeconds: settings.speechDurationSeconds,
    onComplete: async () => {
      setPhase('done');
      playBell();
      if (recording.isRecording) {
        await recording.stop();
      }
    },
  });

  useEffect(() => {
    if (isHydrated && topic && framework) {
      prepTimer.start();
    }
  }, [framework, isHydrated, prepTimer, topic]);

  const handlePauseResume = () => {
    if (phase === 'prep') {
      if (prepTimer.isRunning) {
        prepTimer.pause();
      } else {
        prepTimer.start();
      }
      return;
    }

    if (phase !== 'speech') {
      return;
    }

    if (speechTimer.isRunning) {
      speechTimer.pause();
      if (recording.isRecording && !recording.isPaused) {
        recording.pause();
      }
    } else {
      speechTimer.start();
      if (recording.isRecording && recording.isPaused) {
        recording.resume();
      }
    }
  };

  const handleEndEarly = async () => {
    speechTimer.pause();
    setPhase('done');
    playBell();

    if (recording.isRecording) {
      await recording.stop();
    }
  };

  const handleSkipToSpeech = () => {
    prepTimer.pause();
    setPhase('speech');
    speechTimer.reset(settings.speechDurationSeconds);
    speechTimer.start();
    beginSpeechRecording();
  };

  const handleNewTopic = async () => {
    if (recording.isRecording) {
      await recording.stop();
    }

    hasStartedRecordingRef.current = false;
    prepTimer.reset(settings.prepDurationSeconds);
    speechTimer.reset(settings.speechDurationSeconds);
    generateNew();

    setTimeout(() => {
      prepTimer.start();
    }, 100);
  };

  const handleTryAgain = async () => {
    if (recording.isRecording) {
      await recording.stop();
    }

    hasStartedRecordingRef.current = false;
    resetRecordingState();
    setPhase('prep');
    prepTimer.reset(settings.prepDurationSeconds);
    speechTimer.reset(settings.speechDurationSeconds);
    prepTimer.start();
  };

  const handleSaveRecording = async (name: string) => {
    if (!recordingBlob || !topic || !framework) {
      return;
    }

    const defaultName = buildDefaultRecordingName(topic.text, framework.name);

    try {
      const recordingId = await saveRecording(recordingBlob, {
        name: name.trim() || defaultName,
        topicId: topic.id,
        topicText: topic.text,
        frameworkId: framework.id,
        frameworkName: framework.name,
        speechDurationSetting: settings.speechDurationSeconds,
        durationSeconds: recordingDuration,
      });

      setIsSaveModalOpen(false);
      router.push(`/recordings/${recordingId}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save recording');
      throw error;
    }
  };

  const handleDiscardRecording = () => {
    setIsSaveModalOpen(false);
    setSaveError(null);
    setRecordingBlob(null);
    setRecordingDuration(0);
  };

  if (!isHydrated || !topic || !framework) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const currentTimer = phase === 'prep' ? prepTimer : speechTimer;
  const isRunning = phase === 'prep' ? prepTimer.isRunning : speechTimer.isRunning;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        title={phase === 'done' ? 'Complete!' : undefined}
      />

      <div className="flex flex-1 flex-col px-4 pb-32">
        <div className="mx-auto w-full max-w-md flex-1">
          <TopicCard topic={topic} className="mt-4" />

          {!isAiEnabled ? (
            <div className="mt-4 rounded-2xl border border-border bg-accent-subtle p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                <div>
                  <p className="font-medium text-text-primary">AI feedback is sign-in only</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    You can practice anonymously. Sign in if you want local recording,
                    transcript analysis, and saved feedback history.
                  </p>
                  <Link href="/login" className="mt-3 inline-flex text-sm font-medium text-accent">
                    Sign in to enable feedback
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {phase === 'speech' && recording.isRecording ? (
            <div className="flex justify-center">
              <RecordingIndicator
                duration={recording.duration}
                isRecording={recording.isRecording}
                isPaused={recording.isPaused}
              />
            </div>
          ) : null}

          <div className="my-8 flex justify-center">
            <Timer
              remainingSeconds={currentTimer.remainingSeconds}
              totalSeconds={
                phase === 'prep' ? settings.prepDurationSeconds : settings.speechDurationSeconds
              }
              isRunning={isRunning}
              phase={phase === 'done' ? 'done' : phase}
            />
          </div>

          <FrameworkCard framework={framework} />

          {recording.error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {recording.error}
            </div>
          ) : null}

          {phase === 'done' && isAiEnabled ? (
            <div className="mt-6 space-y-4 rounded-3xl border border-border bg-white p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                  Review Flow
                </p>
                <h2 className="mt-2 font-display text-2xl text-text-primary">
                  Save this local recording
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Name the recording, save it locally on this device, and continue to the review
                  page for playback and AI feedback.
                </p>
              </div>

              {recordingBlob ? (
                <button
                  onClick={() => {
                    setSaveError(null);
                    setIsSaveModalOpen(true);
                  }}
                  disabled={isRecordingsLoading}
                  className="btn btn-primary w-full justify-center"
                >
                  <Save className="h-4 w-4" />
                  {isRecordingsLoading ? 'Preparing local storage...' : 'Name & Save Recording'}
                </button>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  No local recording was captured for this session, so there is nothing to save.
                </div>
              )}

              {saveError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              {recordingDuration > 0 ? (
                <p className="text-xs text-text-secondary">
                  Recorded locally: {recordingDuration} seconds
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {phase === 'done' ? (
        <SaveRecordingModal
          isOpen={isSaveModalOpen}
          topicText={topic.text}
          frameworkName={framework.name}
          duration={recordingDuration}
          defaultName={buildDefaultRecordingName(topic.text, framework.name)}
          error={saveError}
          onSave={handleSaveRecording}
          onDiscard={handleDiscardRecording}
        />
      ) : null}

      <div className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-md items-center justify-center gap-3">
          {phase === 'prep' ? (
            <>
              <button
                onClick={handleNewTopic}
                className="btn btn-secondary"
                title="New topic & framework"
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                onClick={handlePauseResume}
                className="btn btn-secondary flex-1 whitespace-nowrap"
              >
                {prepTimer.isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                )}
              </button>
              <button
                onClick={handleSkipToSpeech}
                className="btn btn-primary flex-1 whitespace-nowrap"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            </>
          ) : null}

          {phase === 'speech' ? (
            <>
              <button
                onClick={handlePauseResume}
                className="btn btn-secondary flex-1 whitespace-nowrap"
              >
                {speechTimer.isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                )}
              </button>
              <button
                onClick={handleEndEarly}
                className="btn btn-primary flex-1 whitespace-nowrap"
              >
                <Square className="h-4 w-4" />
                End
              </button>
            </>
          ) : null}

          {phase === 'done' ? (
            <>
              <button
                onClick={handleTryAgain}
                disabled={isSaveModalOpen}
                className="btn btn-secondary flex-1 whitespace-nowrap disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={handleNewTopic}
                disabled={isSaveModalOpen}
                className="btn btn-primary flex-1 whitespace-nowrap disabled:opacity-50"
              >
                <Shuffle className="h-4 w-4" />
                New
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
