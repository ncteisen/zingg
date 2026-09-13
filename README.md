# Zingg

Play at [playzingg.com](https://playzingg.com). The paper game is at [getzingg.com](http://www.getzingg.com).

## Development

Use a Node.js LTS release supported by the locked Vite version (CI uses `lts/*`).

```sh
npm ci
npm start
```

`npm run validate` runs TypeScript, ESLint, and the Vitest suite. `npm run build` creates `dist/`; `npm run preview` serves that production build locally.

## Gameplay and saved progress

Classic mode supports 2–12 players, with in-person or video-call cards. Pass-the-phone mode uses the in-person deck without a roster. A and B intentionally reveal the same next card.

After the final card, the game pauses at “Deck exhausted!” Choose “Reshuffle and continue” to shuffle a fresh deck and continue with the next player.

Use “Switch mode” to choose or resume either game. Classic setup and both game snapshots are kept independently in the version 3 save envelope under `zingg-game-state-v1`; version 1 and 2 saves remain readable. Screen width only selects the default landing page for a fresh session. Reset clears both modes. If browser storage fails, play continues in memory and a notice explains that progress may be lost on reload.

## Deployment

Work on `master`. `.github/workflows/deploy.yml` validates and builds pull requests; pushes to `master` also deploy `dist/` to GitHub Pages. The workflow can also be dispatched manually. `public/CNAME` carries the custom domain. Do not edit generated artifacts or the historical `gh-pages` branch by hand.
