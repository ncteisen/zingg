# Zingg Design System

## 1. Product Feeling

Zingg Web should feel like a half-cleared coffee table in a college living room:
warm lamps, mismatched mugs, a suspiciously sticky deck of cards, people talking
over each other, and one friend on Zoom laughing two seconds late. It is a
little raunchy, a little insouciant, and fundamentally affectionate. The UI
should invite people into the bit, not behave like a corporate product page.

The design should be funny without getting in the way of the host who is sharing
their screen. It needs to be readable from a couch or a video call, quick to scan
between turns, and charming enough that the group wants to keep the tab open.

## 2. Visual Principles

- **Living-room warmth:** use toasted creams, amber light, couch greens, rug reds,
  and beer-gold highlights instead of stark black/white systems.
- **Playful mess, tidy controls:** panels can feel layered like coasters and note
  cards, but buttons, inputs, and game actions must stay obvious.
- **Slightly adult, never mean:** copy can wink; the interface should not become
  crude decoration.
- **Shared-screen clarity:** the current player, instruction, card choice, and
  next action must be legible at a glance.
- **A handmade table feel:** modest rotation, paper-like cards, soft shadows,
  sticker badges, and warm borders are encouraged.

## 3. Color Tokens

### Core

- **Lamp Cream** `#fff3d8`: page background and soft panels
- **Paper** `#fffaf0`: card and input surface
- **Ink Brown** `#2f2118`: primary text
- **Soft Cocoa** `#6b4a35`: secondary text
- **Coffee Line** `#d9b98f`: warm borders

### Party Accents

- **Beer Gold** `#f6b33f`: primary action and highlights
- **Hot Sauce** `#e4572e`: energetic warnings and spicy accents
- **Couch Green** `#6f9b63`: success, ready states, live-player accents
- **Rug Red** `#b9413a`: current turn and interrupt emphasis
- **Solo Cup Pink** `#f3a7b5`: friendly status accents
- **TV Glow Blue** `#6ca6c9`: virtual/Zoom cues

### Dark / Night Mode Surfaces

- **Basement Brown** `#241812`: card backs and deep panels
- **Lamp Glow** `#ffd98a`: text or art glow on dark surfaces

## 4. Typography

- **Display:** Georgia, "Times New Roman", serif. Use for the Zingg wordmark and
  big, cheeky headlines. It should feel editorial but slightly tipsy.
- **UI / Body:** Inter, system-ui, -apple-system, sans-serif. Use for controls,
  instructions, player names, and card body text.
- **Label / Badge:** Menlo, Consolas, monospace. Use sparingly for tiny stickers,
  player numbers, and card type labels.

### Type Scale

- **Hero:** 68px desktop / 44px mobile, 1.02 line-height
- **Section headline:** 42px desktop / 32px mobile
- **Card title:** 28px, medium weight
- **Instruction:** 28-34px, large enough for screen sharing
- **Body:** 16-18px, 1.5 line-height
- **Badge / label:** 11-12px uppercase

## 5. Components

### Buttons

- Rectangular with friendly 12px radius, never severe and never corporate-pill.
- Primary: Beer Gold background, Ink Brown text, warm brown border.
- Secondary: Paper background, Coffee Line border.
- Critical/next-turn action: Hot Sauce or Basement Brown when extra emphasis is
  needed.
- Buttons should look tappable from across the room.

### Cards

- Cards are paper objects: warm off-white surface, 8-12px radius, small shadow,
  slightly chunky border, and a colorful strip or sticker for card type.
- Back of card should feel like a basement-party coaster: dark brown surface,
  warm gold logo, subtle glow.
- Preserve the existing card art; it is part of the game’s handmade charm.

### Lobby

- Should feel like arranging people around a coffee table.
- Player names are little seat tags or stickers.
- Game mode toggle should make virtual play feel warm and connected, not like a
  dry settings form.

### Game Board

- Player grid should be compact and obvious.
- Current player gets a strong warm highlight.
- The instruction banner is the host’s script; make it large, warm, and funny.
- Card choices should feel like two cards sitting on the table.

## 6. Layout

- Use generous but not precious spacing. This is a party table, not a luxury
  landing page.
- Desktop should fit comfortably while screen-shared.
- Mobile should stack naturally for testing or small groups.
- Avoid dense Nike-like retail grids and avoid corporate AI-style hero panels.

## 7. Voice

Use short, friendly, mildly mischievous copy:

- “Build the table.”
- “Choose your chaos format.”
- “No refreshing. The tab is holding the brain cell.”
- “One host drives. Everyone else heckles.”

The voice should make players feel like the game has already started.
