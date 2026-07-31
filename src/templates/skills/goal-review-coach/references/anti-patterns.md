# Anti-Pattern Catalog

Pattern-match a draft goal against these before scoring. Each entry: what to detect, why it
matters, a bad example, and the fix. Detect silently, then surface only the highest-priority 1-2
matches in conversation (see coaching style in SKILL.md) — don't recite this whole list at the
person.

## Weasel-word / vague verbs
**Detect:** "improve," "support," "help," "assist," "participate in," "work on," "enhance,"
"optimize," "get better at" — any verb that could describe a hundred different actual outcomes.
**Why it matters:** these verbs feel like commitments but carry no information about what
"done" looks like — effort can't be aimed at them.
- Bad: "Improve customer experience."
- Good: "Reduce average support ticket resolution time from 48h to 24h by end of Q3."

## Activity-based goal (output instead of outcome)
**Detect:** the goal is a task or deliverable, fully satisfiable by doing the thing regardless of
effect.
**Why it matters:** the #1 flagged OKR failure mode — it's trivially "completable" without
anything actually changing.
- Bad: "Launch the new onboarding flow." / "Publish 5 blog posts."
- Good: "Increase new-user activation rate from 40% to 55% by Q3, via redesigned onboarding."

## Unmeasurable goal
**Detect:** no metric, or a metric implied but no baseline/target given.
**Why it matters:** without a number, "success" becomes a subjective argument at review time.
- Bad: "Get better at cross-team collaboration."
- Good: "Achieve a peer-collaboration score of 4.5/5 in Q3 360 feedback, up from 3.8."

## Goal soup (multiple objectives combined)
**Detect:** "and," "as well as," a list of deliverables joined into one goal statement.
**Why it matters:** obscures priority, makes partial credit ambiguous, and hides which part
actually matters most.
- Bad: "Ship the API redesign, improve docs, and mentor two junior engineers."
- Good: three separate, individually tracked goals — each scored on its own.

## Missing deadline / mismatched time horizon
**Detect:** no date, or a date wildly out of proportion to the scope (a one-week deadline on a
multi-quarter effort, or vice versa).
**Why it matters:** a goal without a deadline can never be judged late or on-time.
- Bad: "Reduce churn."
- Good: "Reduce monthly churn from 5% to 3.5% by December 31."

## Impossible goal / sandbagging
**Detect either direction:** target requires resources/authority/time the owner doesn't have
(impossible), or target is trivially already-achieved territory (sandbagging, often a single
suspiciously-safe number with no stretch framing).
**Why it matters:** impossible goals kill effort and belief; sandbagged goals hide real capacity
and distort what "good" looks like for everyone else.
- Bad: "10x revenue in one quarter with no new headcount." / "Hit 95% uptime" (when already at 97%).
- Good: "Grow revenue 15% this quarter, informed by last year's 12% baseline."

## Missing success metric / definition of done
**Detect:** goal implies effort ("work on reducing bugs") without a threshold that counts as
complete.
**Why it matters:** same root cause as unmeasurability, but specifically about the *finish line*
rather than the tracking metric.
- Bad: "Work on reducing bugs."
- Good: "Cut critical production bugs by 30% (from 40 to ≤28) by quarter end."

## Unstated dependency
**Detect:** the goal implies solo control over something that actually depends on another team,
person, or external party's timeline/decision.
**Why it matters:** hidden dependencies turn into finger-pointing when the goal is missed for
reasons outside the owner's control.
- Bad: "Launch integration with Partner X's API" (no mention Partner X controls the timeline).
- Good: "Complete our side of the Partner X integration by Aug 15, pending their API spec freeze
  by Jul 15."

## Passive / ownerless wording
**Detect:** hedged phrasing — "it would be good if," "should," "we think," third-person framing
of a goal the person themselves owns.
**Why it matters:** signals low commitment and buries who's actually accountable.
- Bad: "It would be good if response times were improved somewhat."
- Good: "I will cut p95 API response time from 800ms to 300ms."

## Missing business value / no "so what"
**Detect:** goal is purely internal/technical with no stated reason it matters beyond itself.
**Why it matters:** goals disconnected from value are the first cut in prioritization
conversations and the hardest to defend at review time.
- Bad: "Migrate to the new database."
- Good: "Migrate to the new database to cut infra costs 25% and eliminate the outages causing
  2 hours/month of downtime."

## Goal is really a job description
**Detect:** restates an ongoing responsibility rather than a specific result for this period.
**Why it matters:** a standing duty isn't a goal — there's nothing to score at the end of the
cycle that wasn't already true at the start.
- Bad: "Manage the support queue."
- Good: "Reduce first-response time on the support queue from 6h to 2h this quarter."

## Single-point estimate with no baseline/range
**Detect:** a rigid target number with no stated starting point, so a near-miss is undebatable
and stretch-vs-committed is unclear.
**Why it matters:** without a baseline, "70%" could be a huge win or a step backward — nobody can
tell.
- Bad: "Hit 95% uptime."
- Good: "Improve uptime from current 97.2% to 99.5% (stretch: 99.9%) by Q4."

## Fabricated precision (coach-side anti-pattern)
**Detect:** *your own* draft rewrite invents a metric, baseline, or business rationale the person
never gave you, because a number "sounds right."
**Why it matters:** a plausible-looking invented number is worse than an acknowledged gap — it
looks resolved and won't get questioned until it's wrong in front of the person's manager.
- Bad rewrite: "Reduce churn from 8% to 5%" (neither number was ever stated by the person).
- Good rewrite: "Reduce churn from [current rate — confirm] to [target — confirm with manager]
  by Q4."
