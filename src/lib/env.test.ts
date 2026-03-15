import { describe, expect, it } from 'vitest';
import { getDailyAnalysisLimitForEmail } from '@/lib/env';

describe('env helpers', () => {
  it('uses the fallback limit for emails without an override', () => {
    expect(getDailyAnalysisLimitForEmail('user@example.com', 3, {})).toBe(3);
  });

  it('matches overrides case-insensitively', () => {
    expect(
      getDailyAnalysisLimitForEmail('Metygl@Gmail.com', 3, {
        'metygl@gmail.com': 50,
      })
    ).toBe(50);
  });
});
