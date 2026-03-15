# Plan

Last updated: 2026-03-14

This file is the current project-level plan and architecture summary for the shared demo.

## Current Goal

Ship a public demo of Impromptu Speaker that:

- allows anonymous users to practice with decks, frameworks, and timers
- requires sign-in for recording, transcript analysis, and saved feedback
- keeps audio local to the browser
- stores transcript, evaluation, and quota records remotely
- keeps infrastructure and operating cost low

## Current Architecture

### Frontend

- Next.js app router application
- Anonymous users can access the core practice flow
- Global navigation now uses a persistent top-right menu across the app
- Main pages favor forward CTAs and bottom-of-page "what next" actions over top-left back navigation
- Signed-in users can record locally during speeches
- Signed-in users are prompted to name and save recordings locally after each speech
- Saved local recordings can be replayed and analyzed from `/recordings/[id]`
- The standalone `/recordings` index is archived for now; the main review loop runs through direct recording detail pages and `/feedback`
- Signed-in users can transcribe locally and submit transcript-only analysis
- Feedback history is available through `/feedback`
- Feedback history is intentionally minimal; transcript and full analysis live on `/feedback/[id]`

### Auth

- Supabase Auth
- Google sign-in enabled locally
- Magic-link email intentionally deferred until a real domain and SMTP provider exist

### Speech Processing

- Audio recording: browser `MediaRecorder`
- Audio storage: local browser only
- Transcription: local Whisper via `@xenova/transformers`
- Evaluation: server-side OpenAI call using transcript text only

### Data Storage

- Supabase tables:
  - `speech_feedback`
  - `analysis_attempts`
- Daily quota enforced server-side via `reserve_analysis_attempt(...)`
- Daily quota supports per-email overrides for demo/admin accounts

## What Is Done

- Shared-demo auth architecture implemented
- Supabase server/browser clients added
- Google sign-in working on localhost
- Analysis endpoint replaced old local `codex exec` flow
- Email-based analysis quota overrides added for selected accounts such as `metygl@gmail.com`
- Feedback history pages added
- Feedback detail page supports deleting saved remote feedback without deleting local audio
- Main app navigation simplified to a persistent menu plus forward-flow page actions
- Shared page-intro, section-card, and flow-action UI patterns added across setup, decks, recordings, and feedback
- Standalone `/recordings` list removed from the main navigation and replaced with an archived fallback page
- Privacy and terms pages added
- Production build fixed to use webpack explicitly
- Setup and testing trackers added in [SETUP.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/SETUP.md) and [TODO.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/TODO.md)

## What Needs To Happen Next

### Immediate

- Add real OpenAI env vars locally
- Test the end-to-end signed-in analysis flow
- Verify Supabase rows are written correctly
- Verify daily quota behavior
- Manually validate the new menu-first navigation flow on mobile
- Manually validate feedback deletion against linked local recordings on this device

### Before Public Sharing

- Decide on a production domain
- Configure Vercel environment variables
- Update Supabase site URL and redirect URLs for production
- Update Google OAuth origins for production
- Test on mobile devices

### Optional / Later

- Decide whether public magic-link login is needed
- If needed, add custom SMTP with a real sending domain
- Add automated coverage for auth-gated behavior and quotas

## Key Decisions

- Keep anonymous practice available without auth
- Require auth only for AI-related features
- Keep audio local; do not upload audio for the demo
- Store local recordings only in browser storage, not in Supabase
- Use transcript-only evaluation to reduce cost
- Use a configurable global daily limit, default `3`
- Prefer Google-only login for now
- Keep global navigation menu-driven and persistent across pages
- Keep feedback history lightweight; reserve transcript and full critique for the detail page

## Canonical Working Docs

- Active plan: [PLAN.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/PLAN.md)
- Active task list: [TODO.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/TODO.md)
- Setup/runbook: [SETUP.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/SETUP.md)
- Historical archive: [PROJECT_STATUS_ARCHIVE_2026-01-20.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/PROJECT_STATUS_ARCHIVE_2026-01-20.md)
