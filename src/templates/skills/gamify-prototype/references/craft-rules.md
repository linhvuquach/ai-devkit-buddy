# Craft rules — what kills the "AI-generated" look

These came from a real rejection ("too generic / AI-generated feel") and the redesign that
passed. Treat them as acceptance criteria and audit against them.

## Banned outright

- Emoji anywhere in UI (icons are inline SVG).
- Marquee/ticker text, confetti dots, random particle bursts.
- Purple-nebula / vaporwave gradients; any color outside the variant's token table.
- `>>>` or `//` decorative prefixes on section headers — use a small colored rule/block instead.
- Ghost-outline neon buttons for primary CTAs — primary buttons are **solid**, confident.
- Everything-centered layouts. Anchor headlines left against the image's negative space.

## Budgets (per screen, count them)

- **≤ 1 glow.** Tight (`0 0 12px` at ≤ 35% opacity), never 40px halos. Decide which single
  element earns it (XP fill *or* streak widget — not both).
- **≤ 1 hot-accent element** (the "power" red/orange). A period, a live dot, a PR number.
- 1 hero image treatment per screen; everything else is flat panel.

## Texture & finish

- **Film grain** on every screen: inline SVG `feTurbulence` data-URI tile at 4–6% opacity,
  `pointer-events:none`, above everything. This single overlay de-plastics the whole UI.
- Panels get a *material*: chamfered "system window" corners (clip-path), riveted plates
  (inset shadows + corner dots), forged metal (gradient + 1px bevel edge + engraved text via
  dark text with a light 1px text-shadow). Pick one material per variant.
- Progress bars get a *fill language* per variant: gradient beam, hazard stripes
  (repeating-linear-gradient), heat gradient. Never default browser-looking bars.
- Numbers use the condensed display stack at 48–96px; labels stay 9–11px uppercase with wide
  tracking (0.14–0.24em). The size gap between them is the aesthetic.

## Imagery

- Grade every image into the palette: duotone (saturate/contrast filter + multiply-blend tint
  overlay), sepia for warm themes, blur+dim for backdrops.
- Type never sits on raw image — always a scrim gradient into the background color.
- Light direction in the image decides layout: anchor text in the image's darkness.

## Motion

- Entrances: 300–500 ms fade+rise, staggered 80–120 ms. Celebration accents: pop-in with
  overshoot (`cubic-bezier(0.2,1.4,0.4,1)`), stamp-in (scale 1.8→1 with slight rotate),
  bar grows 700 ms ease-out, bevel sweep 800 ms.
- Ambient loops allowed only when meaningful: slow ray rotation, 1.2 s opacity pulse on a live
  dot. No infinite bouncing.
- `prefers-reduced-motion`: remap entrance animations to opacity-only fade; kill flash/shock
  overlays entirely (`animation:none; opacity:0`) so nothing sticks visible.

## Self-review question

Screenshot each screen mentally against the reference image: *same world, same lighting?*
If a screen would look at home in a crypto-landing-page template, redo it.
