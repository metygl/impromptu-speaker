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

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
