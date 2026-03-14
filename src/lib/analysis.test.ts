import { describe, expect, it } from 'vitest';
import { normalizeTranscript, parseAnalysisResponse } from '@/lib/analysis';

describe('analysis helpers', () => {
  it('trims transcripts that exceed the max size', () => {
    const result = normalizeTranscript('abcdef', 4);

    expect(result.isTrimmed).toBe(true);
    expect(result.transcript).toBe('abcd…');
  });

  it('parses JSON analysis output into the app shape', () => {
    const analysis = parseAnalysisResponse(`{
      "clarityAndStructure": { "score": 8, "feedback": "Clear opening." },
      "concisenessAndWordChoice": { "score": 7, "feedback": "Trim filler." },
      "emotionalResonance": { "score": 6, "feedback": "Add more contrast." },
      "toneAndPresence": { "score": 8, "feedback": "Confident delivery." },
      "audienceConnection": { "score": 7, "feedback": "Use more direct language." },
      "improvements": ["Open stronger", "Shorten examples", "Close with one takeaway"],
      "overallScore": 7
    }`);

    expect(analysis.overallScore).toBe(7);
    expect(analysis.clarityAndStructure.score).toBe(8);
    expect(analysis.improvements).toHaveLength(3);
  });
});
