'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Layers,
  Lock,
  Mic,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { DeckFrameworkPicker } from '@/components/DeckFrameworkPicker';
import { FlowActions } from '@/components/FlowActions';
import { Header } from '@/components/Header';
import { PageIntro } from '@/components/PageIntro';
import { SectionCard } from '@/components/SectionCard';
import { frameworks } from '@/lib/data/frameworks';
import { generateTopicId } from '@/lib/data/decks';
import { useDeckLibrary } from '@/lib/hooks/useDeckLibrary';
import { Deck, Topic } from '@/lib/types';
import { cn, getCompatibleFrameworksForTopic } from '@/lib/utils';

function arraysMatch(left: string[], right: string[]) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

function moveItem<T>(items: T[], startIndex: number, endIndex: number): T[] {
  const nextItems = [...items];
  const [item] = nextItems.splice(startIndex, 1);
  nextItems.splice(endIndex, 0, item);
  return nextItems;
}

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const deckId = params.deckId as string;
  const { decks, error, isHydrated, isSaving, resetBuiltInDeck, saveDeck } = useDeckLibrary();
  const [newTopicText, setNewTopicText] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [pageError, setPageError] = useState<string | null>(null);

  const deck = decks.find((entry) => entry.id === deckId);
  const isEditable = Boolean(deck && (!deck.isBuiltIn || user));
  const allFrameworkIds = useMemo(() => frameworks.map((framework) => framework.id), []);

  useEffect(() => {
    if (isHydrated && !deck) {
      router.push('/decks');
    }
  }, [deck, isHydrated, router]);

  const deckFrameworkIds = useMemo(() => {
    if (!deck) {
      return [];
    }

    return deck.allowedFrameworkIds ?? allFrameworkIds;
  }, [allFrameworkIds, deck]);

  const frameworksForDeckPage = useMemo(() => {
    const selectedIds = new Set(deckFrameworkIds);

    return [...frameworks].sort((left, right) => {
      const leftSelected = selectedIds.has(left.id);
      const rightSelected = selectedIds.has(right.id);

      if (leftSelected !== rightSelected) {
        return leftSelected ? -1 : 1;
      }

      const leftSuggested = Boolean(deck?.objectiveId && left.objectiveIds?.includes(deck.objectiveId));
      const rightSuggested = Boolean(
        deck?.objectiveId && right.objectiveIds?.includes(deck.objectiveId)
      );

      if (leftSuggested !== rightSuggested) {
        return leftSuggested ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
  }, [deck, deckFrameworkIds]);

  const narrowedTopicIds = useMemo(() => {
    if (!deck) {
      return new Set<string>();
    }

    return new Set(
      deck.topics
        .map((topic) => {
          const compatibleIds = getCompatibleFrameworksForTopic(deck, topic, frameworks).map(
            (framework) => framework.id
          );

          return arraysMatch(compatibleIds, deckFrameworkIds) ? null : topic.id;
        })
        .filter((value): value is string => value !== null)
    );
  }, [deck, deckFrameworkIds]);

  const persistDeck = async (nextDeck: Deck) => {
    try {
      setPageError(null);
      await saveDeck(nextDeck);
    } catch (nextError) {
      setPageError(nextError instanceof Error ? nextError.message : 'Failed to save deck');
    }
  };

  const handleAddTopic = async () => {
    if (!deck || !isEditable || !newTopicText.trim()) {
      return;
    }

    const newTopic: Topic = {
      id: generateTopicId(),
      text: newTopicText.trim(),
    };

    await persistDeck({
      ...deck,
      topics: [...deck.topics, newTopic],
    });
    setNewTopicText('');
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!deck || !isEditable) {
      return;
    }

    await persistDeck({
      ...deck,
      topics: deck.topics.filter((topic) => topic.id !== topicId),
    });
  };

  const handleStartEditing = (topic: Topic) => {
    if (!isEditable) {
      return;
    }

    setEditingTopicId(topic.id);
    setEditingText(topic.text);
  };

  const handleSaveEdit = async () => {
    if (!deck || !isEditable || !editingTopicId || !editingText.trim()) {
      return;
    }

    await persistDeck({
      ...deck,
      topics: deck.topics.map((topic) =>
        topic.id === editingTopicId ? { ...topic, text: editingText.trim() } : topic
      ),
    });
    setEditingTopicId(null);
    setEditingText('');
  };

  const handleMoveTopic = async (startIndex: number, endIndex: number) => {
    if (!deck || !isEditable || endIndex < 0 || endIndex >= deck.topics.length) {
      return;
    }

    await persistDeck({
      ...deck,
      topics: moveItem(deck.topics, startIndex, endIndex),
    });
  };

  const handleResetBuiltInDeck = async () => {
    if (!deck || !deck.isBuiltIn) {
      return;
    }

    try {
      setPageError(null);
      await resetBuiltInDeck(deck.id);
      setEditingTopicId(null);
      setEditingText('');
    } catch (nextError) {
      setPageError(nextError instanceof Error ? nextError.message : 'Failed to reset deck');
    }
  };

  const handleToggleDeckFramework = async (frameworkId: string) => {
    if (!deck || !isEditable) {
      return;
    }

    const isSelected = deckFrameworkIds.includes(frameworkId);

    if (isSelected && deckFrameworkIds.length === 1) {
      setPageError('Each deck needs at least one framework.');
      return;
    }

    const nextSelectedIds = isSelected
      ? deckFrameworkIds.filter((id) => id !== frameworkId)
      : allFrameworkIds.filter((id) => id === frameworkId || deckFrameworkIds.includes(id));

    await persistDeck({
      ...deck,
      allowedFrameworkIds: nextSelectedIds,
    });
  };

  const handleUseAllFrameworks = async () => {
    if (!deck || !isEditable) {
      return;
    }

    await persistDeck({
      ...deck,
      allowedFrameworkIds: [...allFrameworkIds],
    });
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
      <Header title={deck.name} />

      <div className="flex-1 px-4 pb-24">
        <div className="mx-auto max-w-md py-6">
          <PageIntro
            eyebrow={deck.isBuiltIn ? 'Built in' : 'Custom deck'}
            title={deck.name}
            description={`${deck.topics.length} prompt${deck.topics.length === 1 ? '' : 's'} available.${deck.isBuiltIn ? user ? ' Changes sync to your account and can be reset to the seeded default.' : ' Sign in to customize this built-in deck for your account.' : ' Add, edit, remove, or reorder prompts below.'}${deck.description ? ` ${deck.description}` : ''}`}
          />

          {deck.isBuiltIn && user ? (
            <button
              onClick={() => void handleResetBuiltInDeck()}
              disabled={isSaving}
              className="mt-6 btn btn-secondary w-full justify-center disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </button>
          ) : null}

          {deck.isBuiltIn && !user ? (
            <div className="mb-4 mt-6 rounded-2xl border border-border bg-bg-secondary p-4 text-sm text-text-secondary">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-primary">Sign in to customize this deck</p>
                  <p className="mt-1 leading-relaxed">
                    Signed-in users can add, edit, delete, reorder, and reset built-in prompts for
                    their own account.
                  </p>
                  <Link href="/login" className="mt-3 inline-flex font-medium text-accent">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {pageError || error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {pageError ?? error}
            </div>
          ) : null}

          <SectionCard
            className="mt-6"
            eyebrow="Prompts"
            title="Practice prompts"
            description={
              isEditable
                ? 'Edit the prompt list for this deck. Framework selection happens once for the whole deck below.'
                : 'These are the prompts included in this deck.'
            }
          >
            <div className="space-y-2">
              {deck.topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className={cn(
                    'rounded-2xl border border-border bg-white p-4',
                    isEditable && 'cursor-pointer transition-colors hover:bg-bg-secondary/50'
                  )}
                  onClick={() => handleStartEditing(topic)}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-bg-secondary text-xs font-medium text-text-secondary">
                      {index + 1}
                    </span>

                    {editingTopicId === topic.id ? (
                      <div className="flex-1">
                        <textarea
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                          className="w-full resize-none rounded-lg border border-accent bg-white p-2 text-sm text-text-primary focus:outline-none"
                          rows={2}
                          autoFocus
                          onClick={(event) => event.stopPropagation()}
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingTopicId(null);
                            }}
                            className="text-xs text-text-secondary hover:text-text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleSaveEdit();
                            }}
                            className="text-xs font-medium text-accent hover:text-accent-hover"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary">{topic.text}</p>
                          {narrowedTopicIds.has(topic.id) ? (
                            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                              This prompt uses a narrower framework set during practice.
                            </p>
                          ) : null}
                        </div>
                        {isEditable ? (
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveTopic(index, index - 1);
                              }}
                              disabled={index === 0 || isSaving}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary disabled:opacity-40"
                              aria-label={`Move prompt ${index + 1} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleMoveTopic(index, index + 1);
                              }}
                              disabled={index === deck.topics.length - 1 || isSaving}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary disabled:opacity-40"
                              aria-label={`Move prompt ${index + 1} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteTopic(topic.id);
                              }}
                              disabled={isSaving}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                              aria-label={`Delete prompt ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {deck.topics.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-text-secondary">No prompts yet</p>
                <p className="mt-1 text-sm text-text-secondary/70">
                  {isEditable ? 'Add your first prompt below.' : 'Sign in to start customizing this deck.'}
                </p>
              </div>
            ) : null}

            {isEditable ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicText}
                  onChange={(event) => setNewTopicText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void handleAddTopic();
                    }
                  }}
                  placeholder="Add a new prompt..."
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
                />
                <button
                  onClick={() => void handleAddTopic()}
                  disabled={!newTopicText.trim() || isSaving}
                  className="btn btn-primary px-4 disabled:opacity-50"
                  aria-label="Add prompt"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            className="mt-6"
            eyebrow="Answer structures"
            title="Frameworks for this deck"
            description={
              isEditable
                ? 'Choose the answer structures that should be available whenever someone practices this deck.'
                : 'These answer structures are available whenever someone practices this deck.'
            }
            action={
              isEditable ? (
                <button
                  onClick={() => void handleUseAllFrameworks()}
                  disabled={isSaving}
                  className="rounded-full border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  Use all
                </button>
              ) : null
            }
          >
            <div className="rounded-2xl border border-border bg-bg-secondary/60 p-4 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">
                {deckFrameworkIds.length} framework{deckFrameworkIds.length === 1 ? '' : 's'} currently used in this deck
              </p>
              <p className="mt-1 leading-relaxed">
                Prompts inherit these deck-level choices. Rare seeded prompts can still narrow the
                set during practice.
              </p>
            </div>

            <div className="space-y-3">
              {frameworksForDeckPage.map((framework) => (
                <DeckFrameworkPicker
                  key={framework.id}
                  framework={framework}
                  isEditable={isEditable}
                  isSaving={isSaving}
                  isSelected={deckFrameworkIds.includes(framework.id)}
                  isSuggested={Boolean(
                    deck.objectiveId && framework.objectiveIds?.includes(deck.objectiveId)
                  )}
                  onToggle={(frameworkId) => void handleToggleDeckFramework(frameworkId)}
                />
              ))}
            </div>
          </SectionCard>

          <FlowActions description="Use this deck in your next round or head back to the full deck list.">
            <Link href="/setup" className="btn btn-primary w-full justify-center">
              <Mic className="h-4 w-4" />
              Start a New Session
            </Link>
            <Link href="/decks" className="btn btn-secondary w-full justify-center">
              <Layers className="h-4 w-4" />
              All Decks
            </Link>
          </FlowActions>
        </div>
      </div>
    </div>
  );
}
