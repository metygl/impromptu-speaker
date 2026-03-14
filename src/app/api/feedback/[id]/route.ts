import { NextResponse } from 'next/server';
import { mapFeedbackRecord } from '@/lib/analysis';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      feedback: mapFeedbackRecord(data),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load feedback',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existingFeedback, error: lookupError } = await supabase
      .from('speech_feedback')
      .select('id')
      .eq('id', id)
      .single();

    if (lookupError || !existingFeedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from('speech_feedback').delete().eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete feedback',
      },
      { status: 500 }
    );
  }
}
