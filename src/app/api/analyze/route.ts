import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ANALYSIS_PROMPT_VERSION, normalizeTranscript, parseAnalysisResponse } from '@/lib/analysis';
import { buildAnalysisPrompt } from '@/lib/constants/prompts';
import { assertServerRuntimeConfig, getDailyAnalysisLimitForEmail } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface AnalyzeRequest {
  transcript: string;
  topic: string;
  framework: string;
  frameworkId?: string | null;
}

interface ParsedAnalyzeBase {
  topic: string;
  framework: string;
  frameworkId: string | null;
}

interface ParsedTranscriptAnalyzeRequest extends ParsedAnalyzeBase {
  kind: 'transcript';
  transcript: string;
}

interface ParsedAudioAnalyzeRequest extends ParsedAnalyzeBase {
  kind: 'audio';
  audio: File;
  durationSeconds: number;
}

type ParsedAnalyzeRequest = ParsedTranscriptAnalyzeRequest | ParsedAudioAnalyzeRequest;

type ReservationResult = {
  attemptId: string;
  remainingToday: number;
};

const AUDIO_FIELD_NAME = 'audio';

async function reserveAnalysisAttempt(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  transcriptCharCount: number,
  dailyLimit: number
) {
  const rpcResult = await supabase.rpc('reserve_analysis_attempt', {
    p_daily_limit: dailyLimit,
    p_transcript_char_count: transcriptCharCount,
  });

  if (!rpcResult.error && rpcResult.data) {
    const data = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
    if (data?.attempt_id) {
      return {
        attemptId: String(data.attempt_id),
        remainingToday: Number(data.remaining_today ?? 0),
      };
    }
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from('analysis_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .in('status', ['reserved', 'succeeded', 'failed_after_model']);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) >= dailyLimit) {
    return null;
  }

  const { data, error } = await supabase
    .from('analysis_attempts')
    .insert({
      user_id: userId,
      status: 'reserved',
      transcript_char_count: transcriptCharCount,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to reserve analysis attempt');
  }

  return {
    attemptId: String(data.id),
    remainingToday: Math.max(dailyLimit - ((count ?? 0) + 1), 0),
  };
}

async function updateAnalysisAttempt(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  attemptId: string | null,
  updates: Record<string, unknown>
) {
  if (!attemptId) return;

  await supabase.from('analysis_attempts').update(updates).eq('id', attemptId);
}

function getRequestText(value: FormDataEntryValue | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getRequestInteger(value: FormDataEntryValue | null | undefined): number | null {
  const text = getRequestText(value);
  if (!text) return null;

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function parseAnalyzeRequest(request: Request): Promise<ParsedAnalyzeRequest> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const audio = formData.get(AUDIO_FIELD_NAME);

    if (!(audio instanceof File)) {
      throw new Error('Missing required field: audio');
    }

    const durationSeconds = getRequestInteger(formData.get('durationSeconds'));

    return {
      kind: 'audio',
      audio,
      durationSeconds: durationSeconds ?? -1,
      topic: getRequestText(formData.get('topic')),
      framework: getRequestText(formData.get('framework')),
      frameworkId: getRequestText(formData.get('frameworkId')) || null,
    };
  }

  const body = (await request.json()) as Partial<AnalyzeRequest>;

  return {
    kind: 'transcript',
    transcript: typeof body.transcript === 'string' ? body.transcript : '',
    topic: typeof body.topic === 'string' ? body.topic.trim() : '',
    framework: typeof body.framework === 'string' ? body.framework.trim() : '',
    frameworkId:
      typeof body.frameworkId === 'string' && body.frameworkId.trim()
        ? body.frameworkId.trim()
        : null,
  };
}

function buildLimitResponse(message: string, code: string) {
  return NextResponse.json({ error: message, code }, { status: 413 });
}

export async function POST(request: Request) {
  let attemptId: string | null = null;
  let analysisModelInvoked = false;
  let reservation: ReservationResult | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to analyze a speech.' },
        { status: 401 }
      );
    }

    const config = assertServerRuntimeConfig();
    let parsedRequest: ParsedAnalyzeRequest;

    try {
      parsedRequest = await parseAnalyzeRequest(request);
    } catch (parseError) {
      const message =
        parseError instanceof Error ? parseError.message : 'Invalid analyze request.';
      return NextResponse.json({ error: message, code: 'INVALID_REQUEST' }, { status: 400 });
    }

    const dailyAnalysisLimit = getDailyAnalysisLimitForEmail(
      user.email,
      config.dailyAnalysisLimit,
      config.dailyAnalysisLimitOverrides
    );

    const normalizedTopic = parsedRequest.topic.trim().slice(0, 240);
    const normalizedFramework = parsedRequest.framework.trim().slice(0, 120);
    const normalizedFrameworkId = parsedRequest.frameworkId?.trim() || null;

    if (!normalizedTopic || !normalizedFramework) {
      return NextResponse.json(
        { error: 'Missing required fields: topic and framework' },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: config.openAiApiKey });
    let normalizedTranscript: ReturnType<typeof normalizeTranscript> | null = null;

    if (parsedRequest.kind === 'audio') {
      if (parsedRequest.audio.size <= 0) {
        return NextResponse.json({ error: 'Audio file is empty.', code: 'INVALID_AUDIO' }, { status: 400 });
      }

      if (parsedRequest.audio.size > config.maxAudioUploadBytes) {
        return buildLimitResponse(
          `Audio file is too large. Limit is ${config.maxAudioUploadBytes} bytes.`,
          'AUDIO_TOO_LARGE'
        );
      }

      if (parsedRequest.durationSeconds <= 0) {
        return NextResponse.json(
          { error: 'Missing required field: durationSeconds', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }

      if (parsedRequest.durationSeconds > config.maxAudioDurationSeconds) {
        return buildLimitResponse(
          `Audio is too long. Limit is ${config.maxAudioDurationSeconds} seconds.`,
          'AUDIO_TOO_LONG'
        );
      }

      reservation = await reserveAnalysisAttempt(supabase, user.id, 0, dailyAnalysisLimit);

      if (!reservation) {
        return NextResponse.json(
          {
            error: `Daily analysis limit reached. Try again tomorrow.`,
            code: 'DAILY_LIMIT_REACHED',
          },
          { status: 429 }
        );
      }

      attemptId = reservation.attemptId;

      const transcription = await client.audio.transcriptions.create({
        file: parsedRequest.audio,
        model: config.transcriptionModel,
        language: 'en',
      });

      const transcript = transcription.text?.trim();
      if (!transcript) {
        throw new Error('Transcription returned invalid result.');
      }

      normalizedTranscript = normalizeTranscript(transcript, config.maxTranscriptChars);

      if (!normalizedTranscript.transcript) {
        throw new Error('Transcription returned invalid result.');
      }

      await updateAnalysisAttempt(supabase, attemptId, {
        transcript_char_count: normalizedTranscript.transcript.length,
      });
    } else {
      const transcript = parsedRequest.transcript.trim();

      if (!transcript) {
        return NextResponse.json(
          { error: 'Transcript, topic, and framework must contain text.' },
          { status: 400 }
        );
      }

      normalizedTranscript = normalizeTranscript(transcript, config.maxTranscriptChars);

      if (!normalizedTranscript.transcript) {
        return NextResponse.json(
          { error: 'Transcript, topic, and framework must contain text.' },
          { status: 400 }
        );
      }

      reservation = await reserveAnalysisAttempt(
        supabase,
        user.id,
        normalizedTranscript.transcript.length,
        dailyAnalysisLimit
      );

      if (!reservation) {
        return NextResponse.json(
          {
            error: `Daily analysis limit reached. Try again tomorrow.`,
            code: 'DAILY_LIMIT_REACHED',
          },
          { status: 429 }
        );
      }

      attemptId = reservation.attemptId;
    }

    if (!normalizedTranscript?.transcript) {
      throw new Error('Transcription returned invalid result.');
    }

    const transcriptForAnalysis = normalizedTranscript.transcript;

    analysisModelInvoked = true;

    const response = await client.responses.create({
      model: config.evalModel,
      input: buildAnalysisPrompt(transcriptForAnalysis, normalizedTopic, normalizedFramework),
    });

    const output = response.output_text?.trim();
    if (!output) {
      throw new Error('The model returned an empty response.');
    }

    const analysis = parseAnalysisResponse(output);

    const { data: feedbackRow, error: insertError } = await supabase
      .from('speech_feedback')
      .insert({
        user_id: user.id,
        topic_text: normalizedTopic,
        framework_id: normalizedFrameworkId,
        framework_name: normalizedFramework,
        transcript: transcriptForAnalysis,
        analysis_json: analysis,
        overall_score: analysis.overallScore ?? null,
        transcript_char_count: transcriptForAnalysis.length,
        prompt_version: ANALYSIS_PROMPT_VERSION,
      })
      .select('id')
      .single();

    if (insertError || !feedbackRow) {
      throw new Error(insertError?.message || 'Failed to save speech feedback.');
    }

    await updateAnalysisAttempt(supabase, attemptId, {
      status: 'succeeded',
      model_name: config.evalModel,
      feedback_id: feedbackRow.id,
      transcript_char_count: transcriptForAnalysis.length,
    });

    return NextResponse.json({
      analysis,
      feedbackId: feedbackRow.id,
      transcript: transcriptForAnalysis,
      isTrimmed: normalizedTranscript.isTrimmed,
      remainingToday: reservation?.remainingToday ?? 0,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    try {
      const supabase = await createSupabaseServerClient();
      await updateAnalysisAttempt(supabase, attemptId, {
        status: analysisModelInvoked ? 'failed_after_model' : 'failed_before_model',
        error_code: error instanceof Error ? error.message.slice(0, 160) : 'ANALYSIS_FAILED',
      });
    } catch (attemptUpdateError) {
      console.error('Failed to update analysis attempt:', attemptUpdateError);
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Analysis failed',
        code: 'ANALYSIS_FAILED',
      },
      { status: 500 }
    );
  }
}
