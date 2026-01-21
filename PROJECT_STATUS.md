# Impromptu Speaker - Project Status

**Last Updated:** January 20, 2026
**Status:** Voice Recording Feature Complete, Tests Added

---

## Project Overview

A mobile-first web app for practicing impromptu speaking with structured frameworks. Users select a topic deck, choose frameworks, set a timer, then get a random topic + framework with 60s prep time before the speech timer begins. Now includes voice recording with local Whisper transcription and AI analysis.

**Repository:** https://github.com/metygl/impromptu-speaker
**Tech Stack:** Next.js 16.1.1, React 19, TypeScript, Tailwind CSS 4
**Deployment Target:** Vercel

---

## Completed Milestones

### Milestone 1: MVP Build ✅

- [x] Project setup (Next.js + TypeScript + Tailwind)
- [x] Design system (custom fonts, color palette, CSS variables)
- [x] 8 speaking frameworks with detailed data
- [x] Core components (Timer, TopicCard, FrameworkCard with expand)
- [x] All pages (Home, Setup, Practice, Decks, Edit Deck)
- [x] Timer functionality (prep countdown → speech timer → bell)
- [x] Local storage persistence
- [x] PWA manifest
- [x] Bell audio file

### Milestone 2: Voice Recording Feature ✅

- [x] **Recording hooks:**
  - `useRecording` - MediaRecorder for capturing audio
  - `useIndexedDB` - Generic IndexedDB wrapper for audio blobs
  - `useVoiceRecordings` - CRUD combining localStorage + IndexedDB
  - `useAudioPlayback` - Play/pause/seek controls
  - `useTranscription` - transformers.js Whisper integration

- [x] **Recording UI components:**
  - `RecordingIndicator` - Pulsing red dot + duration during recording
  - `SaveRecordingModal` - Name input + save/discard buttons
  - `RecordingCard` - Card in list with name, topic, duration, actions
  - `AudioPlayer` - Full player with scrubber and speed control
  - `TranscriptionProgress` - Progress bar during model download/transcription

- [x] **Recording pages:**
  - `/recordings` - List all saved recordings
  - `/recordings/[id]` - Detail view with playback + analysis

- [x] **Practice page integration:**
  - Auto-start recording when speech phase begins
  - Auto-stop recording when timer completes
  - "End Early" button to stop recording before timer ends
  - Save modal appears after recording completes

- [x] **Analysis API:**
  - `/api/analyze` - API route that spawns Codex CLI for analysis
  - Analysis prompt for: Clarity, Conciseness, Emotional Resonance, Tone, Audience Connection, Improvements

### Milestone 3: Testing ✅

- [x] **Vitest + React Testing Library:**
  - `vitest.config.mts` - Vitest configuration
  - `/src/test/setup.ts` - Test mocks for browser APIs

- [x] **Unit tests (55 tests passing):**
  - `useRecording.test.ts` - 7 tests
  - `useVoiceRecordings.test.ts` - 7 tests
  - `useAudioPlayback.test.ts` - 9 tests
  - `RecordingIndicator.test.tsx` - 9 tests
  - `SaveRecordingModal.test.tsx` - 11 tests
  - `RecordingCard.test.tsx` - 12 tests

- [x] **E2E tests (15 tests passing):**
  - `playwright.config.ts` - Playwright configuration
  - `/e2e/recordings.spec.ts` - E2E test suite

---

## Current File Structure

```
/impromptu-speaker
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout with fonts
│   │   ├── globals.css           # Design system CSS
│   │   ├── setup/page.tsx        # Setup flow
│   │   ├── practice/page.tsx     # Prep + Speech + Done phases (with recording)
│   │   ├── recordings/
│   │   │   ├── page.tsx          # Recordings list
│   │   │   └── [id]/page.tsx     # Recording detail + analysis
│   │   ├── api/
│   │   │   └── analyze/route.ts  # Codex CLI analysis endpoint
│   │   └── decks/
│   │       ├── page.tsx          # Deck list
│   │       └── [deckId]/page.tsx # Edit topics
│   ├── components/
│   │   ├── Timer.tsx             # Circular countdown
│   │   ├── TopicCard.tsx         # Topic display
│   │   ├── FrameworkCard.tsx     # Expandable framework
│   │   ├── Header.tsx            # Navigation header with menu
│   │   ├── RecordingIndicator.tsx # Recording status dot
│   │   ├── SaveRecordingModal.tsx # Save/discard dialog
│   │   ├── RecordingCard.tsx     # Recording list item
│   │   ├── AudioPlayer.tsx       # Audio playback controls
│   │   ├── TranscriptionProgress.tsx # Transcription status
│   │   └── ...                   # Other components
│   ├── lib/
│   │   ├── types.ts              # TypeScript interfaces (Recording, SpeechAnalysis, etc.)
│   │   ├── utils.ts              # Helper functions
│   │   ├── constants/
│   │   │   └── prompts.ts        # Analysis prompt template
│   │   ├── data/
│   │   │   ├── frameworks.ts     # 8 framework definitions
│   │   │   └── defaultTopics.ts  # 30 default topics
│   │   └── hooks/
│   │       ├── useTimer.ts       # Timer logic
│   │       ├── useLocalStorage.ts # Persistence (returns [value, setValue, isHydrated])
│   │       ├── useAudio.ts       # Bell sound
│   │       ├── useRecording.ts   # MediaRecorder hook
│   │       ├── useIndexedDB.ts   # IndexedDB for audio blobs
│   │       ├── useVoiceRecordings.ts # CRUD for recordings
│   │       ├── useAudioPlayback.ts # Audio player controls
│   │       └── useTranscription.ts # Whisper transcription
│   └── test/
│       └── setup.ts              # Test mocks
├── e2e/
│   └── recordings.spec.ts        # E2E tests
├── public/
│   ├── bell.mp3                  # Timer completion sound
│   └── manifest.json             # PWA manifest
├── vitest.config.mts             # Vitest configuration
├── playwright.config.ts          # Playwright configuration
└── PROJECT_STATUS.md             # This file
```

---

## Key Technical Details

### Audio Storage
- **Audio blobs:** IndexedDB (`impromptu-speaker` database, `recordings` store)
- **Metadata:** localStorage (`voiceRecordings` key)

### Transcription (Local Whisper)
- Uses `@xenova/transformers` library
- Model: `Xenova/whisper-small` (~40MB, cached after first download)
- Processes audio at 16kHz mono
- All processing happens in browser - no API calls
- **Requires webpack** (Turbopack not compatible) - `npm run dev` uses `--webpack` flag
- **Browser support:** Chrome/Firefox recommended; Safari may have WebAssembly issues

### Analysis (Codex CLI)
- API route at `/api/analyze`
- Spawns `codex exec` subprocess locally
- Only works in development (`npm run dev`)

---

## How to Run

```bash
cd /Users/metygl/Projects/PlanProject/impromptu-speaker

# Development (uses webpack for transformers.js compatibility)
npm run dev

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Build
npm run build
```

**Note:** Dev server uses `--webpack` flag because `@xenova/transformers` is not compatible with Turbopack.

---

## Recent Bug Fixes (January 20, 2026)

1. **Duplicate key error in FrameworkCard** - Changed `key={step.label}` to `key={index}` (PREP has "Point" twice)

2. **Audio loading error** - Improved cleanup in `useAudioPlayback.ts`:
   - Removes event listeners before clearing src
   - Better error messages with MediaError codes

3. **"Recording not found" race condition** - Fixed localStorage hydration timing:
   - `useLocalStorage` now returns `isHydrated` as third value
   - `useVoiceRecordings` waits for both IndexedDB and localStorage
   - Recording detail page waits for hook to load

4. **Added "End Early" button** - During speech phase, users can now end recording early

5. **Transcription not working (Object.keys error)** - Fixed `@xenova/transformers` compatibility:
   - Changed `npm run dev` to use `--webpack` flag (Turbopack incompatible with transformers.js)
   - Added `next.config.ts` webpack aliases to exclude `sharp` and `onnxruntime-node`
   - Configured `env.allowLocalModels = false` to load models from HuggingFace Hub
   - Added input validation for audio blobs in `useTranscription`

6. **FrameworkCard content cutoff** - Increased expanded max-height from 600px to 2000px to show all framework steps

---

## Pending Tasks

### Deployment
- [ ] Deploy to Vercel
- [ ] Test on mobile device
- [ ] Add PWA icons

### Nice-to-Have
- [ ] Dark mode support
- [ ] Session history/stats tracking
- [ ] Share functionality
- [ ] More default topic decks

---

## Plan File

Full implementation plan: `~/.claude/plans/replicated-crafting-tower.md`
