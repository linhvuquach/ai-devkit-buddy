# Tech kit — skeleton, engines, audits

## File anatomy (every prototype file)

```html
<!DOCTYPE html><html lang="en"><head><meta charset><meta viewport><title>…</title>
<style>
/* ==== SHARED <VARIANT-ID> — keep byte-identical across variant files ==== */
:root{ --tokens…; --font-display:…; --font-body:…; --hero:url("../relative/asset.png"); }
… reset, canvas, frame, statusbar, grain, type helpers, panel material,
  progress track, image treatments, keyframes, animation classes, reduced-motion …
/* ==== END SHARED ==== */
/* per-file styles below the marker */
</style></head>
<body>
  <!-- canvas chrome: demo toggles top-left, variant cross-links top-right -->
  <div class="phone"><div class="screen">
    <div class="statusbar">…</div>
    <section class="step active">…</section>  <!-- JS-off default = first step styled -->
    <section class="step">…</section>
    <div class="grain"></div>                  <!-- always last inside screen -->
  </div></div>
  <div class="canvas-note">Tap the screen to advance</div>
  <script> /* ==== SFX ENGINE ==== */ … /* ==== MUSIC ENGINE ==== */ … per-file wiring </script>
</body></html>
```

Key patterns (all proven in Safari):

- **Frame**: `.phone{width:375px;height:812px;border-radius:40px;overflow:hidden}` centered on a
  `#0A0A0C` body canvas; fake status bar (9:41 + CSS battery), `pointer-events:none` on it.
- **Grain**: `background-image:url("data:image/svg+xml,%3Csvg …%3E%3CfeTurbulence type='fractalNoise'
  baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E…")` tiled 160px, opacity 0.04–0.06,
  z-index above content, `pointer-events:none`.
- **Step engine**: `.step{display:none}.step.active{display:block}` + JS toggling. Because
  `display:none→block` restarts CSS animations, step entrances replay with zero extra JS.
  First step has `active` in markup so JS-off shows a complete screen.
- **Stagger**: `.a-rise{animation:rise .45s ease-out both}` + delay utilities `.d1…d10`
  (0.08 s increments). `both` fill keeps pre-delay state at opacity 0.
- **Image fallback**: layer list `background-image:linear-gradient(scrim…),url(optional.png),var(--hero)`
  — a 404'd layer simply doesn't render; `background-color` sits underneath. A missing-asset
  drill = rename the asset and confirm the screen still reads.
- **Glow with clip-path**: `box-shadow` is clipped away — use `filter:drop-shadow()` on the
  clipped element or put the shadow on an unclipped wrapper.
- **Hex/chamfer**: `clip-path:polygon(…)` with `-webkit-` twin. Bevel = outer shape with light
  gradient + inner shape inset 1–3px. Engraved text = dark color + 1px light `text-shadow`.
- **Cross-links**: `.proto-nav` fixed top-right — sibling files by relative href, plus links to
  other variant folders (`../other-variant-05/phase1….html`).

## SFX engine (drop-in, ~90 lines)

Web Audio synth, no files. Lazy `AudioContext` (+`webkitAudioContext`) created on first call,
`resume()` if suspended (autoplay policy — first user tap unlocks). All presets = short
oscillator `tone({f,w,a,d,v,f2,at})` and filtered-noise `hiss({f,f2,hp,a,d,v,at})` voices with
exponential envelopes. Preset map that covers a gamified UI:

| Preset | Recipe | Use |
|---|---|---|
| `tap` | 640 Hz + 960 Hz squares, 50 ms | any button |
| `back` | single 420 Hz, low | back nav |
| `whoosh` | noise lowpass 3200→300 Hz, 220 ms | step transitions |
| `tick(f)` | 40 ms square, pitch from value | steppers (pitch rises with the number!) |
| `coin` | 988 then 1319 Hz squares | currency earned |
| `impact` | noise 2800→140 Hz + sine 82→40 Hz thump | celebration step 1 |
| `clink` | 1150 Hz triangle + highpass noise 5 k | metallic streak fills |
| `check`/`uncheck` | rising / falling two-tone | quest toggles |
| `fanfare` | C5-E5-G5-C6 triangle arpeggio, 90 ms apart + G6 tail | rank up, final CTA |
| `levelup` | 180→760 Hz saw sweep, then E5-G#5-B5-E6 arpeggio | level up |
| `toggle(v)` | 600/360 Hz | switches |

Volumes: UI blips v≈0.04–0.06, celebration ≤0.2. Keep the engine between
`/* ==== SFX ENGINE ==== */ … /* ==== END SFX ==== */` markers, byte-identical per variant.
Map step index → preset in the step engine (`stepSfx[n]`). For a link that navigates, play the
sound, `preventDefault()`, then `setTimeout(navigate, ~400ms)`.

## Music engine

Two interchangeable implementations behind the same API
(`MUSIC.setOn(bool)` / `MUSIC.poke()`), between `==== MUSIC ENGINE ====` markers:

1. **Local track (preferred when a file exists)** — `new Audio(SRC)` with `loop=true`,
   `volume` fade via 50 ms interval (1.5 s in to ~0.35, 0.5 s out then `pause()`).
   `play()` returns a promise — `.catch(){}` it for autoplay policy. Missing file → silence,
   no errors.
2. **Procedural groove (no assets)** — lookahead scheduler (`setInterval(schedule,100)`
   scheduling 0.3 s ahead on an `AudioContext`), 124 BPM, 4-bar loop over a minor progression
   (Am–G–F–E): sine-drop kick each beat, bandpass-noise snare on 2 & 4, highpass hats on 8ths,
   lowpass saw bass on roots, triangle arpeggio on chord tones. Bus gain ≈0.13 so SFX sit on top.

Global unlock: `document.addEventListener('pointerdown',()=>MUSIC.poke(),{passive:true})`.
Canvas gets independent **Sound** and **Music** toggles (default on).

## Audit commands (run before claiming done)

```bash
# 1. shared blocks byte-identical (CSS / SFX / MUSIC)
awk '/==== SHARED/,/==== END SHARED/' f.html | shasum        # repeat per file, compare
awk '/==== SFX ENGINE/,/==== END SFX/' f.html | shasum
awk '/==== MUSIC ENGINE/,/==== END MUSIC/' f.html | shasum

# 2. palette-only colors — every hit must be a token or documented spec value
grep -ohE '#[0-9A-Fa-f]{3,8}' *.html | sort | uniq -c | sort -rn
grep -ohE 'rgba?\([^)]*\)' *.html | sort -u   # each rgba must derive from a token

# 3. zero emoji
perl -CSD -ne 'while(/([\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}\x{2B00}-\x{2BFF}])/g){print "EMOJI in $ARGV\n"}' *.html

# 4. JS parses
sed -n '/<script>/,/<\/script>/p' f.html | sed '1d;$d' > /tmp/s.js && node --check /tmp/s.js

# 5. budgets & structure
grep -n '0 0 12px' *.html                 # glow count per file/screen
grep -c 'var(--power)' *.html             # hot-accent count (≤1 per screen)
grep -c 'class="step active"' *.html      # JS-off default present
grep -on 'url("\.\./[^"]*"' *.html        # every external ref → check it exists on disk

# 6. hand off
open <folder>/phase1-*.html               # audio/visual sign-off is always manual
```

Known Safari gotchas: `box-shadow`+`clip-path` (above); animations on `display:none` steps
don't run until shown (that's the feature); `mix-blend-mode` over `background-image` can glitch
— test the duotone early, fall back to a flat rgba overlay; condensed font stacks need a tuned
`Arial Narrow` tail for non-Apple platforms.
