import { NextResponse } from 'next/server';
import { isBuiltInDeckId } from '@/lib/data/decks';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
  _request: Request,
  context: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await context.params;

    if (!isBuiltInDeckId(deckId)) {
      return NextResponse.json(
        { error: 'Only built-in decks can be reset.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('user_decks')
      .delete()
      .eq('built_in_deck_id', deckId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to reset built-in deck',
      },
      { status: 500 }
    );
  }
}
