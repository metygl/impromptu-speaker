# Impromptu Speaker

Impromptu Speaker is a mobile-first speaking practice app built with Next.js. Anonymous users can practice with topic decks, frameworks, and timers. Signed-in users can also record locally, transcribe locally, and submit transcript-only AI analysis with a daily usage cap.

## Getting Started

1. Copy `.env.example` to `.env.local`.
2. Configure Supabase auth and database.
3. Apply [supabase/schema.sql](/Users/metygl/Projects/PlanProject/impromptu-speaker/supabase/schema.sql) in your Supabase SQL editor.
4. Set `OPENAI_API_KEY` and `OPENAI_EVAL_MODEL`.
5. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
OPENAI_EVAL_MODEL=...
DAILY_ANALYSIS_LIMIT=3
DAILY_ANALYSIS_LIMIT_OVERRIDES=metygl@gmail.com:50
MAX_TRANSCRIPT_CHARS=12000
```

## Shared Demo Behavior

- Anonymous users: practice only
- Signed-in users: local audio recording, local transcription, remote transcript evaluation
- Remote storage: transcript, evaluation, metadata, and daily usage records
- Audio is not uploaded for the shared demo

## Commands

```bash
npm run dev
npm run build
npm test
```

## Notes

- Development and production both use webpack because the local Whisper transcription dependency is not compatible with the default Turbopack path in this app.
- The shared analysis route requires authenticated Supabase sessions and the `speech_feedback` / `analysis_attempts` tables from the provided SQL schema.

## Deploy

Deploy the app to Vercel after Supabase and environment variables are configured.
