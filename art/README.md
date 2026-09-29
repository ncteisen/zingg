# Zingg card art

The user approved **pass 3: warm ink, dry jokes**, together with its brand concept. The actual app now uses this system across home, lobby, both game modes, and all 65 cards. There are 59 distinct illustrations: four approved pilots plus 55 full-deck extensions.

The latest preference is **version 1 warm ink**, with clever visual gags and understated raunch. Version 3 returns to that rendering and gives each subject one wrong detail. The review defaults to version 3 with the proposed card styling. Original art and both earlier passes remain available, and artwork/style controls are independent.

The **Site concept** view is a separate interactive home and sample-round prototype. Try Shared screen or Pass the phone, Start game, Hint, and Next player/card. It uses four sample cards and component-local state only. `brand.css` scopes the proposal to the study; it is not imported by the production app. The proposed system and reference are recorded in `brand-direction-v3.md`.

With `npm start` running, open `/art/review.html` to compare the originals and new direction using the actual `Card` component. The review page is separate from the production game and does not touch saved games. Open each artwork link to inspect the full generated image.

## Repeatable prompt

For the current pass, use `prompts/base-v3.txt`, replace `{{subject}}` with one subject in `prompts/pilots-v3.json`, and append that file's exact `referenceInstruction`. Each of the four images was generated separately with the built-in `image_gen` tool, `transparent_background: true`, and `pilots/mind-meld-v1.png` as a style-only reference. The final prompts deliberately specify the joke and quiet acting instead of merely asking for something funnier. Previous prompt versions are retained below for reproducibility.

The subject brief specifies the visual idea; the base prompt specifies the rendering. Keep those separate when iterating. Save a new version instead of silently changing an approved prompt or replacing an original asset.

The exact style-reference addition used for the sandwich and Viking was:

> Input image 1 is a STYLE REFERENCE ONLY: match its warm ink contour weight, simplified shapes, restrained dry print texture, and palette treatment. Draw an entirely new subject from the brief. Do not copy the brains, paired arrangement, spark, or any other object from the reference unless explicitly required by the new subject brief.

All three original generated files are stored in `pilots/` as 1448 × 1086 RGBA PNGs. These are review masters, not optimized production files. Generated with the built-in `image_gen` tool, with `transparent_background: true`. `mind-meld-v1.png` was supplied as the style reference for the other two.

The version 2 sandwich and Viking use `mind-meld-v2.png` as their style reference, with this addition:

> Input image 1 is a STYLE REFERENCE ONLY. Match its expressive adult cartoon acting, asymmetric proportions, variable brush-ink lines, warm muted spot colors, and loose dry-print texture. Make the main facial expression large enough to survive thumbnail reduction. Create the new subject in the brief; do not copy any brain shapes, brain folds, paired brain arrangement, lightbulb, or other objects from the reference.

Version 2's Viking had a bright green fringe along the lower tunic edge. A targeted built-in image edit removed it; the review uses `pilots/viking-master-v2-clean.png`. The original is retained. The exact repair prompt is in `prompts/viking-v2-edge-cleanup.txt`.

## Current review findings

- The user prefers version 1's rendering over version 2's exaggerated expressions. Version 3 follows that preference; the user approved this direction for the deck and UI.
- Version 3: two brains both listening; a middle finger inside a sandwich; one limp Viking horn; an elephant with a bra on its tusk.
- The sandwich is the most immediate gag. The Viking is a double meaning. The Mind Meld listening joke is less explicit and should be judged without explanation.
- Every card uses the actual `Card` component and its stable hint overlay. The original-style comparison keeps its 130px image cap; the approved app uses a 192px unboxed art area.
- The first three subjects have three generated passes. Elephant was introduced in pass 3, so earlier selections display its original art and label that fallback.
- Version 3's Viking also needed a targeted lower-edge cleanup. Preserve the raw file and use the cleaned version for review. The exact edit prompt is `prompts/viking-v3-edge-cleanup.txt`.
- Check transparent images on cream. Alpha-channel presence alone does not rule out a colored fringe.
- These are full-resolution review masters. Optimize selected assets before a full-deck rollout and retain source masters and prompts.

## Pilot acceptance

- Recognizable and amusing at the actual card size, not only when enlarged.
- Clearly part of the same set across an abstract idea, an object, and a character.
- Actual transparent background with no rectangle, matte fringe, or clipped parts.
- No text, unwanted props, duplicate limbs, or ambiguous silhouettes.
- Similar visual weight and useful occupied area across cards.
- Works on cream at actual phone size, with no clipped parts or illegible punchline.

The original assets and exploration passes remain available for comparison.

## Complete deck and production assets

Open `/art/deck.html` with the dev server running to search the complete set and filter by card type. This gallery uses the current Card component and actual card data; it does not change saved games. `/art/review.html` retains the earlier four-card comparison and concept prototype.

- `prompts/base-v3.txt`: shared rendering and humor prompt.
- `prompts/pilots-v3.json`: four approved subjects.
- `prompts/deck-v3.json`: 55 additional briefs, import keys, and exact style-reference instruction. Replace `{{subject}}` in the base prompt and append `referenceInstruction`.
- `pilots/`: original pilot PNGs; approved Viking uses the cleaned version.
- `deck/`: 55 full-resolution transparent PNG masters.
- `repairs/`: original Force Field and Never Have I Ever outputs before targeted repairs. Corresponding exact repair prompts are in `prompts/`. Force Field needed an adult face and a clean outer outline; Never Have I Ever needed a simpler, anatomically correct crossed-fingers gesture.
- `../src/assets/deck/`: 59 delivery WebPs, 640px wide, alpha preserved; about 2.0 MiB for the complete set.

All illustration generation and semantic edits used the built-in `image_gen` tool with `transparent_background: true`. The style reference was `pilots/mind-meld-v1.png`. Originals in the tool's generated-images directory are also preserved.

Run `node art/prepare-assets.mjs` with Sharp available locally or via `NODE_PATH` to rebuild delivery copies. It only resizes to 640px and encodes WebP (quality 86, alpha quality 100), skips unchanged masters, and never paints or changes the artwork. Sharp is an authoring dependency, not a runtime dependency of the app.

`../DESIGN.md` records the approved durable UI and illustration conventions. Production deployment remains a separate action; the gallery and studies are development-only entries.
