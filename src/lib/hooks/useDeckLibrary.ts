'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { builtInDecks, cloneDeck, getAllDecks } from '@/lib/data/decks';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Deck } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';

async function parseDeckResponse(response: Response) {
  const payload = (await response.json()) as { decks?: Deck[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Deck request failed');
  }

  return (payload.decks ?? []).map(cloneDeck);
}

export function useDeckLibrary() {
  const { user } = useAuth();
  const [localCustomDecks, setLocalCustomDecks, areLocalDecksHydrated] = useLocalStorage<Deck[]>(
    'customDecks',
    []
  );
  const [remoteDecks, setRemoteDecks] = useState<Deck[]>([]);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState(false);
  const [isRemoteLoading, setIsRemoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importedUsersRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setRemoteDecks([]);
      setIsRemoteLoaded(false);
      setIsRemoteLoading(false);
      setError(null);
      return;
    }

    setIsRemoteLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/decks', {
        method: 'GET',
        cache: 'no-store',
      });

      setRemoteDecks(await parseDeckResponse(response));
      setIsRemoteLoaded(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load decks');
      setRemoteDecks([]);
      setIsRemoteLoaded(true);
    } finally {
      setIsRemoteLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user || !areLocalDecksHydrated || !isRemoteLoaded) {
      return;
    }

    if (importedUsersRef.current.has(user.id)) {
      return;
    }

    const userId = user.id;

    const localDecksToImport = localCustomDecks.filter((deck) => !deck.isBuiltIn);

    if (localDecksToImport.length === 0) {
      importedUsersRef.current.add(userId);
      return;
    }

    const remoteCustomIds = new Set(
      remoteDecks.filter((deck) => !deck.isBuiltIn).map((deck) => deck.id)
    );
    const decksNeedingImport = localDecksToImport.filter((deck) => !remoteCustomIds.has(deck.id));

    if (decksNeedingImport.length === 0) {
      importedUsersRef.current.add(userId);
      setLocalCustomDecks([]);
      return;
    }

    let isCancelled = false;

    async function importLocalDecks() {
      try {
        for (const deck of decksNeedingImport) {
          const response = await fetch('/api/decks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deck }),
          });

          await parseDeckResponse(response);

          if (isCancelled) {
            return;
          }
        }

        if (isCancelled) {
          return;
        }

        importedUsersRef.current.add(userId);
        setLocalCustomDecks([]);
        await refresh();
      } catch (nextError) {
        if (isCancelled) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : 'Failed to import local decks');
      }
    }

    void importLocalDecks();

    return () => {
      isCancelled = true;
    };
  }, [
    areLocalDecksHydrated,
    localCustomDecks,
    refresh,
    remoteDecks,
    setLocalCustomDecks,
    user,
    isRemoteLoaded,
  ]);

  const saveDeck = useCallback(
    async (deck: Deck) => {
      if (!user) {
        if (deck.isBuiltIn) {
          throw new Error('Sign in to customize built-in decks.');
        }

        setLocalCustomDecks((prev) => {
          const existingIndex = prev.findIndex((entry) => entry.id === deck.id);
          const nextDeck = cloneDeck(deck);

          if (existingIndex === -1) {
            return [...prev, nextDeck];
          }

          return prev.map((entry) => (entry.id === deck.id ? nextDeck : entry));
        });
        return;
      }

      setIsRemoteLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/decks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deck }),
        });

        setRemoteDecks(await parseDeckResponse(response));
        setIsRemoteLoaded(true);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Failed to save deck');
        throw nextError;
      } finally {
        setIsRemoteLoading(false);
      }
    },
    [setLocalCustomDecks, user]
  );

  const deleteDeck = useCallback(
    async (deckId: string) => {
      if (!user) {
        setLocalCustomDecks((prev) => prev.filter((deck) => deck.id !== deckId));
        return;
      }

      setIsRemoteLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/decks/${deckId}`, {
          method: 'DELETE',
        });
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to delete deck');
        }

        await refresh();
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Failed to delete deck');
        throw nextError;
      } finally {
        setIsRemoteLoading(false);
      }
    },
    [refresh, setLocalCustomDecks, user]
  );

  const resetBuiltInDeck = useCallback(
    async (deckId: string) => {
      if (!user) {
        throw new Error('Sign in to reset built-in decks.');
      }

      setIsRemoteLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/decks/${deckId}/reset`, {
          method: 'POST',
        });
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to reset built-in deck');
        }

        await refresh();
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Failed to reset built-in deck');
        throw nextError;
      } finally {
        setIsRemoteLoading(false);
      }
    },
    [refresh, user]
  );

  const decks = useMemo(() => {
    if (user) {
      return isRemoteLoaded ? remoteDecks : builtInDecks.map(cloneDeck);
    }

    return getAllDecks(localCustomDecks).map(cloneDeck);
  }, [isRemoteLoaded, localCustomDecks, remoteDecks, user]);

  return {
    decks,
    error,
    isHydrated: user ? isRemoteLoaded : areLocalDecksHydrated,
    isLoading: user ? isRemoteLoading && !isRemoteLoaded : !areLocalDecksHydrated,
    isSaving: user ? isRemoteLoading : false,
    saveDeck,
    deleteDeck,
    resetBuiltInDeck,
    refresh,
  };
}
