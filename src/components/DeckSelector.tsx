'use client';

import { ChevronDown, Layers } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { Deck } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckId: string;
  onSelect: (deckId: string) => void;
  className?: string;
}

export function DeckSelector({
  decks,
  selectedDeckId,
  onSelect,
  className,
}: DeckSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <SectionCard
        eyebrow="Step 1"
        title="Topic deck"
        description="Choose the prompt pool you want to draw from for this round."
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-bg-secondary/60 p-4 text-left transition-colors hover:border-border-strong hover:bg-bg-secondary"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Layers className="h-5 w-5 text-text-secondary" />
            </div>
            <div>
              <div className="font-medium text-text-primary">{selectedDeck.name}</div>
              <div className="text-sm text-text-secondary">
                {selectedDeck.objectiveLabel
                  ? `${selectedDeck.objectiveLabel} · ${selectedDeck.topics.length} prompts`
                  : `${selectedDeck.topics.length} topics`}
              </div>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-text-secondary transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </SectionCard>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-2xl border border-border bg-white py-2 shadow-lg">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                onSelect(deck.id);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-secondary',
                deck.id === selectedDeckId && 'bg-accent-subtle'
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary">
                <Layers className="h-4 w-4 text-text-secondary" />
              </div>
              <div>
                <div
                  className={cn(
                    'font-medium',
                    deck.id === selectedDeckId
                      ? 'text-accent'
                      : 'text-text-primary'
                  )}
                >
                  {deck.name}
                </div>
                <div className="text-xs text-text-secondary">
                  {deck.objectiveLabel
                    ? `${deck.objectiveLabel} · ${deck.topics.length} prompts`
                    : `${deck.topics.length} topics`}
                </div>
                {deck.description && (
                  <div className="mt-1 max-w-[18rem] text-xs leading-relaxed text-text-secondary/80">
                    {deck.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
