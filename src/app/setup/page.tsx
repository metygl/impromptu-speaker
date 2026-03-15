'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Play } from 'lucide-react';
import { Header } from '@/components/Header';
import { PageIntro } from '@/components/PageIntro';
import { DeckSelector } from '@/components/DeckSelector';
import { FrameworkSelector } from '@/components/FrameworkSelector';
import { TimerSelector } from '@/components/TimerSelector';
import {
  defaultBuiltInDeck,
  getAllDecks,
} from '@/lib/data/decks';
import { frameworks } from '@/lib/data/frameworks';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Deck, PracticeSettings } from '@/lib/types';
import { getCompatibleFrameworks, normalizeSelectedFrameworkIds } from '@/lib/utils';

const DEFAULT_SETTINGS: PracticeSettings = {
  selectedDeckId: defaultBuiltInDeck.id,
  selectedFrameworkIds: defaultBuiltInDeck.allowedFrameworkIds ?? frameworks.map((f) => f.id),
  speechDurationSeconds: 180, // 3 minutes
  prepDurationSeconds: 60,
};

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export default function SetupPage() {
  const router = useRouter();
  const [customDecks, , areDecksHydrated] = useLocalStorage<Deck[]>('customDecks', []);
  const [settings, setSettings, areSettingsHydrated] = useLocalStorage<PracticeSettings>(
    'practiceSettings',
    DEFAULT_SETTINGS
  );
  const isHydrated = areDecksHydrated && areSettingsHydrated;

  const allDecks = getAllDecks(customDecks);
  const currentDeck =
    allDecks.find((deck) => deck.id === settings.selectedDeckId) ?? defaultBuiltInDeck;
  const availableFrameworks = getCompatibleFrameworks(currentDeck, frameworks);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const selectedDeckExists = allDecks.some((deck) => deck.id === settings.selectedDeckId);
    const nextDeck = selectedDeckExists ? currentDeck : defaultBuiltInDeck;
    const nextFrameworkIds = normalizeSelectedFrameworkIds(
      getCompatibleFrameworks(nextDeck, frameworks),
      settings.selectedFrameworkIds
    );

    if (
      nextDeck.id !== settings.selectedDeckId ||
      !arraysEqual(nextFrameworkIds, settings.selectedFrameworkIds)
    ) {
      setSettings((prev) => ({
        ...prev,
        selectedDeckId: nextDeck.id,
        selectedFrameworkIds: nextFrameworkIds,
      }));
    }
  }, [
    allDecks,
    currentDeck,
    isHydrated,
    setSettings,
    settings.selectedDeckId,
    settings.selectedFrameworkIds,
  ]);

  const handleFrameworkToggle = (frameworkId: string) => {
    setSettings((prev) => {
      if (!availableFrameworks.some((framework) => framework.id === frameworkId)) {
        return prev;
      }

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
        prev.selectedFrameworkIds.length === availableFrameworks.length
          ? []
          : availableFrameworks.map((framework) => framework.id),
    }));
  };

  const handleDeckSelect = (deckId: string) => {
    const nextDeck = allDecks.find((deck) => deck.id === deckId) ?? defaultBuiltInDeck;
    const nextFrameworks = getCompatibleFrameworks(nextDeck, frameworks);
    const nextSelectedIds = normalizeSelectedFrameworkIds(
      nextFrameworks,
      settings.selectedFrameworkIds
    );

    setSettings((prev) => ({
      ...prev,
      selectedDeckId: nextDeck.id,
      selectedFrameworkIds: nextSelectedIds,
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
      <Header title="Setup" />

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="mx-auto max-w-md space-y-8 py-6">
          <PageIntro
            eyebrow="Practice flow"
            title="Set up your next round"
            description="Choose a goal-focused deck, keep the compatible frameworks you want, and set your speaking time before generating a topic."
          />

          {/* Deck Selection */}
          <DeckSelector
            decks={allDecks}
            selectedDeckId={settings.selectedDeckId}
            onSelect={handleDeckSelect}
          />

          {/* Framework Selection */}
          <FrameworkSelector
            frameworks={availableFrameworks}
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
            Generate Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
