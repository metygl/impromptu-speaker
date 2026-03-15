import { getDeckAllowedFrameworkIds, getTopicAllowedFrameworkIds } from './data/decks';
import { Topic, Framework, Deck } from './types';

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getRandomTopic(deck: Deck, excludeIds: string[] = []): Topic {
  const available = deck.topics.filter((t) => !excludeIds.includes(t.id));
  const pool = available.length > 0 ? available : deck.topics;
  return getRandomItem(pool);
}

export function getRandomFrameworkFromList(
  frameworks: Framework[],
  selectedIds: string[]
): Framework {
  const selected = frameworks.filter((f) => selectedIds.includes(f.id));
  const pool = selected.length > 0 ? selected : frameworks;
  return getRandomItem(pool);
}

export function getCompatibleFrameworks(
  deck: Deck,
  frameworks: Framework[]
): Framework[] {
  const allowedIds = new Set(
    getDeckAllowedFrameworkIds(
      deck,
      frameworks.map((framework) => framework.id)
    )
  );

  return frameworks.filter((framework) => allowedIds.has(framework.id));
}

export function getCompatibleFrameworksForTopic(
  deck: Deck,
  topic: Topic,
  frameworks: Framework[]
): Framework[] {
  const allowedIds = new Set(
    getTopicAllowedFrameworkIds(
      deck,
      topic,
      frameworks.map((framework) => framework.id)
    )
  );

  return frameworks.filter((framework) => allowedIds.has(framework.id));
}

export function normalizeSelectedFrameworkIds(
  availableFrameworks: Framework[],
  selectedIds: string[]
): string[] {
  const availableIds = new Set(availableFrameworks.map((framework) => framework.id));
  const filtered = selectedIds.filter((id) => availableIds.has(id));

  if (selectedIds.length === 0) {
    return [];
  }

  return filtered.length > 0
    ? filtered
    : availableFrameworks.map((framework) => framework.id);
}

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
