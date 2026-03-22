import {
  cloneTopic,
  createPersistedDeckRecord,
  getBuiltInDeckById,
  mapPersistedDeckRecord,
  mergeDeckLibrary,
} from '@/lib/data/decks';
import { Deck, PersistedDeckRecord, Topic } from '@/lib/types';

interface UserDeckRow {
  deck_id: string;
  built_in_deck_id: string | null;
  name: string | null;
  description: string | null;
  objective_id: string | null;
  objective_label: string | null;
  allowed_framework_ids: string[] | null;
  topics_json: unknown;
}

function parseTopic(value: unknown): Topic | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const topic = value as Record<string, unknown>;

  if (typeof topic.id !== 'string' || typeof topic.text !== 'string') {
    return null;
  }

  const allowedFrameworkIds =
    Array.isArray(topic.allowedFrameworkIds) &&
    topic.allowedFrameworkIds.every((entry) => typeof entry === 'string')
      ? [...topic.allowedFrameworkIds]
      : undefined;

  return {
    id: topic.id,
    text: topic.text,
    allowedFrameworkIds,
  };
}

function parseTopicsJson(value: unknown): Topic[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(parseTopic).filter((topic): topic is Topic => topic !== null);
}

export function mapUserDeckRow(row: UserDeckRow): PersistedDeckRecord {
  return {
    deckId: row.deck_id,
    builtInDeckId: row.built_in_deck_id,
    name: row.name,
    description: row.description,
    objectiveId: row.objective_id,
    objectiveLabel: row.objective_label,
    allowedFrameworkIds: row.allowed_framework_ids ?? [],
    topics: parseTopicsJson(row.topics_json),
  };
}

export function buildDeckLibraryFromRows(rows: UserDeckRow[]): Deck[] {
  return mergeDeckLibrary(rows.map(mapUserDeckRow));
}

export function sanitizeDeckForPersistence(deck: Deck): PersistedDeckRecord {
  const baseRecord = createPersistedDeckRecord(deck);

  if (!deck.isBuiltIn) {
    return {
      ...baseRecord,
      name: deck.name.trim(),
      description: deck.description?.trim() || null,
      objectiveId: deck.objectiveId ?? null,
      objectiveLabel: deck.objectiveLabel ?? null,
      allowedFrameworkIds: deck.allowedFrameworkIds ? [...deck.allowedFrameworkIds] : [],
      topics: deck.topics.map(cloneTopic),
    };
  }

  const builtInDeck = getBuiltInDeckById(deck.id);

  if (!builtInDeck) {
    throw new Error('Unknown built-in deck.');
  }

  return {
    ...baseRecord,
    deckId: builtInDeck.id,
    builtInDeckId: builtInDeck.id,
    name: null,
    description: null,
    objectiveId: null,
    objectiveLabel: null,
    allowedFrameworkIds: deck.allowedFrameworkIds ? [...deck.allowedFrameworkIds] : [],
    topics: deck.topics.map(cloneTopic),
  };
}

export function parseDeckPayload(payload: unknown): Deck {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Missing deck payload.');
  }

  const deck = payload as Record<string, unknown>;

  if (typeof deck.id !== 'string' || typeof deck.name !== 'string') {
    throw new Error('Deck id and name are required.');
  }

  const topics = parseTopicsJson(deck.topics);
  if (topics.length !== (Array.isArray(deck.topics) ? deck.topics.length : -1)) {
    throw new Error('Deck topics are invalid.');
  }

  const allowedFrameworkIds =
    Array.isArray(deck.allowedFrameworkIds) &&
    deck.allowedFrameworkIds.every((entry) => typeof entry === 'string')
      ? [...deck.allowedFrameworkIds]
      : undefined;

  return mapPersistedDeckRecord({
    deckId: deck.id,
    builtInDeckId:
      typeof deck.isBuiltIn === 'boolean' && deck.isBuiltIn
        ? deck.id
        : typeof deck.builtInDeckId === 'string'
          ? deck.builtInDeckId
          : null,
    name: deck.name,
    description: typeof deck.description === 'string' ? deck.description : null,
    objectiveId: typeof deck.objectiveId === 'string' ? deck.objectiveId : null,
    objectiveLabel: typeof deck.objectiveLabel === 'string' ? deck.objectiveLabel : null,
    allowedFrameworkIds: allowedFrameworkIds ?? [],
    topics,
  });
}
