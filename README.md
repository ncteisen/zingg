# Zingg

Play at [playzingg.com](https://playzingg.com). The paper game is available on [The Game Crafter](https://www.thegamecrafter.com/games/zingg).

## Development

Use a Node.js LTS release supported by the locked Vite version (CI uses `lts/*`).

```sh
npm ci
npm start
```

`npm run validate` runs TypeScript, ESLint, and the Vitest suite. The TypeScript check covers application source, Vite configuration, and the art review components. `npm run build` creates `dist/`; `npm run preview` serves that production build locally.

## Gameplay and saved progress

Classic mode supports 2–12 players, with in-person or video-call cards. Pass-the-phone mode uses the in-person deck without a roster. A and B intentionally reveal the same next card.

After the final card, the game pauses at “Deck exhausted!” Choose “Reshuffle and continue” to shuffle a fresh deck and continue with the next player.

Use “Switch mode” to choose or resume either game. Classic setup and both game snapshots are kept independently in the version 3 save envelope under `zingg-game-state-v1`; version 1 and 2 saves remain readable. Screen width only selects the default landing page for a fresh session. Reset clears both modes. If browser storage fails, play continues in memory and a notice explains that progress may be lost on reload.

## Search discovery

The production build pre-renders the existing desktop and phone landing components into `dist/index.html`. Crawlers can read the real page without executing JavaScript; the client replaces the shell and restores saved games normally. The temporary server bundle is removed after building and is never deployed.

`how-to-play/index.html` is a separate static guide at `/how-to-play/`, built as a second Vite entry so direct visits and reloads work on GitHub Pages without a client-side routing fallback. It uses the shared site styles plus `src/HowToPlay.css` and requires no application JavaScript. Only the desktop and phone home footers opt into its link; the lobby and gameplay do not show it.

`index.html` owns the homepage search title, description, canonical URL, social previews, and WebSite/WebApplication structured data. The guide has its own metadata and WebPage structured data. Keep these factual and consistent with the game. `public/sitemap.xml` lists both canonical pages, and `public/robots.txt` permits crawlers (including search assistants) and advertises that sitemap. No special AI-specific file is required for Google Search or its AI features: https://developers.google.com/search/docs/appearance/ai-features.

After deployment, submit `https://playzingg.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools, then request homepage indexing. Those account actions are separate from the build; metadata and crawlability improvements do not guarantee rankings or AI recommendations.

## Deployment

Work on `master`. `.github/workflows/deploy.yml` validates and builds pull requests; pushes to `master` also deploy `dist/` to GitHub Pages. The workflow can also be dispatched manually. The repository's GitHub Pages settings are the source of truth for the custom domain, `playzingg.com`; custom Actions deployments ignore the `CNAME` file. `public/CNAME` retains the single canonical domain for reference. Do not edit generated artifacts or the historical `gh-pages` branch by hand.
