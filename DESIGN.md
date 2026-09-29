# Zingg design system

Approved September 28, 2026: **warm ink, dry jokes**. The app and deck share this system. The earlier visual studies remain in `art/review.html`; `art/deck.html` shows the current complete set.

## Product feeling

A homemade adult party game with enough care to make playing effortless. Clever, quietly inappropriate, and affectionate. A respectable little drawing with one questionable detail. The interface stays calm so the picture and the group can be funny.

Use the card title as the premise and one visual contradiction as the punchline. A cricket is the comedian's entire audience; a disco ball wears socks and sandals; the Viking has one limp horn. Keep acting deadpan. Innuendo is occasional, implied, and never the only joke in the deck.

## Shared visual tokens

The canonical CSS variables live in `src/App.css`.

| Role | Value |
| --- | --- |
| Page / Lamp Cream | `#f6f0e5` |
| Paper | `#fffaf0` |
| Recessed surface | `#efe6d6` |
| Ink Brown | `#2f2118` |
| Secondary / Soft Cocoa | `#715e4d` |
| Coffee Line | `#d8cbb9` |
| Primary action / Rug Red | `#ad3d33` |
| Selection / Beer Gold | `#e9b94f` |
| Action card dot / TV Glow Blue | `#6ca6c9` |
| Status card dot / Couch Green | `#6f9b63` |
| Everyone card dot / Hot Sauce | `#e4572e` |

Use Georgia for the wordmark, headlines, and card titles; system sans-serif for rules and controls; Menlo/Consolas for small labels. No font download is required. Keep labels sparse and text readable from a shared screen.

The wordmark is lowercase `zingg.` in dark ink with a brick dot. The SVG favicon is a matching `z.`. Avoid novelty fonts, gradients, decorative sticker piles, and large colored interface panels.

## Components and layout

- Buttons have a 7px radius, plain action labels, and at least 44px touch targets. Primary actions use brick, cream text, a 2px ink border, and a short offset ink shadow. Secondary actions use paper or transparent backgrounds and quiet borders.
- Cards use paper, a 2px ink outline, a 10px radius, and a short flat shadow. Type is a small colored dot plus a written label. Artwork is unboxed in a reserved area up to 192px high. Rules remain selectable HTML text, separated by one fine rule.
- Hints open in a native top-layer popover without changing card size. Opening focuses Close hint; Escape and outside clicks dismiss it. Keep the overlay inside the viewport and scroll long examples within it.
- Card backs use the dark wordmark treatment. Both choices still reveal the same predetermined card. After a reveal, center the chosen card and its next action.
- Desktop home offers Shared screen / Pass the phone and one Start or Resume action. Phone-sized first visits retain the direct pass-the-phone landing. Resizing never changes or discards an active game.
- The classic board has a compact current-turn area and real player names beside the cards. The lobby keeps editable names and explicit In person / Over video options. Phone gameplay has large A/B choices and a sticky next-player action.
- Reset, exhaustion, and storage notices use the same type, palette, and controls. Retain visible keyboard focus, reduced-motion support, and readable 320px layouts.

## Voice

Short, dry, and welcoming: “Bring your own friends.”, “A little out of line.”, “Questionable decisions. Excellent company.” Put the joke in occasional supporting copy. Navigation and gameplay instructions remain literal. Do not casually rewrite rules as part of a design pass.

## Illustration workflow

`art/prompts/base-v3.txt` defines rendering and humor. `art/prompts/deck-v3.json` contains one subject brief per new illustration, the import mapping, and the exact style-reference instruction. The four approved pilot briefs are in `art/prompts/pilots-v3.json`.

Generate one original transparent image per card concept with the built-in ImageGen tool. Use the approved warm-ink reference, compact silhouettes, simple adult proportions, muted colors, restrained grain, and one legible gag. Avoid text, meme characters, generic grins, gratuitous props, photorealism, or explicit anatomy.

Preserve full-resolution masters and prompts. Inspect every output for duplicated anatomy, clipped silhouettes, unwanted background, and colored edge fringe. Make semantic repairs in ImageGen and keep the pre-repair source. Check on cream at actual card size.

The game imports 640px-wide alpha WebP copies from `src/assets/deck/`. `art/prepare-assets.mjs` only resizes and encodes approved masters; it does not alter the drawing. Gameplay copies, card order, virtual/live eligibility, saved games, and deck exhaustion are independent of art changes.
