import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ANALYSIS_PROMPT_VERSION, buildAnalysisInput, normalizeTranscript, parseAnalysisResponse } from '@/lib/analysis';
import { assertServerRuntimeConfig } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface AnalyzeRequest {
  transcript: string;
  topic: string;
  framework: string;
  frameworkId?: string | null;
}

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

export async function POST(request: Request) {
  let attemptId: string | null = null;
  let modelInvoked = false;

  try {
    const config = assertServerRuntimeConfig();
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

    const body: AnalyzeRequest = await request.json();
    const { transcript, topic, framework, frameworkId = null } = body;

    if (!transcript || !topic || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields: transcript, topic, framework' },
        { status: 400 }
      );
    }

    const normalizedTopic = topic.trim().slice(0, 240);
    const normalizedFramework = framework.trim().slice(0, 120);
    const normalizedTranscript = normalizeTranscript(
      transcript,
      config.maxTranscriptChars
    );

    if (!normalizedTopic || !normalizedFramework || !normalizedTranscript.transcript) {
      return NextResponse.json(
        { error: 'Transcript, topic, and framework must contain text.' },
        { status: 400 }
      );
    }

    const reservation = await reserveAnalysisAttempt(
      supabase,
      user.id,
      normalizedTranscript.transcript.length,
      config.dailyAnalysisLimit
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

    const client = new OpenAI({ apiKey: config.openAiApiKey });
    modelInvoked = true;

    const response = await client.responses.create({
      model: config.evalModel,
      input: buildAnalysisInput(
        normalizedTranscript.transcript,
        normalizedTopic,
        normalizedFramework
      ),
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
        framework_id: frameworkId,
        framework_name: normalizedFramework,
        transcript: normalizedTranscript.transcript,
        analysis_json: analysis,
        overall_score: analysis.overallScore ?? null,
        transcript_char_count: normalizedTranscript.transcript.length,
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
    });

    return NextResponse.json({
      analysis,
      feedbackId: feedbackRow.id,
      transcript: normalizedTranscript.transcript,
      isTrimmed: normalizedTranscript.isTrimmed,
      remainingToday: reservation.remainingToday,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    try {
      const supabase = await createSupabaseServerClient();
      await updateAnalysisAttempt(supabase, attemptId, {
        status: modelInvoked ? 'failed_after_model' : 'failed_before_model',
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
