# TODO

Last updated: 2026-03-14

This file tracks the next practical steps after the shared-demo/auth rollout.

## Immediate Testing

- [x] Add `OPENAI_API_KEY` to `.env.local`
- [x] Add `OPENAI_EVAL_MODEL` to `.env.local`
- [x] Restart `npm run dev` after env changes
- [ ] Sign in with Google locally
- [ ] Confirm signed-in UI appears in the header/menu
- [ ] Run a full practice session while signed in
- [ ] Confirm local microphone recording starts during speech
- [ ] Confirm the save-recording prompt appears after speech ends
- [ ] Confirm saving locally redirects to `/recordings/[id]`
- [ ] Confirm local playback works on the recording detail page
- [ ] Confirm local transcription runs after clicking `Transcribe & Analyze` on `/recordings/[id]`
- [ ] Confirm AI analysis completes successfully
- [ ] Confirm the recording detail page links to saved feedback or `/feedback/[id]`
- [ ] Confirm the new result appears in `/feedback`
- [ ] Confirm the feedback detail page shows the local recording when it still exists on this device
- [ ] Confirm the feedback detail page shows the "no local recording" state when audio is unavailable
- [ ] Confirm deleting feedback removes the remote session and returns to `/feedback`
- [ ] Confirm deleting feedback does not remove the local recording audio
- [ ] Confirm Supabase `speech_feedback` gets a row
- [ ] Confirm Supabase `analysis_attempts` gets a row
- [ ] Confirm the daily limit blocks the 4th analysis attempt
- [ ] Sign out and confirm anonymous users can still practice without AI feedback

## Local QA / Manual Checks

- [ ] Test the persistent menu flow across home, setup, practice, recordings, decks, and feedback
- [ ] Test the new bottom-of-page CTA sections on mobile for spacing and scroll behavior
- [ ] Test the first-time Whisper model download experience in Chrome
- [ ] Test microphone permission denial flow
- [ ] Test analysis failure messaging when OpenAI env vars are missing or invalid
- [ ] Test behavior when transcript length exceeds `MAX_TRANSCRIPT_CHARS`
- [ ] Test mobile layout on an actual phone
- [ ] Test Safari if possible, especially browser audio/transcription compatibility

## Production / Domain Follow-Up

- [ ] Buy or decide on the real production domain
- [ ] Add production env vars in Vercel
- [ ] Update Supabase `Site URL` to the production domain
- [ ] Add production redirect URLs in Supabase
- [ ] Add preview redirect URLs for Vercel if needed
- [ ] Add the production origin in Google OAuth
- [ ] Re-test Google sign-in against the production domain

## Auth / Email Decision

- [ ] Decide whether the demo actually needs public magic-link email login
- [ ] If yes, buy/choose a sending domain
- [ ] If yes, set up Resend or another SMTP provider
- [ ] If yes, verify the sending domain
- [ ] If yes, add custom SMTP credentials in Supabase
- [ ] If yes, test magic-link delivery end to end

Current recommendation:
- Keep Google-only login until a real domain exists.

## Documentation To Update

- [x] Archive the stale project status doc instead of keeping it as the active source of truth
- [x] Create [PLAN.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/PLAN.md) for the current architecture and rollout direction
- [x] Create [AGENTS.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/AGENTS.md) instructing agents to read `PLAN.md`, `TODO.md`, and `SETUP.md` at startup
- [ ] Keep [SETUP.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/SETUP.md) current as production values are added
- [ ] Update README again if the auth or deployment flow changes

## Product / Code Cleanup

- [x] Repurpose `/recordings` as the local-only review flow for saved recordings
- [x] Keep local audio accessible via browser-only saved recordings, not remote storage
- [ ] Add tests for the authenticated analysis API route
- [x] Add tests for the feedback delete API route
- [ ] Add tests for feedback history loading
- [ ] Add tests for daily quota enforcement
- [x] Add tests for auth-gated UI behavior
- [x] Align the main app routes around persistent menu navigation plus forward CTAs
- [ ] Consider whether feedback detail should link back to a matching local recording detail page when both exist
- [ ] Consider adding a shared card/section component for more of the remaining detail surfaces

## Existing Repo Cleanup Not Caused By This Rollout

- [ ] Clean up existing lint errors/warnings in legacy files
- [ ] Revisit older local-storage hydration patterns flagged by ESLint
- [ ] Revisit old recording/audio hooks that are no longer central to the shared-demo flow
