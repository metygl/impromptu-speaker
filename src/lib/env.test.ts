import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDailyAnalysisLimitForEmail, getServerRuntimeConfig } from '@/lib/env';

describe('env helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it('uses the default audio transcription config when env vars are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    const config = getServerRuntimeConfig();

    expect(config.transcriptionModel).toBe('gpt-4o-mini-transcribe');
    expect(config.maxAudioUploadBytes).toBe(10_000_000);
    expect(config.maxAudioDurationSeconds).toBe(300);
  });

  it('allows overriding the audio transcription config', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('OPENAI_TRANSCRIBE_MODEL', 'gpt-4o-mini-transcribe-2025-12-15');
    vi.stubEnv('MAX_AUDIO_UPLOAD_BYTES', '25000000');
    vi.stubEnv('MAX_AUDIO_DURATION_SECONDS', '600');

    const config = getServerRuntimeConfig();

    expect(config.transcriptionModel).toBe('gpt-4o-mini-transcribe-2025-12-15');
    expect(config.maxAudioUploadBytes).toBe(25_000_000);
    expect(config.maxAudioDurationSeconds).toBe(600);
  });
});
