import { describe, expect, it } from 'vitest';
import {
  defaultBuiltInDeck,
  getBuiltInDeckById,
} from './data/decks';
import { frameworks } from './data/frameworks';
import {
  getCompatibleFrameworks,
  getCompatibleFrameworksForTopic,
  normalizeSelectedFrameworkIds,
} from './utils';

describe('content compatibility helpers', () => {
  it('uses the first built-in deck as the default practice entry point', () => {
    expect(defaultBuiltInDeck.id).toBe('interview-behavioral');
  });

  it('filters frameworks to the deck-level allowed list', () => {
    const deck = getBuiltInDeckById('elevator-pitches');

    expect(deck).toBeDefined();

    const compatible = getCompatibleFrameworks(deck!, frameworks);

    expect(compatible.map((framework) => framework.id)).toEqual([
      'who-what-proof-goal',
      'role-value-direction',
    ]);
  });

  it('prefers topic-level framework overrides when present', () => {
    const deck = getBuiltInDeckById('interview-introductions');
    const topic = deck?.topics.find((entry) => entry.id === 'ii-5');

    expect(deck).toBeDefined();
    expect(topic).toBeDefined();

    const compatible = getCompatibleFrameworksForTopic(deck!, topic!, frameworks);

    expect(compatible.map((framework) => framework.id)).toEqual([
      'present-recent-future',
    ]);
  });

  it('backfills to all compatible frameworks when prior selections become invalid', () => {
    const available = getCompatibleFrameworks(
      getBuiltInDeckById('status-updates')!,
      frameworks
    );

    expect(
      normalizeSelectedFrameworkIds(available, ['prep', 'star'])
    ).toEqual(['what-so-what-now-what', 'progress-blockers-next']);
  });

  it('preserves an intentionally empty framework selection', () => {
    const available = getCompatibleFrameworks(
      getBuiltInDeckById('status-updates')!,
      frameworks
    );

    expect(normalizeSelectedFrameworkIds(available, [])).toEqual([]);
  });
});
