'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { Header } from '@/components/Header';
import { DeckSelector } from '@/components/DeckSelector';
import { FrameworkSelector } from '@/components/FrameworkSelector';
import { TimerSelector } from '@/components/TimerSelector';
import { frameworks } from '@/lib/data/frameworks';
import { defaultDeck } from '@/lib/data/defaultTopics';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Deck, PracticeSettings } from '@/lib/types';

const DEFAULT_SETTINGS: PracticeSettings = {
  selectedDeckId: 'default',
  selectedFrameworkIds: frameworks.map((f) => f.id),
  speechDurationSeconds: 180, // 3 minutes
  prepDurationSeconds: 60,
};

export default function SetupPage() {
  const router = useRouter();
  const [customDecks] = useLocalStorage<Deck[]>('customDecks', []);
  const [settings, setSettings] = useLocalStorage<PracticeSettings>(
    'practiceSettings',
    DEFAULT_SETTINGS
  );

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const allDecks = [defaultDeck, ...customDecks];

  const handleFrameworkToggle = (frameworkId: string) => {
    setSettings((prev) => {
      const isSelected = prev.selectedFrameworkIds.includes(frameworkId);
      return {
        ...prev,
        selectedFrameworkIds: isSelected
          ? prev.selectedFrameworkIds.filter((id) => id !== frameworkId)
          : [...prev.selectedFrameworkIds, frameworkId],
      };
    });
  };

  const handleSelectAllFrameworks = () => {
    setSettings((prev) => ({
      ...prev,
      selectedFrameworkIds:
        prev.selectedFrameworkIds.length === frameworks.length
          ? []
          : frameworks.map((f) => f.id),
    }));
  };

  const handleGenerate = () => {
    if (settings.selectedFrameworkIds.length === 0) {
      return;
    }
    router.push('/practice');
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Setup" showBack backHref="/" />

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="mx-auto max-w-md space-y-8 py-6">
          {/* Deck Selection */}
          <DeckSelector
            decks={allDecks}
            selectedDeckId={settings.selectedDeckId}
            onSelect={(deckId) =>
              setSettings((prev) => ({ ...prev, selectedDeckId: deckId }))
            }
          />

          {/* Framework Selection */}
          <FrameworkSelector
            frameworks={frameworks}
            selectedIds={settings.selectedFrameworkIds}
            onToggle={handleFrameworkToggle}
            onSelectAll={handleSelectAllFrameworks}
          />

          {/* Timer Selection */}
          <TimerSelector
            durationSeconds={settings.speechDurationSeconds}
            onDurationChange={(seconds) =>
              setSettings((prev) => ({
                ...prev,
                speechDurationSeconds: seconds,
              }))
            }
          />
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-4">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleGenerate}
            disabled={settings.selectedFrameworkIds.length === 0}
            className="btn btn-primary w-full gap-2 disabled:opacity-50"
          >
            <Play className="h-5 w-5" />
            Generate Topic
          </button>
        </div>
      </div>
    </div>
  );
}
