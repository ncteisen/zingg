# Zingg: warm ink, dry jokes

Approved direction, September 28, 2026. The user approved pass 3 and the brand concept. The actual app now follows this direction; `../DESIGN.md` is the current design system and `deck.html` reviews the complete deck. The notes below retain the original study rationale and its verification.

## User direction

- Version 1's warm ink is preferred to version 2's exaggerated mischief.
- Make the images funnier through clever, subtle visual gags.
- A little crude and raunchy, communicated through implication.
- Aim for a small laugh on first encounter.
- Inspiration: [Wellp, as linked by the user](https://www.reddit.com/r/DrinkingGames/comments/1jbp5a/wellp_the_custom_card_game_ive_been_playing_and/), and internet / Reddit / 4chan party games. The creator describes homemade notebook cards, raunchy found imagery, and a later edit toward clearer rules. Our interpretation is informal adult humor with legible play; these are original illustrations, not reproductions of its cards. The Reddit post was read; the linked image archive did not yield a usable visual preview.
- Carry the chosen direction into the overall UI as one brand system.

## Creative principle

A respectable little drawing with one questionable detail. The gag belongs in the relationship between objects, a failed intention, or an implication. An enormous grin is not a substitute for a joke.

Use the card title and artwork together: the title supplies the premise; the art adds a second meaning or a small contradiction. Keep the written gameplay rules unchanged. Not every card needs innuendo, and not every inanimate object needs a face.

## Visual language

Keep warm brown ink and broad flat color from version 1. Limit each illustration to a small palette. Use restrained grain inside shapes, clean transparency outside, and a compact silhouette. The punchline must survive the thumbnail test. One strong wrong detail is enough.

## UI direction

- Paper: quiet, nearly neutral warm cream, rather than a large yellow gradient.
- Ink: the same warm dark brown as the illustration outlines.
- Accents: muted brick for the primary forward action; mustard for small active states; blue/green/coral used deliberately for card type.
- Type: a compact, confident serif wordmark and card titles; plain readable sans-serif instructions; small monospace labels only where they help.
- Borders: a consistent modest ink weight. Short offset shadows provide a printed-card feeling without making every panel shout.
- Art: give the image the center of the card, unboxed. Remove the dashed picture frame and decorative gradient behind it. Increase useful artwork size so the small visual joke is legible.
- Controls: keep clear names such as Start game, Hint, and Next player. Maintain 44px targets and visible keyboard focus.
- Copy: dry and brief. Put an occasional joke in secondary copy; keep instructions and navigation literal.
- Motion: restrained. Hint overlays stay out of layout; no shifting cards or controls.

## Review scope

The art review offers all previous versions plus pass 3. Independent artwork and card-style controls make comparisons possible. A scoped, interactive home and sample-round preview demonstrates the proposed shared card, button, color, and typography system using the real Card component. Its four sample cards and sample players are local component state, not a game engine. The production game, roster behavior, saved games, and card rules are unchanged by this art study.

## Acceptance before rollout

The same joke should read at phone size and at a shared-screen distance. Verify the art on cream, the controls at 320px, the hint overlay without reflow, and keyboard focus. Keep prompt versions and original generated masters. Select and optimize assets only after the direction is settled.

## Local verification

- Compile, lint, 50 tests, production build, and separate TypeScript check of the review entry passed.
- Art review checked at 1280px and 320px with no horizontal overflow. All four images load.
- Current UI / brand styling and warm-ink / pass-3 comparisons switch independently.
- Hint at 320px: card remained 284 × 552.75px; the overlay fits the viewport, focuses Close hint, closes on Escape, and returns focus to Hint.
- Concept home and sample round fit at 320px. Shared-screen Next player advances the example player and artwork; phone mode shows its own turn label and Next card control.
- Preview state remains separate from the actual app and saved games.
