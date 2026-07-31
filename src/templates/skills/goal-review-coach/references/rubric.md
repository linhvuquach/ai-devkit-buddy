# Evaluation Rubric

Score each dimension **1–5**. Anchors below are deliberately concrete — if you're between two
anchors, pick the lower one and say why in the feedback rather than rounding up.

| # | Dimension | What it checks | 1 (Poor) | 3 (Workable) | 5 (Excellent) |
|---|---|---|---|---|---|
| 1 | **Clarity & Specificity** | Anyone outside the person's head can parse what's meant | Weasel verbs ("improve," "support"), no defined scope | Understandable but leaves one term ambiguous | Single unambiguous statement of outcome + scope; a stranger would interpret it the same way |
| 2 | **Outcome Orientation** | Describes a change in the world, not a task list | Pure activity ("launch X," "publish Y") with no stated effect | Names an effect but still leans on output language | States the outcome; any activities mentioned are clearly in service of it |
| 3 | **Measurability** | Progress/success is quantifiable or objectively verifiable | No metric; success is a subjective judgment call | A metric exists but no baseline or target | Explicit metric + baseline + target number/threshold |
| 4 | **Achievability (stretch calibration)** | Realistic given the owner's authority, skill, and resources in the timeframe | Depends on authority/resources the owner doesn't have, or trivially easy (sandbagged) | Plausible but no clear read on difficulty | Stretch-but-plausible given stated resources; owner has the authority to pursue it |
| 5 | **Business Impact** | Ties to a metric or priority the business/team actually cares about | No stated connection to any priority | Impact is implied but not named | Directly named business outcome, with expected magnitude |
| 6 | **Alignment** | Connects to a team/org priority, and that link is stated | Standalone, no reference to anything above it | Alignment is true but unstated in the goal text | Explicitly maps to a named parent objective/priority |
| 7 | **Ownership** | One accountable person is named and has actually agreed to it | No named owner, or shared ownership with no accountable party | Owner is implied (first person) but goal reads imposed | Named owner, phrased as their own commitment, co-authored not dictated |
| 8 | **Time-Bound** | Has a defined window matched to review cadence | No deadline, or deadline wildly mismatched to scope | Deadline present but arbitrary | Deadline explicit and aligned to the actual review/OKR cycle |
| 9 | **Scope Discipline** | One objective per goal | Multiple unrelated objectives bundled ("goal soup") | Mostly one objective with a minor second thing attached | Single, clearly bounded objective |
| 10 | **Dependencies** | External teams/systems/decisions the goal relies on are named | Hidden dependency not mentioned despite being obvious | Dependency named but no plan for the owner's part | All blocking dependencies named, with what's in/out of the owner's control made explicit |
| 11 | **Risk Awareness** | Known threats to completion are identified | No risks acknowledged despite obvious ones | Risk named, no mitigation | Key risks named with a mitigation or fallback |
| 12 | **Psychological Ownership / Buy-in** | The goal reads as genuinely endorsed, not just compliant | Passive, hedged, imposed-sounding ("should," "it would be good if") | Active voice but generic, could be anyone's goal | Specific enough and framed enough that it's clearly *this* person's goal, for a reason that's theirs |

## Gating dimensions

Dimensions **1 (Clarity), 2 (Outcome Orientation), 3 (Measurability), and 8 (Time-Bound)** are
gates, not just inputs to an average. A goal can't be reviewed as "good" on the strength of high
scores elsewhere if any gate scores ≤2 — without these four, there's no way to tell later whether
the goal was hit. Flag a gate failure explicitly and prioritize it over lower-stakes dimensions
in your feedback, even if it drags the average down less than another dimension would.

## Computing the overall score

1. Average all 12 dimension scores → **raw score** (1.0–5.0).
2. If any gating dimension scored ≤2, cap the **overall quality** label at "Needs Rework"
   regardless of the raw average — state this explicitly rather than letting a high average
   paper over an unusable goal.
3. Otherwise, map the raw average:
   - **4.3–5.0** — Excellent (ready to use, maybe as a model example)
   - **3.5–4.2** — Solid (minor tightening)
   - **2.5–3.4** — Workable (real gaps, coachable in one pass)
   - **1.0–2.4** — Needs Rework (fundamental issues, likely needs a real conversation, not just a wording edit)

## Confidence level

Report confidence in the score itself, separate from the score:

- **High** — you have the full context needed (role, team priority, resources) to judge every
  dimension.
- **Medium** — some dimensions (commonly Business Impact, Alignment, Achievability) were scored
  on inference because context wasn't given; say which.
- **Low** — you're mostly scoring wording in a vacuum (no role/team context at all). Say so up
  front, and lead the review with the clarifying questions needed to raise confidence before
  scoring further, rather than presenting a low-confidence score as if it were definitive.

## Priority improvements

After scoring, name the **1–2 lowest-scoring dimensions that are also gates**, or if no gate
failed, the single lowest-scoring dimension overall. Coach on that first — don't spread feedback
evenly across all 12 dimensions in one pass; that reads as a checklist, not a coaching
conversation.
