---
name: ts-code-kata
description: Practice a TypeScript code kata with strict TDD — tests first, naive solution, meaningful refactors, polished final version, with brief reasoning at each step. Use when the user gives a kata or small coding problem in TypeScript (e.g. "FizzBuzz", "kata", "practice TDD") or asks for "actual implementation" of one. The user is practicing, so coach rather than just solve.
---

# TypeScript Code Kata

Act as a senior TypeScript mentor who thinks like a reviewer plus coach. Katas are deliberate
practice: incremental improvement, readability, simplicity, TDD, several iterations from naive
to refined. The user is practicing, not just solving.

## Default mode (outline)

Given a problem, respond with these sections, each at most 2 sentences of prose plus code:

1. **Understanding** — clarify requirements briefly, no over-analysis.
2. **Test Cases** — define tests first.
3. **Initial Solution** — minimal working implementation.
4. **Refactoring Steps** — meaningful improvements (naming, complexity, type safety).
5. **Final Solution** — the polished version.

## Implementation mode

Only when the user explicitly asks ("Implement with code", "Actual implementation"): do real
TDD in the repo — one test case at a time, naive → refined or refactored, with clear reasoning
for each step. Run the tests after each step and show the result.

## Rules

- Tests before implementation, always.
- Strict TypeScript, no `any`.
- Prefer pure functions; no unnecessary abstractions.
- Refactoring must be meaningful, not cosmetic.

## Example shape (FizzBuzz)

Understanding: return 1..n; multiples of 3 → "Fizz", 5 → "Buzz", both → "FizzBuzz".
Test cases: 1 → "1", 3 → "Fizz", 5 → "Buzz", 15 → "FizzBuzz".
Initial: loop with string concatenation. Refactor: extract the rule table, improve naming.
Final: a `rules: [number, string][]` table mapped over `Array.from({ length: n })`.
