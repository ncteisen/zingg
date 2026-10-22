# Zingg codebase sweep — October 22, 2026

**Follow-up:** the fourteen findings below have local fixes and regression coverage. See [fixes and verification](./2026-10-22-fixes.md). This audit remains a historical record of the original source snapshot; its original line references and measurements describe that snapshot. The larger improvement backlog remains deferred.

Audited source: `master` at `6e5a0188ab8d19caf43a3b563c67b443253a40ff`. The checkout was clean before this audit. This deliverable adds documentation and browser screenshots only; application behavior, dependencies, and deployment were not changed.

## Assessment

The core game is in good shape. The strongest parts are explicit deck exhaustion, preservation of two independent games, legacy deck compatibility, storage-failure handling, and the small static deployment. All 118 existing tests, TypeScript, lint, and the production build pass. The visual system is consistent, and the tested phone screens fit at 320px and 390px.

The highest-value work is targeted: preserve healthy data during save recovery, repair ordinary gameplay focus, handle incompatible player setups, update vulnerable development dependencies, and isolate analytics failures. The prototype has a real double-tap issue. There is no finding here that calls for a framework rewrite, backend, accounts, or a replacement design system.

Fourteen findings follow, with additional opportunities kept separate. No P0/P1 issue was established within this review. P2 means worthwhile near-term correctness, accessibility, or hardening work; P3 means a narrower edge case, usability issue, or maintenance correction. Dependency advisory severity is reported separately from application priority.

## Scope and evidence

Reviewed the application components, persistence and migrations, all card definitions and minigame pools, CSS, tests, analytics, HTML/manifest, build configuration, GitHub Actions, authoring tools, and project documentation. Inspected the generated build and checked public deployment responses read-only.

| Check | Result |
| --- | --- |
| `npm run compile` | Pass |
| `npm run lint` | Pass |
| `npm test` | 8 files, 118 tests pass |
| `npm run build` | Pass; 106 transformed modules |
| Additional temporary core reproduction tests | 8 pass, outside the repository |
| Additional temporary minigame reproduction tests | 4 pass, outside the repository |
| Throwing analytics provider experiment | Both game modes fail before updating state; missing-provider control passes |
| Expanded tooling TypeScript check | One error in excluded `vite.config.ts`; see F12 |
| Lockfile dependency audit | 11 affected development packages; zero production dependency findings |
| Live public routing | HTTPS apex 200; HTTP apex and HTTPS `www.playzingg.com` redirect to HTTPS apex |

Actual browser exercise covered two-player classic live and virtual games; adding trimmed names and rejecting duplicates; A/B reveal and turn advancement; mobile reveal and reload; switching/resuming games; reset Tab/Shift+Tab/Escape handling; the hidden playtest menu; Undercover role handoff and exit confirmation; Identity Crisis countdown, landscape reveal, and nested-dialog return focus; and On Your Frequency rapid taps.

Browser dimensions included 1280px desktop, 320×568 and 390×844 portrait, and 740×390 landscape. These are local in-app browser checks, not physical iPhone, Android, VoiceOver, TalkBack, or a full browser-matrix certification. Exhaustion, legacy-save combinations, and denied-storage paths were exercised by tests rather than manually playing every deck to completion. Performance figures below are build measurements, not field Core Web Vitals or throttled-network benchmarks. Live checks establish public reachability, not a new release verification.

## Findings

### F01 · P2 · Recovering one damaged game discards the other healthy game

**Evidence:** [App.tsx:310](/Users/ncteisen/git/zingg/src/App.tsx:310), [App.tsx:360](/Users/ncteisen/git/zingg/src/App.tsx:360), [App.tsx:385](/Users/ncteisen/git/zingg/src/App.tsx:385). Reproduced with temporary tests.

The loader validates the two snapshots, but an invalid active snapshot returns an entirely fresh app state. That drops the valid other-mode snapshot, roster, unfinished input, and preferences. The next ordinary action persists the reset envelope. A malformed unrelated field can also reject the entire envelope before the mobile snapshot is considered.

**Reproduce:** save valid classic and mobile sessions in a version 3 envelope, set the active classic `deck_idx` to an out-of-range value, reload, then choose mobile. The UI offers Start instead of Resume. The reverse case also fails. A real historical compatibility edge exists too: older code accepted whitespace-only names, and an otherwise usable old mobile save with that roster is now discarded.

**Action:** validate and recover each snapshot independently. Retain valid options and the healthy mode; route the damaged mode to setup with a recovery notice. Keep damaged data available until recovery is resolved where practical. Do not silently drop players when repairing old names.

**Acceptance:** both directions of partial corruption preserve the healthy game byte-for-byte; invalid classic names do not discard a valid mobile game; the UI explains what was recovered; valid version 1/2/3 saves retain their existing behavior.

### F02 · P2 · Card transitions lose keyboard focus

**Evidence:** [Game.tsx:270](/Users/ncteisen/git/zingg/src/Game.tsx:270), [MobileGame.tsx:128](/Users/ncteisen/git/zingg/src/MobileGame.tsx:128). Confirmed in a real browser in both modes.

Revealing a card removes the focused choice button without transferring focus. After pressing Enter on classic Flip card A or mobile Card B, `document.activeElement` is BODY. The next Tab returns to the Zingg logo. The newly revealed card also has no deliberate announcement/focus destination. Next-player transitions similarly replace controls.

**Action:** focus a public card heading or appropriate turn heading after transitions; provide concise turn/card announcements where useful. Preserve selectable rules and normal Tab order. Never put private minigame answers into automatic live announcements.

**Acceptance:** complete several turns using only the keyboard without returning through the header; announced/focused content matches the current card and player; exhaustion/reshuffle also receives an intentional destination. Test actual browser focus, not only jsdom.

### F03 · P2 · Undercover is dealt to a two-player game it cannot support

**Evidence:** [Lobby.tsx:23](/Users/ncteisen/git/zingg/src/Lobby.tsx:23), [GamePersistence.ts:56](/Users/ncteisen/git/zingg/src/GamePersistence.ts:56), [Undercover.tsx:127](/Users/ncteisen/git/zingg/src/Undercover.tsx:127). Reproduced with a catalog/component test; browser setup confirmed the 3–12 range.

Classic live mode supports two players. Deck selection only considers live/virtual eligibility, so it includes Undercover, whose setup starts at three players. The pair must skip the card or invent another player. The card itself does not identify the minimum.

**Action:** introduce minimum-player eligibility or a contextual skip for known two-player classic games, and label Undercover as 3+ players. For rosterless mobile play, make the limitation clear and allow a straightforward skip. Preserve saved-deck order and turn accounting; avoid solving this by silently changing the game's rules.

**Acceptance:** a two-player classic game never requires a nonexistent third participant; existing saves resume safely; 3–12-player rounds and rosterless play still work.

### F04 · P2 · Development tooling has patchable dependency advisories

**Evidence:** live `npm audit --json --package-lock-only` and `npm audit --json --package-lock-only --omit=dev` on the audited lockfile.

The full audit reports 11 affected packages: 7 high, 3 moderate, 1 low, and zero critical. Every affected package is a development dependency. The production-only audit reports zero findings. This does not establish a vulnerability in the deployed static site.

| Locked package | Version | Registry severity |
| --- | --- | --- |
| Vite | 8.0.10 | High |
| Vitest | 4.1.5 | Moderate |
| `@vitest/mocker` | 4.1.5 | Moderate |
| `@babel/core` | 7.29.0 | Low |
| `baseline-browser-mapping` | 2.10.27 | Moderate |
| `brace-expansion` | 5.0.5 | High |
| `browserslist` | 4.28.2 | High |
| `nanoid` | 3.3.12 | High |
| `postcss` | 8.5.13 | High |
| `source-map-js` | 1.2.1 | High |
| `undici` | 7.25.0 | High |

All report an available fix. Vite's relevant advisory lists 8.1.6 as patched on the 8.1 release line and describes additional exposure conditions involving a network-exposed dev server and particular paths. This repository does not expose the dev server to the network by default. The Vitest mock-registration fix is backported to 4.1.12; the advisory is not proof that this project's ordinary jsdom run is exploitable. Sources: [Vite advisory](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22), [Vitest advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-qxg6-89mg-rqv8).

**Action:** perform a targeted compatible tooling/lockfile refresh, inspect the diff, and rerun both audits plus validation/build. Avoid an indiscriminate major-version upgrade. Add routine dependency monitoring. Recheck advisories at implementation time because these results are time-specific.

### F05 · P2 · A throwing analytics provider can block gameplay

**Evidence:** [analytics.ts:20](/Users/ncteisen/git/zingg/src/analytics.ts:20), [Game.tsx:167](/Users/ncteisen/git/zingg/src/Game.tsx:167), [MobileGame.tsx:98](/Users/ncteisen/git/zingg/src/MobileGame.tsx:98).

The helper safely handles absent Umami but does not isolate synchronous exceptions from `umami.track`. Many handlers call tracking before updating state. A controlled experiment using the actual transpiled Game/MobileGame components and a throwing tracker produced zero state updates: the card remained face-down. Player add/start/reset paths have the same ordering pattern. No evidence was found that the production provider currently throws.

**Action:** make the centralized tracking helper best effort, so provider failures cannot prevent local actions. Retain the existing metadata-only payloads and playtest suppression.

**Acceptance:** missing and synchronously throwing trackers both allow add/start/reveal/advance/reset. Handle rejected promises too if the provider integration returns them, without introducing unhandled rejections.

### F06 · P2 · Double taps skip phases in On Your Frequency

**Scope:** playtest prototype only; it remains outside the production deck.

**Evidence:** [Wavelength.tsx:81](/Users/ncteisen/git/zingg/src/Wavelength.tsx:81), [App.css:224](/Users/ncteisen/git/zingg/src/App.css:224). Real-browser reproduction at 390×844 and a component reproduction.

Double-clicking Hide & pass immediately produced Guess locked at the default middle value; the group never adjusted the slider. Separately, Lock guess and Reveal reuse the same DOM button, so a second immediate click reveals the answer. The phase action remains in the same bottom area.

**Action:** guard new phase actions against the previous pointer sequence or use a short transition lock, following the existing [Undercover reveal guard](/Users/ncteisen/git/zingg/src/Undercover.tsx:171).

**Acceptance:** a double tap on Hide & pass reaches only the editable guess phase; a double tap on Lock guess reaches only the locked phase; deliberate subsequent input works with mouse, touch, and keyboard.

![After one double-click on Hide & pass, the default guess is already locked.](/Users/ncteisen/git/zingg/docs/audits/2026-10-22/frequency-double-tap.jpg)

### F07 · P2 · Categories directs mobile players to a nonexistent roster

**Evidence:** [CardDataList.tsx:283](/Users/ncteisen/git/zingg/src/CardDataList.tsx:283), [MobileGame.tsx:158](/Users/ncteisen/git/zingg/src/MobileGame.tsx:158).

The shared Categories card tells the group to use the player order at the top of the screen. Pass-the-phone has no roster. Classic's responsive layout also makes the positional wording fragile.

**Action:** agree on mode-neutral ordering, or render contextual instructions. A candidate is going clockwise from the reader for in-person play while keeping the roster for virtual/classic play. This requires a small intentional rules decision, not an incidental copy rewrite.

**Acceptance:** the rules are executable in rosterless mobile, classic live, and classic virtual sessions without referring to missing UI.

### F08 · P3 · Quiz Bowl has a stale factual example

**Evidence:** [CardDataList.tsx:520](/Users/ncteisen/git/zingg/src/CardDataList.tsx:520).

The clue says there was only one president to serve two nonconsecutive terms, and contains “server” instead of “serve.” The premise is now false: both Cleveland and Trump have held nonconsecutive terms. [Architect of the Capitol](https://www.aoc.gov/what-we-do/programs-ceremonies/inauguration).

**Action:** use “the first president to serve two nonconsecutive terms” if Cleveland is intended, or replace the example with an evergreen question. Consider giving the host answers for factual examples. Check the surrounding examples during the same narrow copy pass.

### F09 · P3 · Restored names bypass current roster rules

**Evidence:** [App.tsx:288](/Users/ncteisen/git/zingg/src/App.tsx:288), [PlayerName.ts:1](/Users/ncteisen/git/zingg/src/PlayerName.ts:1), [Lobby.tsx:85](/Users/ncteisen/git/zingg/src/Lobby.tsx:85). Reproduced.

Restore checks that names are nonblank strings but does not trim them or enforce case-insensitive uniqueness. Historical versions permitted combinations such as `Alex` and ` alex `. A malformed save containing exact duplicates also produces identical React list keys and can start a duplicate-name game. Normal new UI entry correctly rejects duplicates.

**Action:** define a migration/repair policy for legacy names. Update `names` and the matching saved player records together; preserve indexes/order and ask for a rename when normalization creates a collision. Combine with F01 so repair never wipes unrelated mobile progress.

### F10 · P3 · Returning home forgets the selected mode

**Evidence:** [App.tsx:38](/Users/ncteisen/git/zingg/src/App.tsx:38), [App.tsx:323](/Users/ncteisen/git/zingg/src/App.tsx:323), [App.tsx:571](/Users/ncteisen/git/zingg/src/App.tsx:571). Reproduced; browser also returned to Shared screen after mobile play.

Home always initializes its radio selection to classic, and restoring HOME derives classic mode regardless of the saved `playMode`. A mobile-only session therefore returns to a Start game action even though it has progress ready to resume. Selecting Pass the phone still resumes correctly; this is not data loss.

**Action:** use the existing app-level mode to control the chooser and preserve it on restore. Keep the intentional phone-first default for genuinely fresh sessions.

### F11 · P3 · A stale second tab can resurrect a reset game

**Evidence:** [App.tsx:405](/Users/ncteisen/git/zingg/src/App.tsx:405), [App.tsx:434](/Users/ncteisen/git/zingg/src/App.tsx:434), [App.tsx:553](/Users/ncteisen/git/zingg/src/App.tsx:553).

Reproduced with two mounted app instances sharing storage: both load a game; A resets; B flips its still-open card; B writes the old roster/deck back. The next reload restores that game. Whole-envelope writes can also overwrite newer progress in the other mode. This requires concurrent tabs and is not a normal single-tab failure.

**Action:** choose an explicit ownership/revision policy. Listen for external storage changes and offer reload or an intentional decision to keep the local game before overwriting. A revision counter alone needs a defined conflict response; silently merging decks is unsafe.

### F12 · P3 · The compile check excludes a configuration type error

**Evidence:** [tsconfig.json:26](/Users/ncteisen/git/zingg/tsconfig.json:26), [vite.config.ts:1](/Users/ncteisen/git/zingg/vite.config.ts:1).

Only `src` is included in the normal TypeScript check. Explicitly checking tooling files produces TS2769 at `vite.config.ts:7`: the `defineConfig` imported from Vite does not recognize the `test` property. Runtime build/tests still work. The art TSX files passed the expanded check.

**Action:** add a tooling TypeScript project/check and use the appropriate Vitest configuration typing. Follow the installed-version guidance in [Vitest configuration docs](https://vitest.dev/config/). Avoid hiding the error with `any`.

### F13 · P3 · Domain files and documentation contain misleading leftovers

**Evidence:** [public/CNAME:1](/Users/ncteisen/git/zingg/public/CNAME:1), [index.html:18](/Users/ncteisen/git/zingg/index.html:18), [README.md:26](/Users/ncteisen/git/zingg/README.md:26).

CNAME has two entries, including the typo `www.playzing.com`; the analytics hostname allowlist repeats the typo. README implies CNAME controls the current deployment. GitHub documents that custom Actions deployments ignore CNAME, while branch deployments accept one domain. [GitHub custom-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages).

There is no observed routing outage: the apex works, and the correct www hostname redirects to it. Consequently, the allowlist typo is not currently proven to lose visits.

**Action:** document Pages settings as the deployment source of truth, normalize/remove the stale CNAME artifact as appropriate, and correct the analytics allowlist. Verify redirects after any future domain change. [Umami hostname configuration](https://docs.umami.is/docs/tracker-configuration).

### F14 · P3 · Two virtual rules assume multiple people share a camera

**Evidence:** virtual RPS at [CardDataList.tsx:335](/Users/ncteisen/git/zingg/src/CardDataList.tsx:335) and Day at the Races at [CardDataList.tsx:422](/Users/ncteisen/git/zingg/src/CardDataList.tsx:422).

These rules require two players on the same camera. A valid call with one person per camera cannot follow them literally.

**Action:** define an all-remote variant or explicitly allow skipping when no shared camera exists. Include this case in content playtesting; it is a rules compatibility issue, not a runtime crash.

## Improvement backlog

These are proposals with a concrete benefit, not claims of broken current behavior.

| ID | Improvement | Why / smallest useful action | Size |
| --- | --- | --- | --- |
| I01 | Add a small real-browser CI suite | Cover card focus, two-mode resume, reset/nested dialogs, 320px layout, and rapid taps. The jsdom dialog mocks cannot prove browser top-layer behavior. | M |
| I02 | Make shared links look intentional | Add Open Graph title/description/image, canonical URL, and suitable social-card metadata in `index.html`; verify actual messaging-app previews. | S |
| I03 | Add a lightweight share action | Offer sharing/copying `playzingg.com` from a natural pause or home. Test whether more players become hosts; avoid accounts or intrusive prompts. | S–M |
| I04 | Document and tighten useful analytics | Define started versus resumed sessions; add deck completion/reshuffle and comparable minigame lifecycle events only where they answer a product question. Preserve counts/modes/card titles, never player names or secrets. | S–M |
| I05 | Persist Undercover's no-repeat pool across visits | Its 80-word picker currently resets on component remount. Reuse the identity-history pattern if repeat sessions show this matters; consider the same choice for 24 Frequency scales. | M |
| I06 | Clarify minigame escape routes | Identity Crisis could offer “Nobody knows this person” while keeping the name consumed. Playtest timeouts/stopping rules for Rank & Tell and repeated Undercover ties before changing content. | S |
| I07 | Make the toolchain reproducible | Replace CI's floating `lts/*` with an agreed supported major shared by a local version declaration. Consider SHA-pinned Actions plus automated updates. | S |
| I08 | Verify the deployed build after Actions finishes | Add bounded read-only checks for HTML, manifest, and exact hashed JS/CSS assets; a generic 200 response can be an older build. | S–M |
| I09 | Explore offline reopening | A manifest exists but there is no service worker. Cache the shell and needed card art only if poor reception is a demonstrated use case; include update, rollback, storage-pressure, and stale-asset tests. | M–L |
| I10 | Add stable card IDs before major catalog editing | Index-based saves require append-only ordering and historical length lists. IDs plus explicit migrations would permit safe retirement/reordering later. Keep the current scheme until that benefit justifies migration risk. | L |
| I11 | Improve art-tool reproducibility | `art/prepare-assets.mjs` checks modification times only. Add `--force` or a source/recipe fingerprint so changed encoding settings reliably regenerate outputs. No mismatched shipped image was found. | S |
| I12 | Small maintenance/copy pass | Remove render logs and unused `Game.buttonText`; type image imports as strings; update art counts; fix “Chose,” “Everyone decide on the who,” and “server.” Avoid broad legacy-style churn. | S |

Sizes are relative scope estimates: S is a narrow change; M crosses a few flows or needs browser coverage; L includes migration/update design. They are not elapsed-time commitments.

Further observations:

- The hidden playtest is eagerly imported by [Brand.tsx:2](/Users/ncteisen/git/zingg/src/Brand.tsx:2). Lazy-loading it could keep future prototypes out of startup JS, but the current 82 kB gzipped bundle is already modest. Measure before restructuring.
- All navigation currently uses in-memory screen state, not browser history. Consider Back-button semantics if user sessions show confusion; preserve both snapshots if adding history integration.
- Long mobile cards require vertical scrolling. At 320×568 the sticky Next player bar overlays part of the scrollable card view; the rest remains reachable. Test large text and focus visibility before changing the layout. No horizontal overflow was measured in the checked screens.
- `Colors.css` is a legacy palette while current design tokens live in `App.css`, contrary to part of AGENTS.md. Reconcile documentation and remove unused styles only after checking authoring pages too.
- Exact art totals in `art/README.md` are stale, and its opening breakdown is also inconsistent. Generate counts or avoid fragile arithmetic in prose.
- The preserved art masters are valuable source assets. Their checkout size does not justify deleting them for website performance.

## What to preserve

- A and B intentionally reveal the same next card.
- Exhaustion is explicit and persisted; reshuffling requires an action and preserves classic player order/next turn.
- The existing Fisher–Yates shuffle and saved-deck validators reject duplicate/missing/wrong-mode/out-of-range entries. Zero/one-player classic games and FRONT with no selected side are rejected safely.
- Legacy coverage exercises versions 1, 2, and 3 across 64–68-entry historical catalog boundaries in live, virtual, and mobile modes. New cards join on reshuffle.
- Elephant removal preserves existing deck order, skips without consuming another player turn, and handles final-card exhaustion.
- Healthy classic/mobile saves and unfinished lobby settings survive switching/resizing. Storage failures keep in-memory play usable and show a notice.
- Reset focus trapping and Escape return focus worked in the browser. Undercover/Identity Crisis native dialogs returned focus to their triggers.
- Minigame secrets are omitted from the countdown/handoff DOM and kept out of live regions; focus targets public controls/headings. Backgrounding has explicit secret-hiding paths. Those backgrounding paths are covered by code/tests rather than physical-device app-switch testing here.
- Identity Crisis reserves a name on Start, including cancelled/playtest rounds, and keeps history in that browser profile's local storage across card visits and sessions. Playtest preserves deck snapshots but intentionally updates this identity history. This is ordinary screen secrecy, not protection against a person inspecting local storage.
- Analytics payloads reviewed use gameplay metadata rather than player names or selected secret words. The hidden playtest suppresses its gameplay tracking.
- On Your Frequency stays out of `CardDataList` until approved after playtesting.
- Preserve the cream/paper, warm-ink visual system, small client-side architecture, and existing adult voice.

## Inventory and performance baseline

| Item | Measured value |
| --- | --- |
| Tracked files before report | 287 |
| Catalog entries / distinct titles | 69 / 63 |
| Eligible live / virtual entries | 60 / 45 |
| Identity / Undercover / Frequency pools | 210 identities / 80 words / 24 scales |
| Production output | 74 files; 2,727,145 bytes |
| Main JavaScript | 261,784 bytes; 82.01 kB gzip |
| Main CSS | 26,745 bytes; 6.26 kB gzip |
| Delivery WebPs | 64; 2,396,738 bytes total |
| Art source tree | 74,395,432 bytes; absent from production output |

The six duplicate card titles are intentional live/virtual variants. The 64 WebPs include the Frequency prototype illustration; every delivery WebP has a source import. The image total is the entire asset set, not the landing-page transfer size. Images load when their rendered elements request them; importing their URLs does not mean all image bytes arrive on startup. There are no downloaded fonts and no backend/runtime package layer beyond React and React DOM in this repository. No broad performance rewrite is justified by these build figures.

## Suggested execution order

1. **Tooling patch PR:** F04 and F12. Update compatible tooling, typecheck configuration, and rerun audits/checks.
2. **Gameplay reliability PR:** F01 and F05, with focused failure/recovery tests. Handle F09 alongside recovery if legacy-name migration is included.
3. **Accessibility PR:** F02 plus the relevant real-browser checks from I01. Verify screen-reader behavior on a real device before claiming that coverage.
4. **Content compatibility PR:** F03, F07, F08, F14 and narrowly scoped typos, after settling ordering/minimum-player rules.
5. **Playtest/usability PR:** F06 and F10; retain Frequency's prototype status.
6. **Maintenance follow-up:** F13, I07/I08/I11/I12. Treat F11 concurrency and I10 stable IDs as separately designed work if usage warrants them.
7. **Product experiment:** I02/I03, then measure host return and sharing before investing in offline support or larger feature systems.

Each implementation can remain local for review. Committing, pushing, and deploying are separate decisions from this audit.

## Evidence files

- [Desktop classic game](/Users/ncteisen/git/zingg/docs/audits/2026-10-22/classic-desktop.jpg)
- [320px pass-the-phone card](/Users/ncteisen/git/zingg/docs/audits/2026-10-22/mobile-320.jpg)
- [390px pass-the-phone card after reload](/Users/ncteisen/git/zingg/docs/audits/2026-10-22/mobile-390.jpg)
- [Frequency after the double-tap reproduction](/Users/ncteisen/git/zingg/docs/audits/2026-10-22/frequency-double-tap.jpg)
- [Identity Crisis landscape reveal](/Users/ncteisen/git/zingg/docs/audits/2026-10-22/identity-landscape.jpg)

Temporary reproduction suites were run from `/private/tmp/zingg-core-audit` and `/private/tmp/zingg-minigame-audit.V5luSu`, keeping the application test suite unchanged. These temporary paths are not durable project dependencies. Reproduction scenarios and acceptance criteria above are the durable record.
