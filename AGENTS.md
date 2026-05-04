# Agent Notes

## Project Overview

Zingg Web is a Create React App TypeScript project for playing the Zingg card game in a browser. The source branch is `master`; the `gh-pages` branch contains built deployment artifacts and should not be edited by hand.

The app is intentionally small and mostly client-side:

- `src/App.tsx` owns the top-level HOME/LOBBY/GAME flow.
- `src/Lobby.tsx` collects player names and game options.
- `src/Game.tsx` owns deck state, player turns, card flipping, and status-card assignment.
- `src/Card.tsx` defines `CardData`, card types, and card rendering.
- `src/CardDataList.tsx` is the canonical list of card content and imported card images.
- `src/assets/` contains card art imported by the React components.
- `public/CNAME` and `package.json` `homepage` configure the `playzingg.com` deployment.

## Branch And Deployment

- Do normal source work on `master`.
- Treat `gh-pages` as generated output from `npm run deploy`.
- If you start on `gh-pages`, switch to `master` before inspecting or editing source.
- Do not copy or patch files under `static/` from `gh-pages`; rebuild from source instead.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm start`
- Build production output: `npm run build`
- Run TypeScript compile: `npm run compile`
- Run style checks: `npm run check`
- Run tests in a one-shot/non-watch mode: `CI=true npm test -- --watchAll=false`
- Deploy to GitHub Pages: `npm run deploy`

The project uses older dependencies: React 16, `react-scripts` 3, TypeScript 3.x, Bootstrap 4, Reactstrap, Material UI 4, and GTS 2. Avoid opportunistic major upgrades unless the task explicitly calls for dependency modernization.

## Coding Conventions

- Prefer small, local changes that match the existing class-component and functional-component mix.
- Keep card data changes centralized in `src/CardDataList.tsx`; add new images to `src/assets/` and import them there.
- Use `CardType.ACTION`, `CardType.STATUS`, and `CardType.INTERRUPT` consistently so `Game.tsx` behavior stays correct.
- Use `VirtualMode.UNSET`, `VirtualMode.VIRTUAL`, or `VirtualMode.LIVE` to control whether cards appear in both, virtual-only, or live-only games.
- Keep the 12-player limit and status-card click flow in mind when touching game state.
- The layout relies on Bootstrap rows/cols plus fixed-width CSS in `src/App.css` and color utility classes in `src/Colors.css`; check the rendered app after UI changes.
- This repo has some legacy style quirks (`var`, loose equality, anchors used as buttons, fixed IDs in repeated markup). Do not churn them broadly unless a task is specifically about cleanup.

## Verification Guidance

For code changes, run the narrowest useful checks first. At minimum, prefer:

1. `npm run compile`
2. `npm run check`
3. `CI=true npm test -- --watchAll=false`

For UI or gameplay changes, also run `npm start` and manually exercise the home, lobby, and game flows with at least two players and both virtual/live modes when relevant.

## Content Notes

The card text is part of an adult drinking-game experience. Preserve the existing product voice when editing card content, but avoid introducing unrelated offensive material or changing rules casually.
