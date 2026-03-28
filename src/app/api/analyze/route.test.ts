import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.fn();
const transcriptionCreate = vi.fn();
const responsesCreate = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient,
}));

vi.mock('openai', () => ({
  default: vi.fn(function MockOpenAI() {
    return {
      audio: {
        transcriptions: {
          create: transcriptionCreate,
        },
      },
      responses: {
        create: responsesCreate,
      },
    };
  }),
}));

function buildAnalysisResponse(overrides?: Record<string, unknown>) {
  return JSON.stringify({
    clarityAndStructure: { score: 8, feedback: 'Clear and structured.' },
    concisenessAndWordChoice: { score: 7, feedback: 'Tight phrasing.' },
    emotionalResonance: { score: 6, feedback: 'Warm delivery.' },
    toneAndPresence: { score: 9, feedback: 'Confident presence.' },
    audienceConnection: { score: 8, feedback: 'Good connection.' },
    improvements: ['Open with a stronger hook'],
    overallScore: 8.2,
    ...overrides,
  });
}

function buildSupabaseMock(options?: {
  user?: { id: string; email: string | null };
  rpcResult?: { data: unknown; error: null | Error };
  quotaCount?: number;
  feedbackId?: string;
}) {
  const analysisAttemptsUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });
  const feedbackInsertSingle = vi.fn().mockResolvedValue({
    data: { id: options?.feedbackId ?? 'feedback-1' },
    error: null,
  });
  const feedbackInsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: feedbackInsertSingle,
    }),
  });
  const analysisAttemptsInsertSingle = vi.fn().mockResolvedValue({
    data: { id: 'attempt-fallback-1' },
    error: null,
  });
  const analysisAttemptsSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          count: options?.quotaCount ?? 0,
          error: null,
        }),
      }),
    }),
  });
  const analysisAttemptsInsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: analysisAttemptsInsertSingle,
    }),
  });
  const rpc = vi.fn().mockResolvedValue(
    options?.rpcResult ?? {
      data: {
        attempt_id: 'attempt-1',
        remaining_today: 2,
      },
      error: null,
    }
  );
  const from = vi.fn((table: string) => {
    if (table === 'analysis_attempts') {
      return {
        select: analysisAttemptsSelect,
        insert: analysisAttemptsInsert,
        update: analysisAttemptsUpdate,
      };
    }

    if (table === 'speech_feedback') {
      return {
        insert: feedbackInsert,
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  createSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options?.user ?? { id: 'user-1', email: 'user@example.com' } },
      }),
    },
    rpc,
    from,
  });

  return {
    rpc,
    from,
    analysisAttemptsUpdate,
    feedbackInsert,
  };
}

function buildJsonRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function buildMultipartRequest({
  audio,
  topic,
  framework,
  frameworkId,
  durationSeconds,
}: {
  audio: Blob;
  topic: string;
  framework: string;
  frameworkId?: string;
  durationSeconds: number;
}) {
  const formData = new FormData();
  formData.append('audio', audio, 'recording.webm');
  formData.append('topic', topic);
  formData.append('framework', framework);
  formData.append('durationSeconds', String(durationSeconds));

  if (frameworkId) {
    formData.append('frameworkId', frameworkId);
  }

  return {
    headers: new Headers({
      'content-type': 'multipart/form-data; boundary=test-boundary',
    }),
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as Request;
}

describe('analyze route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
    vi.stubEnv('OPENAI_EVAL_MODEL', 'gpt-5-mini');
    vi.stubEnv('OPENAI_TRANSCRIBE_MODEL', 'gpt-4o-mini-transcribe');
    vi.stubEnv('MAX_AUDIO_UPLOAD_BYTES', '100');
    vi.stubEnv('MAX_AUDIO_DURATION_SECONDS', '300');
    vi.stubEnv('DAILY_ANALYSIS_LIMIT', '3');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 401 for unauthenticated requests', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    const { POST } = await import('./route');
    const response = await POST(
      buildJsonRequest({
        transcript: 'A short transcript.',
        topic: 'Tell me about yourself',
        framework: 'Present-Recent-Future',
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'You must be signed in to analyze a speech.',
    });
  });

  it('analyzes a transcript-only JSON request', async () => {
    const { feedbackInsert } = buildSupabaseMock();
    transcriptionCreate.mockResolvedValue({ text: 'unused' });
    responsesCreate.mockResolvedValue({
      output_text: buildAnalysisResponse(),
    });

    const { POST } = await import('./route');
    const response = await POST(
      buildJsonRequest({
        transcript: 'Short transcript from local Whisper.',
        topic: 'Tell me about yourself',
        framework: 'Present-Recent-Future',
        frameworkId: 'present-recent-future',
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      feedbackId: 'feedback-1',
      transcript: 'Short transcript from local Whisper.',
      remainingToday: 2,
      isTrimmed: false,
    });
    expect(transcriptionCreate).not.toHaveBeenCalled();
    expect(responsesCreate).toHaveBeenCalledTimes(1);
    expect(feedbackInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        transcript: 'Short transcript from local Whisper.',
        framework_id: 'present-recent-future',
      })
    );
  });

  it('analyzes mobile audio uploads end to end', async () => {
    const { analysisAttemptsUpdate, feedbackInsert } = buildSupabaseMock();
    transcriptionCreate.mockResolvedValue({
      text: 'Mobile transcript from server transcription.',
    });
    responsesCreate.mockResolvedValue({
      output_text: buildAnalysisResponse(),
    });

    const { POST } = await import('./route');
    const response = await POST(
      buildMultipartRequest({
        audio: new Blob([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], {
          type: 'audio/webm',
        }),
        topic: 'Tell me about yourself',
        framework: 'Present-Recent-Future',
        frameworkId: 'present-recent-future',
        durationSeconds: 180,
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      feedbackId: 'feedback-1',
      transcript: 'Mobile transcript from server transcription.',
      remainingToday: 2,
      isTrimmed: false,
    });
    expect(transcriptionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-mini-transcribe',
        language: 'en',
        file: expect.any(File),
      })
    );
    expect(responsesCreate).toHaveBeenCalledTimes(1);
    expect(analysisAttemptsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        transcript_char_count: 'Mobile transcript from server transcription.'.length,
      })
    );
    expect(feedbackInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        transcript: 'Mobile transcript from server transcription.',
      })
    );
  });

  it('rejects audio uploads that exceed the configured size limit', async () => {
    buildSupabaseMock();
    transcriptionCreate.mockResolvedValue({ text: 'unused' });
    responsesCreate.mockResolvedValue({
      output_text: buildAnalysisResponse(),
    });

    const { POST } = await import('./route');
    const response = await POST(
      buildMultipartRequest({
        audio: new Blob([new Uint8Array(101)], {
          type: 'audio/webm',
        }),
        topic: 'Tell me about yourself',
        framework: 'Present-Recent-Future',
        durationSeconds: 180,
      })
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      code: 'AUDIO_TOO_LARGE',
    });
    expect(transcriptionCreate).not.toHaveBeenCalled();
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when a multipart request is missing the audio file', async () => {
    buildSupabaseMock();
    responsesCreate.mockResolvedValue({
      output_text: buildAnalysisResponse(),
    });

    const formData = new FormData();
    formData.append('topic', 'Tell me about yourself');
    formData.append('framework', 'Present-Recent-Future');
    formData.append('durationSeconds', '180');

    const { POST } = await import('./route');
    const response = await POST({
      headers: new Headers({
        'content-type': 'multipart/form-data; boundary=test-boundary',
      }),
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as Request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: 'INVALID_REQUEST',
      error: 'Missing required field: audio',
    });
    expect(transcriptionCreate).not.toHaveBeenCalled();
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it('rejects audio uploads that exceed the configured duration limit', async () => {
    buildSupabaseMock();
    transcriptionCreate.mockResolvedValue({ text: 'unused' });
    responsesCreate.mockResolvedValue({
      output_text: buildAnalysisResponse(),
    });

    const { POST } = await import('./route');
    const response = await POST(
      buildMultipartRequest({
        audio: new Blob([new Uint8Array([1, 2, 3])], {
          type: 'audio/webm',
        }),
        topic: 'Tell me about yourself',
        framework: 'Present-Recent-Future',
        durationSeconds: 301,
      })
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      code: 'AUDIO_TOO_LONG',
    });
    expect(transcriptionCreate).not.toHaveBeenCalled();
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it('returns the daily limit error before starting transcription when the quota is exhausted', async () => {
    buildSupabaseMock({
      rpcResult: { data: null, error: null },
      quotaCount: 3,
    });
    transcriptionCreate.mockResolvedValue({ text: 'unused' });
    responsesCreate.mockResolvedValue({
      output_text: buildAnalysisResponse(),
    });

    const { POST } = await import('./route');
    const response = await POST(
      buildMultipartRequest({
        audio: new Blob([new Uint8Array([1, 2, 3])], {
          type: 'audio/webm',
        }),
        topic: 'Tell me about yourself',
        framework: 'Present-Recent-Future',
        durationSeconds: 180,
      })
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      code: 'DAILY_LIMIT_REACHED',
    });
    expect(transcriptionCreate).not.toHaveBeenCalled();
    expect(responsesCreate).not.toHaveBeenCalled();
  });
});
