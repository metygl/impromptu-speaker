# TODO

Last updated: 2026-03-27

This file tracks the next practical steps after the shared-demo/auth rollout.

## Content Strategy

- [x] Define the built-in objective taxonomy for practice mode
- [x] Replace the single generic default deck with curated deck families for interviews, introductions, networking, updates, self-advocacy, persuasion, and difficult conversations
- [x] Add framework compatibility metadata at the deck level
- [x] Add optional framework compatibility overrides at the topic level for prompts that only support one answer structure
- [x] Decide which existing frameworks survive the curated pass and which become hidden from incompatible objectives
- [x] Draft and seed the first interview deck family
- [x] Draft and seed the first elevator-pitch / self-introduction deck family
- [x] Draft and seed the first networking deck family
- [x] Draft and seed the first status-update / stakeholder-update deck family
- [x] Draft and seed the first performance-review / self-advocacy deck family
- [x] Draft and seed the first persuasion / proposal deck family
- [x] Draft and seed the first difficult-conversation deck family
- [x] Add at least one new framework each for introductions, status updates, self-advocacy, and difficult conversations
- [x] Update the setup flow to choose objective -> deck -> compatible framework instead of deck -> any framework
- [ ] Show objective metadata in practice, recording, and feedback surfaces where useful
- [ ] Add content QA passes to remove prompt/framework pairings that feel forced or unrealistic
- [ ] Decide whether to expose objective selection as a first-class setup step instead of inferring it from the chosen deck
- [x] Surface deck-level framework compatibility on deck detail pages
- [x] Allow signed-in users to customize built-in decks and reset them to seeded defaults
- [x] Allow editable decks to change their allowed framework set
- [x] Rework deck management so prompt editing and deck-level framework selection are clearly separated
- [ ] QA the signed-in deck override flow on a second device or browser profile
- [ ] Decide whether to surface a clearer “synced to your account” status on deck list cards

## Immediate Testing

- [x] Add `OPENAI_API_KEY` to `.env.local`
- [x] Add `OPENAI_EVAL_MODEL` to `.env.local`
- [x] Restart `npm run dev` after env changes
- [ ] Set `NEXT_PUBLIC_APP_URL` in Vercel for the production domain
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in Vercel
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- [ ] Set `OPENAI_API_KEY` in Vercel
- [ ] Set `OPENAI_EVAL_MODEL=gpt-5-mini` in Vercel
- [ ] Redeploy after the Vercel env updates
- [ ] Confirm `/login` no longer shows the "Supabase auth is not configured yet" banner in production
- [ ] Sign in with Google locally
- [ ] Confirm signed-in UI appears in the header/menu
- [ ] Run a full practice session while signed in
- [ ] Confirm local microphone recording starts during speech
- [ ] Confirm the save-recording prompt appears after speech ends
- [ ] Confirm saving locally redirects to `/recordings/[id]`
- [ ] Confirm local playback works on the recording detail page
- [ ] Confirm local transcription runs after clicking `Transcribe & Analyze` on `/recordings/[id]`
- [ ] Confirm iPhone/iPad `/recordings/[id]` uploads audio transiently and completes analysis without crashing after tapping `Transcribe & Analyze`
- [ ] Confirm oversized audio is rejected before transcription on the server path
- [ ] Confirm over-long audio is rejected before transcription on the server path
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
- [ ] Confirm `metygl@gmail.com` can analyze up to the 50-attempt override
- [ ] Sign out and confirm anonymous users can still practice without AI feedback

## Local QA / Manual Checks

- [ ] Test the persistent menu flow across home, setup, practice, decks, and feedback
- [ ] Confirm `Home` is no longer shown in the slide-out menu
- [ ] Confirm practice page `Change Deck` / setup-return actions behave well in prep, speech, and done states
- [ ] Test the new bottom-of-page CTA sections on mobile for spacing and scroll behavior
- [ ] Test the first-time Whisper model download experience in Chrome
- [ ] Test microphone permission denial flow
- [ ] Test analysis failure messaging when OpenAI env vars are missing or invalid
- [ ] Test behavior when transcript length exceeds `MAX_TRANSCRIPT_CHARS`
- [ ] Test mobile layout on an actual phone
- [ ] Test Safari if possible, especially the iPhone/iPad server transcription path and browser audio compatibility
- [ ] Confirm built-in deck reset restores seeded prompts after signed-in edits
- [ ] Confirm anonymous custom decks stay local while signed-in deck edits sync remotely
- [ ] Validate the redesigned Manage Decks flow on mobile and desktop, especially framework-card scanning and prompt editing

## Production / Domain Follow-Up

- [ ] Buy or decide on the real production domain
- [ ] Add production env vars in Vercel
- [ ] Update Supabase `Site URL` to the production domain
- [ ] Add production redirect URLs in Supabase
- [ ] Add preview redirect URLs for Vercel if needed
- [ ] Add the production origin in Google OAuth
- [ ] Re-test Google sign-in against the production domain
- [ ] Re-test transcript analysis in production with `OPENAI_EVAL_MODEL=gpt-5-mini`
- [ ] Re-test iPhone/iPad transcript analysis in production with transient server transcription enabled

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

- [x] Keep `/recordings/[id]` as the active local recording detail flow
- [x] Archive the standalone `/recordings` index from the main navigation
- [x] Keep local audio accessible via browser-only saved recordings, not remote storage
- [x] Add tests for the authenticated analysis API route
- [x] Add tests for the authenticated deck API routes
- [x] Add tests for the feedback delete API route
- [ ] Add tests for feedback history loading
- [ ] Add tests for daily quota enforcement
- [x] Add tests for auth-gated UI behavior
- [x] Align the main app routes around persistent menu navigation plus forward CTAs
- [ ] Consider whether feedback detail should link back to a matching local recording detail page when both exist
- [ ] Consider adding a shared card/section component for more of the remaining detail surfaces
- [x] Add tests for objective-aware framework filtering in setup and practice generation
- [x] Add tests for topic-level framework overrides

## Existing Repo Cleanup Not Caused By This Rollout

- [ ] Clean up existing lint errors/warnings in legacy files
- [ ] Revisit older local-storage hydration patterns flagged by ESLint
- [ ] Revisit old recording/audio hooks that are no longer central to the shared-demo flow
- [ ] Decide whether mobile transcription should keep using the current transient server upload flow or move to a native wrapper later
