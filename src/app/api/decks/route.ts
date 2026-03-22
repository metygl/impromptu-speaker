import { NextResponse } from 'next/server';
import { buildDeckLibraryFromRows, parseDeckPayload, sanitizeDeckForPersistence } from '@/lib/deck-records';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function listUserDeckRows() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data, error } = await supabase
    .from('user_decks')
    .select(
      'deck_id, built_in_deck_id, name, description, objective_id, objective_label, allowed_framework_ids, topics_json'
    )
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    supabase,
    user,
    rows: data ?? [],
  };
}

export async function GET() {
  try {
    const result = await listUserDeckRows();

    if ('error' in result) {
      return result.error;
    }

    return NextResponse.json({
      decks: buildDeckLibraryFromRows(result.rows),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load decks',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await listUserDeckRows();

    if ('error' in result) {
      return result.error;
    }

    const body = await request.json();
    const deck = parseDeckPayload(body?.deck);
    const record = sanitizeDeckForPersistence(deck);

    const { error } = await result.supabase.from('user_decks').upsert(
      {
        user_id: result.user.id,
        deck_id: record.deckId,
        built_in_deck_id: record.builtInDeckId,
        name: record.name,
        description: record.description,
        objective_id: record.objectiveId,
        objective_label: record.objectiveLabel,
        allowed_framework_ids: record.allowedFrameworkIds,
        topics_json: record.topics,
      },
      {
        onConflict: 'user_id,deck_id',
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    const refreshed = await listUserDeckRows();
    if ('error' in refreshed) {
      return refreshed.error;
    }

    return NextResponse.json({
      decks: buildDeckLibraryFromRows(refreshed.rows),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save deck',
      },
      { status: 500 }
    );
  }
}
