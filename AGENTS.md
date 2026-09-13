# Agent Notes

## Project Overview

Zingg Web is a React 19, Vite 8, and TypeScript 6 project for playing the Zingg card game in a browser. The source branch is `master`. GitHub Actions builds `dist/` and deploys it to GitHub Pages. The historical `gh-pages` branch should not be edited by hand.

The app is intentionally small and mostly client-side:

- `src/App.tsx` owns navigation, independent classic/mobile game snapshots, and versioned local-storage persistence.
- `src/Lobby.tsx` collects player names and game options.
- `src/Game.tsx` owns the classic deck, player turns, and card flipping.
- `src/MobileGame.tsx` provides pass-the-phone play without a player roster.
- `src/GamePersistence.ts` validates saved decks and shuffles cards.
- `src/DeckExhausted.tsx` provides the shared end-of-deck screen.
- `src/ResetModal.tsx` owns reset confirmation and keyboard focus management.
- `src/Card.tsx` defines `CardData`, card types, and card rendering.
- `src/CardDataList.tsx` is the canonical list of card content and imported card images.
- `src/assets/` contains card art imported by the React components.
- `public/CNAME`, the Vite base path, and `.github/workflows/deploy.yml` configure the `playzingg.com` deployment.

## Branch And Deployment

- Do normal source work on `master`.
- Treat `dist/` as generated output from `npm run build`.
- Pushes to `master` validate, build, and deploy through GitHub Actions. Pull requests validate and build without deploying.
- If you start on the historical `gh-pages` branch, switch to `master` before inspecting or editing source.
- Do not copy or patch files under `static/` from `gh-pages`; rebuild from source instead.

## Commands

- Install locked dependencies: `npm ci`
- Start local dev server: `npm start`
- Build production output: `npm run build`
- Run TypeScript compile: `npm run compile`
- Run lint checks: `npm run lint`
- Run tests once: `npm test`
- Run all code checks: `npm run validate`
- Preview production output: `npm run preview`
- Deploy to GitHub Pages: push to `master`, or dispatch the deployment workflow.

The app uses React and React DOM at runtime, with Vite, Vitest, Testing Library, TypeScript, and ESLint for development. Match the existing dependency versions; avoid unrelated upgrades.

## Coding Conventions

- Prefer small, local changes that match the existing class-component and functional-component mix.
- Keep card data changes centralized in `src/CardDataList.tsx`; add new images to `src/assets/` and import them there.
- Use `CardType.ACTION`, `CardType.STATUS`, and `CardType.INTERRUPT` consistently so `Game.tsx` behavior stays correct.
- Use `VirtualMode.UNSET`, `VirtualMode.VIRTUAL`, or `VirtualMode.LIVE` to control whether cards appear in both, virtual-only, or live-only games.
- Keep the 12-player limit, trimmed unique names, and editable lobby roster intact. Status cards are tracked by players themselves; do not restore the removed assignment flow.
- A and B intentionally reveal the same predetermined card.
- After the final card, persist `DeckState.EXHAUSTED` and wait for “Reshuffle and continue” before creating a new shuffled deck. Preserve classic player order across decks.
- Switching modes or resizing must preserve both game snapshots and classic lobby options. Keep backward compatibility with version 1 and 2 saves. Storage errors must leave in-memory play usable.
- The layout uses CSS grid/flex in `src/App.css` and colors in `src/Colors.css`; verify desktop and phone layouts after UI changes.
- This repo has some legacy style quirks (`var`, loose equality, anchors used as buttons, fixed IDs in repeated markup). Do not churn them broadly unless a task is specifically about cleanup.

## Verification Guidance

For code changes, run the narrowest useful checks first. At minimum, prefer:

1. `npm run compile`
2. `npm run lint`
3. `npm test`
4. `npm run build`

For UI or gameplay changes, also run `npm start` and manually exercise the home, lobby, and game flows with at least two players and both virtual/live modes when relevant. Also verify pass-the-phone play, switching/resuming modes, reset keyboard focus, and deck exhaustion when those behaviors change.

## Content Notes

The card text is part of an adult drinking-game experience. Preserve the existing product voice when editing card content, but avoid introducing unrelated offensive material or changing rules casually.
