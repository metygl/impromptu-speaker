'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Layers, Trash2, ChevronRight, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { defaultDeck, generateDeckId } from '@/lib/data/defaultTopics';
import { Deck } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function DecksPage() {
  const [customDecks, setCustomDecks] = useLocalStorage<Deck[]>('customDecks', []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: generateDeckId(),
      name: newDeckName.trim(),
      topics: [],
    };

    setCustomDecks((prev) => [...prev, newDeck]);
    setNewDeckName('');
    setShowNewDeckModal(false);
  };

  const handleDeleteDeck = (deckId: string) => {
    setCustomDecks((prev) => prev.filter((d) => d.id !== deckId));
    setDeckToDelete(null);
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const allDecks = [defaultDeck, ...customDecks];

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Topic Decks" showBack backHref="/" />

      <div className="flex-1 px-4 pb-24">
        <div className="mx-auto max-w-md py-6">
          {/* Deck list */}
          <div className="space-y-3">
            {allDecks.map((deck) => (
              <div
                key={deck.id}
                className="card flex items-center justify-between p-4"
              >
                <Link
                  href={`/decks/${deck.id}`}
                  className="flex flex-1 items-center gap-3"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      deck.isDefault ? 'bg-accent/10' : 'bg-bg-secondary'
                    )}
                  >
                    <Layers
                      className={cn(
                        'h-5 w-5',
                        deck.isDefault ? 'text-accent' : 'text-text-secondary'
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-text-primary">
                      {deck.name}
                      {deck.isDefault && (
                        <Lock className="h-3 w-3 text-text-secondary" />
                      )}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {deck.topics.length} topics
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {!deck.isDefault && (
                    <button
                      onClick={() => setDeckToDelete(deck.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/decks/${deck.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Add new deck button */}
          <button
            onClick={() => setShowNewDeckModal(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <Plus className="h-5 w-5" />
            Create New Deck
          </button>
        </div>
      </div>

      {/* New Deck Modal */}
      {showNewDeckModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4"
          onClick={() => setShowNewDeckModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-text-primary">
              Create New Deck
            </h2>
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Deck name"
              className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
              autoFocus
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowNewDeckModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim()}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deckToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4"
          onClick={() => setDeckToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-text-primary">
              Delete Deck?
            </h2>
            <p className="mt-2 text-text-secondary">
              This will permanently delete this deck and all its topics.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setDeckToDelete(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDeck(deckToDelete)}
                className="btn flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
