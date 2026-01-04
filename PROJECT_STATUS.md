# Impromptu Speaker - Project Status

**Last Updated:** January 4, 2026
**Status:** MVP Complete, Ready for Deployment

---

## Project Overview

A mobile-first web app for practicing impromptu speaking with structured frameworks. Users select a topic deck, choose frameworks, set a timer, then get a random topic + framework with 60s prep time before the speech timer begins.

**Repository:** https://github.com/metygl/impromptu-speaker
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS
**Deployment Target:** Vercel

---

## Completed Milestones

### Milestone 1: MVP Build ✅

- [x] Project setup (Next.js 14 + TypeScript + Tailwind)
- [x] Design system (custom fonts, color palette, CSS variables)
- [x] 8 speaking frameworks with detailed data
  - PREP, STAR, Past-Present-Future, Problem-Solution-Benefit
  - What-So What-Now What, Pros-Cons-Conclusion, 5Ws, Cause-Effect-Remedy
- [x] Core components (Timer, TopicCard, FrameworkCard with expand)
- [x] All pages (Home, Setup, Practice, Decks, Edit Deck)
- [x] Timer functionality (prep countdown → speech timer → bell)
- [x] Local storage persistence
- [x] PWA manifest
- [x] Bell audio file
- [x] Initial commit pushed to GitHub

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
│   │   ├── practice/page.tsx     # Prep + Speech + Done phases
│   │   └── decks/
│   │       ├── page.tsx          # Deck list
│   │       └── [deckId]/page.tsx # Edit topics
│   ├── components/
│   │   ├── Timer.tsx             # Circular countdown
│   │   ├── TopicCard.tsx         # Topic display
│   │   ├── FrameworkCard.tsx     # Expandable framework
│   │   ├── Header.tsx            # Navigation header
│   │   ├── DeckSelector.tsx      # Deck dropdown
│   │   ├── FrameworkSelector.tsx # Multi-select chips
│   │   └── TimerSelector.tsx     # Duration picker
│   └── lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── utils.ts              # Helper functions
│       ├── data/
│       │   ├── frameworks.ts     # 8 framework definitions
│       │   └── defaultTopics.ts  # 30 default topics
│       └── hooks/
│           ├── useTimer.ts       # Timer logic
│           ├── useLocalStorage.ts # Persistence
│           └── useAudio.ts       # Bell sound
├── public/
│   ├── bell.mp3                  # Timer completion sound
│   └── manifest.json             # PWA manifest
└── PROJECT_STATUS.md             # This file
```

---

## Pending Tasks

### Deployment
- [ ] Deploy to Vercel (use web interface at vercel.com/new)
- [ ] Test on mobile device after deployment
- [ ] Add PWA icons (icon-192.png, icon-512.png)

### Nice-to-Have Enhancements
- [ ] Session history/stats tracking
- [ ] Dark mode support
- [ ] Haptic feedback on mobile
- [ ] Share functionality
- [ ] More default topic decks (business, interview, etc.)

---

## How to Run Locally

```bash
cd /Users/metygl/Projects/PlanProject/impromptu-speaker
npm run dev
# Open http://localhost:3000
```

## How to Deploy

1. Go to https://vercel.com/new
2. Import `metygl/impromptu-speaker` from GitHub
3. Click Deploy (defaults work for Next.js)

---

## Git Setup

- **Remote:** https://github.com/metygl/impromptu-speaker.git
- **Branch:** main
- **Credential Helper:** osxkeychain (configured)
- **Note:** Regenerate PAT at https://github.com/settings/tokens (old one was exposed)

---

## Design Notes

- **Colors:** Warm off-white (#FAFAF8), burnt orange accent (#E85D04)
- **Fonts:** Instrument Serif (display), DM Sans (body), JetBrains Mono (timer)
- **Timer States:** Prep (blue), Speech (dark), Warning (orange at 30s)
- **Full plan:** See `~/.claude/plans/modular-baking-hammock.md`
