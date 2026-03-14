import { NextResponse } from 'next/server';
import { mapFeedbackRecord } from '@/lib/analysis';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('speech_feedback')
      .select(
        'id, created_at, topic_text, framework_id, framework_name, transcript, analysis_json, overall_score, transcript_char_count, prompt_version'
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      feedback: (data ?? []).map(mapFeedbackRecord),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load feedback history',
      },
      { status: 500 }
    );
  }
}
