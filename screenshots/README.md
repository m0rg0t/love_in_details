# Screenshot Generation for VK Mini App

This directory contains tools for generating VK store screenshots (600×1200 portrait format).

## Prerequisites

1. Start the dev server: `npm run dev`
2. Note the port (usually 10888 or 10889 if 10888 is in use)

## Debug Mode URLs

The app includes debug mode that allows direct navigation to specific panels with pre-populated mock data.

### Screenshot URLs

Replace `localhost:10889` with your actual dev server URL:

1. **WelcomeScreen**: `http://localhost:10889?debug=true&panel=welcome`
2. **QuizScreen (Scale Question)**: `http://localhost:10889?debug=true&panel=quiz-a&q=4`
3. **ResultsScreen**: `http://localhost:10889?debug=true&panel=results`

## Manual Screenshot Capture

### Using Browser DevTools

1. Open the URL in Chrome/Edge
2. Open DevTools (F12)
3. Click "Toggle device toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
4. Set dimensions: 600 × 1200
5. Take screenshot:
   - Chrome: Cmd+Shift+P → "Capture screenshot"
   - Or use DevTools → ⋮ menu → "Capture screenshot"

### Using Claude with MCP Puppeteer

If you have MCP Puppeteer configured, you can ask Claude to capture screenshots:

```
Please capture screenshots for VK using MCP Puppeteer:
- Navigate to http://localhost:10889?debug=true&panel=welcome
- Take 600×1200 screenshot named "1-welcome"
- Repeat for quiz and results panels
```

## Output Directory

Save screenshots to: `screenshots/output/`

Expected files:
- `1-welcome.png` - Welcome screen with rules
- `2-quiz-scale.png` - Scale question interface
- `3-results.png` - Results comparison view

## Mock Data

Mock data is defined in `screenshots/mockData.ts` with:
- **5 matches** (green): Questions where answers align
- **2 soft differences** (orange): Scale questions with small differences
- **5 dialogue topics** (purple): Questions with notable differences

This creates a balanced, visually interesting results screen.

## Debug Mode Implementation

Debug mode is implemented via:
- `src/utils/debugMode.ts` - URL parameter parsing
- `src/App.tsx` - State injection on mount
- `screenshots/mockData.ts` - Pre-populated answers

Debug mode is **development-only** and will not appear in production builds.
