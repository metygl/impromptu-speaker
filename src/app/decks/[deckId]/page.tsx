'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { defaultDeck, generateTopicId } from '@/lib/data/defaultTopics';
import { Deck, Topic } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [customDecks, setCustomDecks] = useLocalStorage<Deck[]>('customDecks', []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [newTopicText, setNewTopicText] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Find the deck
  const isDefaultDeck = deckId === 'default';
  const deck = isDefaultDeck
    ? defaultDeck
    : customDecks.find((d) => d.id === deckId);

  // Redirect if deck not found
  useEffect(() => {
    if (isHydrated && !deck) {
      router.push('/decks');
    }
  }, [isHydrated, deck, router]);

  const handleAddTopic = () => {
    if (!newTopicText.trim() || isDefaultDeck) return;

    const newTopic: Topic = {
      id: generateTopicId(),
      text: newTopicText.trim(),
    };

    setCustomDecks((prev) =>
      prev.map((d) =>
        d.id === deckId ? { ...d, topics: [...d.topics, newTopic] } : d
      )
    );
    setNewTopicText('');
  };

  const handleDeleteTopic = (topicId: string) => {
    if (isDefaultDeck) return;

    setCustomDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, topics: d.topics.filter((t) => t.id !== topicId) }
          : d
      )
    );
  };

  const handleStartEditing = (topic: Topic) => {
    if (isDefaultDeck) return;
    setEditingTopicId(topic.id);
    setEditingText(topic.text);
  };

  const handleSaveEdit = () => {
    if (!editingText.trim() || !editingTopicId || isDefaultDeck) return;

    setCustomDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? {
              ...d,
              topics: d.topics.map((t) =>
                t.id === editingTopicId ? { ...t, text: editingText.trim() } : t
              ),
            }
          : d
      )
    );
    setEditingTopicId(null);
    setEditingText('');
  };

  if (!isHydrated || !deck) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title={deck.name} showBack backHref="/decks" />

      <div className="flex-1 px-4 pb-24">
        <div className="mx-auto max-w-md py-6">
          {/* Read-only notice for default deck */}
          {isDefaultDeck && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-bg-secondary p-3 text-sm text-text-secondary">
              <Lock className="h-4 w-4" />
              This is the default deck and cannot be edited.
            </div>
          )}

          {/* Topics list */}
          <div className="space-y-2">
            {deck.topics.map((topic, index) => (
              <div
                key={topic.id}
                className={cn(
                  'card flex items-start gap-3 p-4',
                  !isDefaultDeck && 'cursor-pointer hover:bg-bg-secondary/50'
                )}
                onClick={() => handleStartEditing(topic)}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-bg-secondary text-xs font-medium text-text-secondary">
                  {index + 1}
                </span>

                {editingTopicId === topic.id ? (
                  <div className="flex-1">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full resize-none rounded-lg border border-accent bg-white p-2 text-sm text-text-primary focus:outline-none"
                      rows={2}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTopicId(null);
                        }}
                        className="text-xs text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                        className="text-xs font-medium text-accent hover:text-accent-hover"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-sm text-text-primary">
                      {topic.text}
                    </p>
                    {!isDefaultDeck && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTopic(topic.id);
                        }}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {deck.topics.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-text-secondary">No topics yet</p>
              <p className="mt-1 text-sm text-text-secondary/70">
                Add your first topic below
              </p>
            </div>
          )}

          {/* Add topic input */}
          {!isDefaultDeck && (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicText}
                  onChange={(e) => setNewTopicText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTopic();
                    }
                  }}
                  placeholder="Add a new topic..."
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
                />
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopicText.trim()}
                  className="btn btn-primary px-4 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
