'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Shuffle, Home, Square } from 'lucide-react';
import { Header } from '@/components/Header';
import { Timer } from '@/components/Timer';
import { TopicCard } from '@/components/TopicCard';
import { FrameworkCard } from '@/components/FrameworkCard';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { SaveRecordingModal } from '@/components/SaveRecordingModal';
import { frameworks } from '@/lib/data/frameworks';
import { defaultDeck } from '@/lib/data/defaultTopics';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useTimer } from '@/lib/hooks/useTimer';
import { useAudio } from '@/lib/hooks/useAudio';
import { useRecording } from '@/lib/hooks/useRecording';
import { useVoiceRecordings } from '@/lib/hooks/useVoiceRecordings';
import { getRandomTopic, getRandomFrameworkFromList } from '@/lib/utils';
import { Deck, PracticeSettings, Topic, Framework, PracticePhase } from '@/lib/types';

const DEFAULT_SETTINGS: PracticeSettings = {
  selectedDeckId: 'default',
  selectedFrameworkIds: frameworks.map((f) => f.id),
  speechDurationSeconds: 180,
  prepDurationSeconds: 60,
};

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customDecks] = useLocalStorage<Deck[]>('customDecks', []);
  const [settings] = useLocalStorage<PracticeSettings>(
    'practiceSettings',
    DEFAULT_SETTINGS
  );

  const [phase, setPhase] = useState<PracticePhase>('prep');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Recording state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const hasStartedRecordingRef = useRef(false);
  const [untitledCounter, setUntitledCounter] = useLocalStorage<number>('untitledRecordingCounter', 1);

  const { play: playBell } = useAudio({ src: '/bell.mp3' });

  // Recording hooks
  const recording = useRecording({
    onComplete: (blob, duration) => {
      setRecordingBlob(blob);
      setRecordingDuration(duration);
    },
  });

  const { saveRecording } = useVoiceRecordings();

  // Show save modal when recording blob is set
  useEffect(() => {
    if (recordingBlob) {
      setShowSaveModal(true);
    }
  }, [recordingBlob]);

  // Get the current deck
  const allDecks = [defaultDeck, ...customDecks];
  const currentDeck =
    allDecks.find((d) => d.id === settings.selectedDeckId) || defaultDeck;

  // Initialize topic and framework (check URL params for "Practice Again" feature)
  useEffect(() => {
    setIsHydrated(true);

    // Check for URL params (from "Practice Again" button)
    const topicId = searchParams.get('topicId');
    const topicText = searchParams.get('topicText');
    const frameworkId = searchParams.get('frameworkId');

    if (topicId && topicText && frameworkId) {
      // Use the specified topic and framework
      setTopic({ id: topicId, text: topicText });
      const specifiedFramework = frameworks.find((f) => f.id === frameworkId);
      if (specifiedFramework) {
        setFramework(specifiedFramework);
      } else {
        // Fallback to random if framework not found
        generateNew();
      }
    } else {
      // Generate random topic and framework
      generateNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateNew = useCallback(() => {
    const newTopic = getRandomTopic(currentDeck);
    const selectedFrameworks = frameworks.filter((f) =>
      settings.selectedFrameworkIds.includes(f.id)
    );
    const newFramework = getRandomFrameworkFromList(
      selectedFrameworks.length > 0 ? selectedFrameworks : frameworks,
      settings.selectedFrameworkIds
    );

    setTopic(newTopic);
    setFramework(newFramework);
    setPhase('prep');
  }, [currentDeck, settings.selectedFrameworkIds]);

  // Prep timer
  const prepTimer = useTimer({
    initialSeconds: settings.prepDurationSeconds,
    onComplete: () => {
      setPhase('speech');
      speechTimer.reset(settings.speechDurationSeconds);
      speechTimer.start();
      // Start recording when speech phase begins
      if (!hasStartedRecordingRef.current) {
        hasStartedRecordingRef.current = true;
        recording.start();
      }
    },
  });

  // Speech timer
  const speechTimer = useTimer({
    initialSeconds: settings.speechDurationSeconds,
    onComplete: async () => {
      setPhase('done');
      playBell();
      // Stop recording - auto-save will handle saving
      if (recording.isRecording) {
        await recording.stop();
      }
    },
  });

  // Start prep timer on mount
  useEffect(() => {
    if (isHydrated && topic && framework) {
      prepTimer.start();
    }
  }, [isHydrated, topic, framework]);

  const handlePauseResume = () => {
    if (phase === 'prep') {
      if (prepTimer.isRunning) {
        prepTimer.pause();
      } else {
        prepTimer.start();
      }
    } else if (phase === 'speech') {
      if (speechTimer.isRunning) {
        speechTimer.pause();
        // Pause recording when timer is paused
        if (recording.isRecording && !recording.isPaused) {
          recording.pause();
        }
      } else {
        speechTimer.start();
        // Resume recording when timer resumes
        if (recording.isRecording && recording.isPaused) {
          recording.resume();
        }
      }
    }
  };

  const handleEndEarly = async () => {
    speechTimer.pause();
    setPhase('done');
    playBell();
    // Stop recording - auto-save will handle saving
    if (recording.isRecording) {
      await recording.stop();
    }
  };

  const handleSkipToSpeech = () => {
    prepTimer.pause();
    setPhase('speech');
    speechTimer.reset(settings.speechDurationSeconds);
    speechTimer.start();
    // Start recording when skipping to speech
    if (!hasStartedRecordingRef.current) {
      hasStartedRecordingRef.current = true;
      recording.start();
    }
  };

  const handleNewTopic = async () => {
    // Stop any ongoing recording - will auto-save if there's a blob
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
    // Reset recording state for new attempt
    if (recording.isRecording) {
      await recording.stop();
    }
    hasStartedRecordingRef.current = false;

    setPhase('prep');
    prepTimer.reset(settings.prepDurationSeconds);
    speechTimer.reset(settings.speechDurationSeconds);
    prepTimer.start();
  };

  // Handle saving the recording
  const handleSaveRecording = async (name: string) => {
    if (!recordingBlob || !topic || !framework) return;

    // Use provided name or default to Untitled-#
    const recordingName = name.trim() || `Untitled-${untitledCounter}`;

    await saveRecording(recordingBlob, {
      name: recordingName,
      topicId: topic.id,
      topicText: topic.text,
      frameworkId: framework.id,
      frameworkName: framework.name,
      speechDurationSetting: settings.speechDurationSeconds,
      durationSeconds: recordingDuration,
    });

    // Only increment counter if we used the default name
    if (!name.trim()) {
      setUntitledCounter(untitledCounter + 1);
    }

    setShowSaveModal(false);
    setRecordingBlob(null);
  };

  // Handle discarding the recording
  const handleDiscardRecording = () => {
    setShowSaveModal(false);
    setRecordingBlob(null);
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
        showBack
        onBack={() => router.push('/setup')}
      />

      <div className="flex flex-1 flex-col px-4 pb-32">
        <div className="mx-auto w-full max-w-md flex-1">
          {/* Topic Card */}
          <TopicCard topic={topic} className="mt-4" />

          {/* Recording indicator */}
          {phase === 'speech' && recording.isRecording && (
            <div className="flex justify-center">
              <RecordingIndicator
                duration={recording.duration}
                isRecording={recording.isRecording}
                isPaused={recording.isPaused}
              />
            </div>
          )}

          {/* Timer */}
          <div className="my-8 flex justify-center">
            <Timer
              remainingSeconds={currentTimer.remainingSeconds}
              totalSeconds={
                phase === 'prep'
                  ? settings.prepDurationSeconds
                  : settings.speechDurationSeconds
              }
              isRunning={isRunning}
              phase={phase === 'done' ? 'done' : phase}
            />
          </div>

          {/* Framework Card */}
          <FrameworkCard framework={framework} />
        </div>
      </div>

      {/* Fixed bottom controls */}
      <div className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-md items-center justify-center gap-3">
          {phase === 'prep' && (
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
          )}

          {phase === 'speech' && (
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
          )}

          {phase === 'done' && (
            <>
              <button
                onClick={handleTryAgain}
                className="btn btn-secondary flex-1 whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={handleNewTopic}
                className="btn btn-primary flex-1 whitespace-nowrap"
              >
                <Shuffle className="h-4 w-4" />
                New
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save Recording Modal */}
      {topic && framework && (
        <SaveRecordingModal
          isOpen={showSaveModal}
          topicText={topic.text}
          frameworkName={framework.name}
          duration={recordingDuration}
          defaultName={`Untitled-${untitledCounter}`}
          onSave={handleSaveRecording}
          onDiscard={handleDiscardRecording}
        />
      )}
    </div>
  );
}
