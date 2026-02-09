# CLAUDE.md — Project Guidelines

## Project Overview
VK Mini App «Любовь в деталях» — парный квиз для двоих (Hot Seat формат).
Два участника по очереди отвечают на 12 вопросов на одном устройстве, затем видят сравнение ответов.

**Tech Stack:** React 18 + TypeScript + Vite 5 + VKUI 6.x + VK Bridge

## Key Commands
```bash
npm run dev      # Dev server on https://localhost:10888
npm run build    # Production build (tsc + vite)
npm run test     # Run tests (Vitest + RTL)
npm run deploy   # Deploy to VK Hosting
```

## Architecture

```
src/
├── components/          # React components
│   ├── WelcomeScreen    # Rules + start button
│   ├── QuizScreen       # Question controller (reused for A & B)
│   ├── Question*        # 4 question types (Single, Scale, Binary, Text)
│   ├── ProgressBar      # Question progress
│   ├── HandoffScreen    # "Pass the phone" screen
│   ├── ResultsScreen    # Results controller
│   ├── ResultCard       # Single question comparison
│   ├── ResultSummary    # Overall stats
│   ├── ShareSection     # VK sharing buttons
│   └── VKInsetsProvider # Safe area handling
├── hooks/
│   ├── useQuizState     # Core reducer state machine
│   ├── useVKAds         # Ads (interstitial, banner)
│   ├── useVKInsets      # Platform insets
│   └── useBackButton    # History API back button
├── styles/              # CSS files with CSS variables
├── data/
│   └── questions.ts     # 12 questions (4 blocks x 3)
├── types/
│   └── index.ts         # All TypeScript interfaces
└── utils/
    ├── platform.ts      # VK Bridge detection + standalone fallback
    ├── analytics.ts     # Umami wrapper
    ├── comparison.ts    # Answer comparison algorithm
    ├── storyCanvas.ts   # Canvas image for Stories
    └── vkBridgeErrors.ts # Error helpers
```

## Core Flow
```
Welcome → Quiz A (12q) → Handoff → Quiz B (12q) → Results
```
Panel navigation via `useState<PanelId>` in `useQuizState` reducer.

## Design System

### Colors (CSS Variables)
- Brand gradient: `#e8739e → #7c5cbf` (pink → purple)
- Match: `#4BB34B` (green)
- Soft difference: `#FF9500` (orange)
- Dialogue topic: `#5856D6` (purple)

### Layout
- Adaptive theme via `useAppearance()` from vk-bridge-react
- Touch targets: 44px minimum
- Safe area handling: env() + VK insets
- Mobile-first responsive design

## Key Patterns

### VK Bridge Detection
```typescript
await checkVKBridge(); // 1s timeout on VKWebAppGetClientVersion
if (isVKBridge()) { /* VK mode */ } else { /* standalone */ }
```

### Standalone Fallback
- Ads: silently skipped
- Sharing: buttons disabled with explanation text
- Analytics: Umami still works

### Comparison Logic
| Type | Match | Soft Difference | Dialogue Topic |
|------|-------|-----------------|----------------|
| single/binary | same | — | different |
| scale | diff ≤ 1 | diff 2-3 | diff ≥ 4 |
| text | — | — | always (side-by-side) |

### Tone
- Gentle, non-judgmental framing
- "Different answers aren't bad — they're a reason to understand each other better"
- No "problems", "red flags", or "conflicts"

## Testing
- Vitest + React Testing Library
- `npm run test` to run all tests
- Puppeteer for E2E flow testing

## VK App Configuration
- App ID: `54445864`
- Config: `vk-hosting-config.json`
- Deploy: `npm run deploy`
