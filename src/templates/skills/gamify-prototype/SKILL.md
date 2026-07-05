---
name: gamify-prototype
description: Design and build gamified, interactive HTML design-prototype variants for any app topic (fitness, learning, finance, productivity…). Use when the user wants design prototypes/mockups with game mechanics (XP, levels, ranks, quests, streaks, celebration loops, sound), wants to explore multiple visual directions before native implementation, or asks to "gamify" an app's UX. Produces self-contained HTML files reviewable in a browser — no build step, no CDN.
---

# Gamify Prototype

Produce **interactive HTML prototype variants** that let a team feel a gamified product direction
in the browser and sign off before any native (SwiftUI/Kotlin/React) work. Each variant is a
distinct art direction; each file is fully self-contained (inline CSS/JS, local assets only).

## Workflow

### 1. Gather inputs (ask only for what's missing)

- **App topic + core loop** — what the user does repeatedly (log a workout, finish a lesson,
  save money). Gamification must attach to this loop, not float beside it.
- **Reference material** — screenshots of the current app, target-flow references, and any
  inspiration images/assets. **Open and study the images before designing anything**: note light
  direction, palette, mood, negative space. If a manifest file exists next to reference
  screenshots, read it for flow labels.
- **Output location** — e.g. `mockups/prototypes/`. One folder per variant, named
  `<direction-slug>-NN/` with an incrementing number (`dark-aesthetic-02`, `crimson-hud-03`).
- **How many variants** and which screens. Default screen set (3 files per variant):
  1. `phase1-celebration-loop.html` — post-action celebration sequence (5–6 tap-through steps)
  2. `phase2-dashboard.html` — home screen with identity + progression + next action
  3. `phase3-onboarding.html` — 4-step onboarding ending in an earned starting state

### 2. Define each variant's direction

For every variant, before writing HTML, fix:

- **A one-line fantasy** ("quiet training montage", "RPG system window", "industrial forge").
  Every element must serve it — this is what prevents generic output.
- **A token palette** (8–10 colors max): background, 2 panel levels, 1 line/border, 1–2 text
  tones, 1 primary accent, 1 "currency" accent (XP/points), 1 hot accent used sparingly.
- **A type voice**: system-font stacks only (no webfonts). A condensed/display stack for numbers
  and headlines; a body stack for labels. Numbers are the heroes — render them large.
- **A signature progression widget** per variant (weight-plate discs, chain links, hex calendar,
  plant growth, constellation…). Never reuse the same streak metaphor across variants.
- **Hero imagery**: pick 1–2 reference images per variant; embed by relative path with graceful
  fallback (see tech kit). Grade them into the palette with CSS filters/scrims.

Read [references/mechanics.md](references/mechanics.md) and pick mechanics that fit the app's
loop. Read [references/craft-rules.md](references/craft-rules.md) — those rules are acceptance
criteria, not suggestions; they are what keeps output from looking AI-generated.

### 3. Build

Follow [references/tech-kit.md](references/tech-kit.md) for the file skeleton, shared-block
convention, animation system, step engine, sound engines, and audit commands. Non-negotiables:

- Every file self-contained: inline CSS/JS, no CDN, no webfonts. Only local images/audio by
  relative path, each with a fallback (`background-color` + gradient scrim behind every image;
  silence if audio missing).
- A `/* ==== SHARED <ID> ==== */ … /* ==== END SHARED ==== */` CSS block **byte-identical**
  across a variant's files (tokens, frame, grain, helpers). Same for SFX/MUSIC JS blocks.
- Device frame on a dark desktop canvas, cross-links between variant files ("Prototype N/3")
  and to sibling variants, canvas notes for reviewer hints, demo toggles outside the frame.
- Fully styled default state with JS disabled; `prefers-reduced-motion` → opacity-only.
- All motion 120–800 ms except ambient loops.

### 4. Audit (evidence before claiming done)

Run the audit commands from the tech kit: shared-block shasums, palette-only color grep, emoji
grep, `node --check` on extracted scripts, glow/hot-accent budget count, asset-path existence,
JS-off default-state grep. Fix violations, re-run. Then `open` the first file in the browser
for the user.

### 5. Iterate by variant, not by patch

If the user rejects a direction, **start a new numbered folder with a new fantasy** — keep the
rejected one on disk for comparison. If they pick one, enhance only that folder (sound, music,
extra screens). Record decisions (and what was rejected and why) in the project's planning doc
if one exists.

## Sound & music (on request, or offer after a variant is picked)

- **SFX**: procedural Web Audio synth engine (tech kit has the full drop-in code) — impact,
  coins, fanfare, level-up sweep, ticks, whooshes. Map sounds to moments, one per step/action.
- **Music**: a local audio file via looping `Audio` element (preferred if the user provides a
  track), or the procedural groove generator from the tech kit. Fade in on first gesture
  (autoplay policy), fade out on toggle-off.
- Independent Sound / Music toggles on the canvas, default on, SFX mixed louder than the bed.
