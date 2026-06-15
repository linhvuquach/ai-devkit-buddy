# Multi-Angle Diff Code Review

Review a git diff with high-recall, multi-angle analysis to catch real bugs before merge.

## Overview

This review runs at **high effort**: catching real bugs matters more than avoiding false positives.
Err on the side of surfacing findings.

Pipeline: `gather diff → 7 finder angles (up to 6 candidates each) → 1-vote verify → ≤10 ranked findings`

---

## Phase 0 — Gather the Diff

Run `git diff @{upstream}...HEAD` to get the unified diff under review.

Fallbacks if that range is empty:
- `git diff main...HEAD`
- `git diff HEAD~1`
- `git diff HEAD` (to include uncommitted working-tree changes)

If a PR number, branch name, or file path was passed as an argument, review that target instead. Treat this diff as the review scope.

---

## Phase 1 — Find Candidates

Run **7 independent finder angles** in parallel (via Agent tool or equivalent). Each surfaces **up to 6 candidate findings** with:
- `file` — path to the file
- `line` — line number
- `summary` — one-line description of the issue
- `failure_scenario` — concrete input, state, or timing that triggers the problem

### Angle A — Line-by-Line Diff Scan (Correctness)

Read every hunk in the diff, line by line. Then read the enclosing function for each hunk — bugs in unchanged lines of a touched function are in scope.

For every changed line ask: what input, state, timing, or platform makes this line wrong?

Look for:
- Inverted or wrong conditions
- Off-by-one errors
- Null / undefined dereference
- Missing `await`
- Falsy-zero checks (e.g. `if (!count)` when `count = 0` is valid)
- Wrong-variable copy-paste
- Errors swallowed silently in a catch block
- Unescaped regex metacharacters

### Angle B — Removed-Behavior Auditor (Correctness)

For every line the diff **deletes or replaces**, name the invariant or behavior it enforced, then search the new code for where that invariant is re-established.

If you can't find it, that's a candidate: a removed guard, a dropped error path, a narrowed validation, or a deleted test that was covering a real case.

### Angle C — Cross-File Tracer (Correctness)

For each function the diff changes, find its callers (grep for the symbol) and check whether the change breaks any call site:
- A new precondition the caller doesn't satisfy
- A changed return shape the caller doesn't handle
- A new exception that propagates unchecked
- A timing or ordering dependency introduced

Also check callees: does a parallel change in the same PR make a downstream call unsafe?

### Angle D — Reuse (Cleanup)

Flag new code that re-implements something the codebase already has.

Grep shared/utility modules and files adjacent to the change. Name the existing helper to call instead. In `failure_scenario`, state the duplication cost (maintenance burden, divergence risk).

### Angle E — Simplification (Cleanup)

Flag unnecessary complexity the diff adds:
- Redundant or derivable state
- Copy-paste with slight variation
- Deep nesting that could be flattened
- Dead code left behind after a refactor

Name the simpler form that does the same job.

### Angle F — Efficiency (Cleanup)

Flag wasted work the diff introduces:
- Redundant computation or repeated I/O
- Independent operations run sequentially instead of in parallel
- Blocking work added to startup or hot paths

Name the cheaper alternative.

### Angle G — Altitude (Design)

Check that each change is implemented at the right depth — not as a fragile band-aid.

Special cases layered on shared infrastructure are a sign the fix isn't deep enough. Prefer generalizing the underlying mechanism over adding special cases.

---

## Phase 2 — Verify (1-vote, recall-biased)

1. **Dedup** near-duplicates (same defect, same location, same reason → keep one).
2. For each remaining candidate, run **one verifier** that returns exactly: `CONFIRMED`, `PLAUSIBLE`, or `REFUTED`.

### Verdicts

**PLAUSIBLE by default** — do not refute a candidate for being "speculative" when the state is realistic:
- Concurrency races
- Nil/undefined on a rare-but-reachable path (error handler, cold cache, missing optional field)
- Falsy-zero treated as missing
- Off-by-one on a boundary the code does not exclude
- Retry storms / partial failures
- Regex or allowlist that lost an anchor

**REFUTED** only when constructible from the code:
- Factually wrong (quote the actual line)
- Provably impossible (type / constant / invariant — show it)
- Already handled in this diff (cite the guard)
- Pure style with zero observable effect

Keep **CONFIRMED and PLAUSIBLE**. Drop REFUTED.

---

## Output

Return findings as a JSON array of at most **10 objects**, ranked most-severe first.

Correctness bugs always outrank cleanup and altitude findings when the cap forces a cut.

```json
[
  {
    "file": "path/to/file.ext",
    "line": 123,
    "summary": "one-sentence statement of the bug or issue",
    "failure_scenario": "concrete inputs/state → wrong output or crash"
  }
]
```

If nothing survives verification, return `[]`.
