'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw, Shuffle, Home } from 'lucide-react';
import { Header } from '@/components/Header';
import { Timer } from '@/components/Timer';
import { TopicCard } from '@/components/TopicCard';
import { FrameworkCard } from '@/components/FrameworkCard';
import { frameworks } from '@/lib/data/frameworks';
import { defaultDeck } from '@/lib/data/defaultTopics';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useTimer } from '@/lib/hooks/useTimer';
import { useAudio } from '@/lib/hooks/useAudio';
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
  const [customDecks] = useLocalStorage<Deck[]>('customDecks', []);
  const [settings] = useLocalStorage<PracticeSettings>(
    'practiceSettings',
    DEFAULT_SETTINGS
  );

  const [phase, setPhase] = useState<PracticePhase>('prep');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const { play: playBell } = useAudio({ src: '/bell.mp3' });

  // Get the current deck
  const allDecks = [defaultDeck, ...customDecks];
  const currentDeck =
    allDecks.find((d) => d.id === settings.selectedDeckId) || defaultDeck;

  // Initialize topic and framework
  useEffect(() => {
    setIsHydrated(true);
    generateNew();
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
    },
  });

  // Speech timer
  const speechTimer = useTimer({
    initialSeconds: settings.speechDurationSeconds,
    onComplete: () => {
      setPhase('done');
      playBell();
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
      } else {
        speechTimer.start();
      }
    }
  };

  const handleSkipToSpeech = () => {
    prepTimer.pause();
    setPhase('speech');
    speechTimer.reset(settings.speechDurationSeconds);
    speechTimer.start();
  };

  const handleNewTopic = () => {
    prepTimer.reset(settings.prepDurationSeconds);
    speechTimer.reset(settings.speechDurationSeconds);
    generateNew();
    setTimeout(() => {
      prepTimer.start();
    }, 100);
  };

  const handleTryAgain = () => {
    setPhase('prep');
    prepTimer.reset(settings.prepDurationSeconds);
    speechTimer.reset(settings.speechDurationSeconds);
    prepTimer.start();
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
                onClick={handlePauseResume}
                className="btn btn-secondary flex-1"
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
                className="btn btn-primary flex-1"
              >
                <Play className="h-4 w-4" />
                Start Speaking
              </button>
            </>
          )}

          {phase === 'speech' && (
            <>
              <button
                onClick={handlePauseResume}
                className="btn btn-secondary flex-1"
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
                onClick={handleNewTopic}
                className="btn btn-ghost"
              >
                <Shuffle className="h-4 w-4" />
                New Topic
              </button>
            </>
          )}

          {phase === 'done' && (
            <>
              <button
                onClick={handleTryAgain}
                className="btn btn-secondary flex-1"
              >
                <RotateCcw className="h-4 w-4" />
                Same Topic
              </button>
              <button
                onClick={handleNewTopic}
                className="btn btn-primary flex-1"
              >
                <Shuffle className="h-4 w-4" />
                New Topic
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
