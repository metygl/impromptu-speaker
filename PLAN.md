# Plan

Last updated: 2026-03-27

This file is the current project-level plan and architecture summary for the shared demo.

## Current Goal

Ship a public demo of Impromptu Speaker that:

- allows anonymous users to practice with decks, frameworks, and timers
- requires sign-in for recording, transcript analysis, and saved feedback
- keeps desktop audio local to the browser while allowing transient mobile uploads for transcription
- stores transcript, evaluation, and quota records remotely
- keeps infrastructure and operating cost low
- shifts built-in practice content toward concrete worker goals instead of generic prompts

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
- Built-in practice content now uses multiple goal-focused decks with deck-level and topic-level framework compatibility
- Signed-in users can customize built-in decks per account and reset them to the seeded default

### Auth

- Supabase Auth
- Google sign-in enabled locally
- Production auth depends on Vercel public Supabase env vars plus matching Supabase auth URL configuration
- Magic-link email intentionally deferred until a real domain and SMTP provider exist

### Speech Processing

- Audio recording: browser `MediaRecorder`
- Audio storage: local browser only
- Transcription: desktop browsers use local Whisper via `@xenova/transformers` with `Xenova/whisper-tiny.en`
- iPhone and iPad browsers use transient server-side transcription so the app can still analyze speech without crashing WebKit
- Server transcription is capped by upload size and audio duration limits
- Evaluation: server-side OpenAI call using transcript text only
- Current recommended evaluation model: `gpt-5-mini`

### Data Storage

- Supabase tables:
  - `speech_feedback`
  - `analysis_attempts`
  - `user_decks`
- Daily quota enforced server-side via `reserve_analysis_attempt(...)`
- Daily quota supports per-email overrides for demo/admin accounts

## Content Direction

### Problem With The Current Model

- The built-in `default` deck is a generic topic pool instead of a goal-focused training path
- Frameworks are globally selectable even when they do not fit the topic or user objective
- The setup flow starts with content format selection, not the user's real-world outcome

### Product Direction

- Reframe built-in practice around worker objectives first, then show only compatible decks and frameworks
- Treat a deck as a purposeful training pack, not just a loose bucket of prompts
- Allow some frameworks to be deck-specific or even topic-specific when the answer structure is constrained
- Keep custom decks available for freeform practice, but position them as secondary to curated goal-based practice

### Current Built-In Content

- Built-in decks now cover:
  - Behavioral interviews
  - Interview introductions / "Tell me about yourself"
  - Elevator pitches
  - Networking conversations
  - Status updates
  - Performance review and self-advocacy
  - Proposal and recommendation pitches
  - Difficult conversations
- New built-in frameworks now include:
  - `Context-Action-Result`
  - `Present-Recent-Future`
  - `Who-What-Proof-Goal`
  - `Role-Value-Direction`
  - `Context-Interest-Ask`
  - `Background-Bridge-Question`
  - `Progress-Blockers-Next`
  - `Achievement-Impact-Learning`
  - `Observation-Impact-Request`

### Research-Informed Built-In Objectives

- Interviews: behavioral stories, strengths, failures, conflict, leadership, prioritization, "tell me about yourself"
- Elevator pitch and self-introduction: role, value proposition, credibility, goals, current focus
- Networking conversations: introductions, follow-up chats, asking for advice, making a memorable impression
- Status updates and stakeholder communication: progress, blockers, risks, decisions needed, next steps
- Performance review and self-advocacy: accomplishments, impact, growth, promotion case, lessons learned
- Persuasion and proposal pitches: problem framing, recommendation, tradeoffs, benefits, call to action
- Difficult conversations and feedback: behavior, impact, expectations, resolution, next step

### Initial Deck Plan

- Interview deck family
  - Behavioral stories
  - Experience and achievements
  - Leadership and conflict
  - Motivation and self-awareness
- Introduction deck family
  - Elevator pitch
  - "Tell me about yourself"
  - New team / new client introduction
- Networking deck family
  - First-contact prompts
  - Relationship-building prompts
  - Informational interview prompts
- Update deck family
  - Daily or weekly status update
  - Project update for stakeholders
  - Executive summary update
- Self-advocacy deck family
  - Performance review reflection
  - Promotion case
  - Wins and impact recap
- Persuasion deck family
  - Proposal or recommendation
  - Tradeoff decision
  - Change advocacy
- Difficult conversation deck family
  - Feedback to peer
  - Managing disagreement
  - Escalation or reset conversation

### Framework Strategy

- Keep general-purpose frameworks only where they actually fit the objective
- Add goal-native frameworks instead of forcing every objective through PREP or generic analysis structures
- Support three levels of compatibility:
  - objective-level defaults
  - deck-level allowed frameworks
  - topic-level overrides for special cases

### Candidate Framework Mapping

- Interviews
  - Keep: `STAR`
  - Add: `CAR` / `PAR` variants for shorter behavioral answers
  - Add: concise self-introduction framework such as `Present-Recent-Future`
- Elevator pitch and self-introduction
  - Keep: `Past-Present-Future` only where the prompt is explicitly narrative
  - Add: `Who-What-Proof-Goal`
  - Add: `Role-Value-Direction`
- Networking
  - Add: `Context-Interest-Ask`
  - Add: `Background-Bridge-Question`
- Status updates and stakeholder communication
  - Add: `Progress-Blockers-Next`
  - Add: `Situation-Risk-Ask`
  - Keep: `What? So What? Now What?` for insight or recommendation updates only
- Performance review and self-advocacy
  - Keep: `STAR` for accomplishment stories
  - Add: `Achievement-Impact-Learning`
  - Add: `Goal-Action-Outcome-Growth`
- Persuasion and proposals
  - Keep: `Problem-Solution-Benefit`
  - Keep: `Pros-Cons-Conclusion`
  - Keep: `What? So What? Now What?`
- Difficult conversations and feedback
  - Add: `SBI-Next Step` or `Observation-Impact-Request`

### Content Modeling Changes

- Add a first-class `objective` field for built-in decks
- Add `allowedFrameworkIds` on decks and optional `allowedFrameworkIds` on topics
- Add objective and prompt-type metadata to frameworks so the UI can filter them before practice begins
- Prefer seeded built-in content in versioned source files instead of keeping everything in one generic default deck
- Preserve user-created decks as open-ended content without strict compatibility metadata at first

### Setup Flow Direction

- Step 1 should become "What are you practicing for?"
- Step 2 should select a compatible built-in deck within that objective
- Step 3 should show only frameworks that make sense for that deck
- If only one framework fits a topic type, the app should auto-assign it instead of pretending there is a real choice
- The practice screen and saved feedback should surface the objective alongside topic and framework

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
- Built-in deck library expanded from one generic default deck to multiple worker-goal decks
- Setup flow updated to filter frameworks by deck compatibility
- Practice generation updated to respect both deck-level and topic-level framework rules
- Goal-specific frameworks added for interview intros, networking, updates, self-advocacy, and difficult conversations
- Menu overlay no longer routes back to `Home`
- Practice page now includes a direct path back to setup for choosing a different deck
- Deck detail pages now separate prompt editing from deck-level framework selection and show expandable framework guidance inline
- Signed-in deck edits now persist remotely through `/api/decks`, while anonymous custom decks remain browser-local
- Editable decks can now change their allowed framework set directly from the deck detail page
- Topic-level framework overrides remain supported for seeded edge cases but are no longer presented as a primary authoring flow
- Production build regressions from missing deck-library files and save-recording modal prop drift were fixed on `main`
- Recording detail now uses transient server transcription on iPhone/iPad instead of starting local Whisper there

## What Needs To Happen Next

### Immediate

- Set production Vercel env vars:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`
  - `OPENAI_EVAL_MODEL=gpt-5-mini`
- Update Supabase auth URL configuration for the production domain and `/auth/callback`
- Redeploy and verify the login page no longer shows the "Supabase auth is not configured yet" banner
- Test the end-to-end signed-in analysis flow in production
- Confirm iPhone/iPad recording detail uploads audio transiently and completes analysis without crashing the tab
- Verify Supabase rows are written correctly
- Verify daily quota behavior
- Manually validate the new menu-first navigation flow on mobile
- Manually validate feedback deletion against linked local recordings on this device
- QA the new built-in decks for prompt quality and realistic phrasing
- Validate that the new framework filtering feels intuitive on mobile and desktop
- Decide whether objective metadata should appear inside saved recordings and feedback views

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
- Keep desktop audio local; allow transient iPhone/iPad uploads for transcription without storing raw audio
- Store local recordings only in browser storage, not in Supabase
- Use transcript-only evaluation to reduce cost
- Use a configurable global daily limit, default `3`
- Prefer Google-only login for now
- Keep global navigation menu-driven and persistent across pages
- Keep feedback history lightweight; reserve transcript and full critique for the detail page
- Move built-in practice content toward objective-specific deck families instead of a single generic topic pool
- Treat framework availability as a compatibility decision, not a universal multi-select
- Keep custom decks flexible while reserving strict compatibility rules for curated built-in content

## Canonical Working Docs

- Active plan: [PLAN.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/PLAN.md)
- Active task list: [TODO.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/TODO.md)
- Setup/runbook: [SETUP.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/SETUP.md)
- Historical archive: [PROJECT_STATUS_ARCHIVE_2026-01-20.md](/Users/metygl/Projects/PlanProject/impromptu-speaker/PROJECT_STATUS_ARCHIVE_2026-01-20.md)
