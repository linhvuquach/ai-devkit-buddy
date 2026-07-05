# Gamification mechanics menu

Pick mechanics that attach to the app's **core loop**. Rename every mechanic into the variant's
fantasy (quests → "work orders" in a forge theme; rank → "league placement" in a sports theme).
A mechanic that can't be renamed into the fantasy probably doesn't belong in that variant.

## Progression spine (pick 2–3, they must interlock)

| Mechanic | What it needs on screen | Notes |
|---|---|---|
| **XP + Levels** | XP bar with `current/next` label, level chip/ring/medal near identity | The universal spine. Show the *gap to next level*, not just totals. |
| **Rank tiers per activity** | Per-item progress bar "to next rank — X · n/m", tier badge (Bronze/Silver/…) | From ranked games. Per-exercise/subject/habit ranks beat one global rank — more moments of progress. |
| **Currency** (LP/points/coins) | Earned amounts as ledger rows or tally bars with `+N` deltas | Give it one dedicated accent color used nowhere else. |
| **Power/total score** | One big lifetime number ("power score", "total iron moved", "words read") | Vanity metric that only goes up. Numbers-as-heroes typography. |

## Retention layer

- **Streaks** — 7-slot week row in the variant's signature widget (discs, chain links, hexes…).
  Filled vs empty vs *today* (today gets the entrance animation). Add a "best: N" quiet stat and
  a motivating gap line ("4 more for your best week").
- **Streak multiplier** — "×1.2 LP while the chain holds" chip. Makes the streak *do* something.
- **Daily quests** — 3 checklist rows with reward labels (`+50 XP`), one pre-completed (shows
  the interaction), live "n/3 done" counter. In prototypes make them tappable with sound.
- **Titles** — cosmetic unlocks on level-up ("Iron Novice", "Chainbreaker"). One line of copy.

## The celebration loop (the emotional payoff — 5–6 full-screen steps)

1. **Impact frame** — hero image + big declaration ("HUGE GAINS."), 120 ms white flash,
   optional shockwave/rays. The manhwa "panel flash".
2. **Currency tally** — ledger of what was earned per item, staggered entrance, bonus row
   (multiplier), big session total.
3. **Rank up** — badge forged/stamped in (scale-settle or stamp animation), "to next rank" bar
   showing the *new* gap.
4. **Level up** — level ring/plate, rising sweep + arpeggio moment, title unlock, new XP bar.
   Only include when a level-up actually happened — it must feel rare.
5. **Streak** — signature widget updates, today's slot animates in, multiplier chip.
6. **Summary** — hero image, one dominant stat (volume/time/score), stat strip, medals row,
   Share + Replay.

Tap-anywhere advances; Replay restarts; every step must look complete as a static frame.

## Onboarding as character creation

- Frame data entry as **calibration** ("Placement scan", "Forge test", "Getting to know you").
- Show computed **starting stats** as animated bars (2–3 stats, one deliberately low/"unproven").
- **Placement badge** — the user *earns* their starting rank before ever using the app.
- Projection card — "+37 points in 3 months" in the currency accent.
- Final step = **character sheet / day-1 card**: identity, level 1, first quest with its reward,
  single CTA into the app. Sign-in framed as "save your progress", never as a gate.

## Dashboard composition (top → bottom)

1. Hero header (~35–40% height): image, date micro-label, name, level + XP bar, one status chip.
2. Retention row: quests or streak (whichever the loop favors).
3. Progression row: per-item rank bars.
4. Next action card: title, meta, projected reward ("≈ +120 XP"), one solid play button.
5. Optional in-progress state: sticky bottom bar with pulsing live dot + timer + resume,
   toggleable from the canvas for demos.
