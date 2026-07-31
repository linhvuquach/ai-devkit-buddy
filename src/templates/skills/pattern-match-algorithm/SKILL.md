---
name: "Coding Patterns Recognition"
description: "Map a coding problem → **1–2 likely patterns** in ≤30 seconds using deterministic signals."
---

## Core Procedure (MANDATORY ORDER)

```
1. Identify INPUT type
2. Identify GOAL
3. Check CONSTRAINTS
4. Scan KEYWORDS
5. Validate COMPLEXITY
→ Output top 1–2 patterns + justification
```

---

## INPUT → Pattern Candidates

```
IF sorted array/string → {Two Pointers, Binary Search}
IF unsorted array → {HashMap, Sliding Window, Prefix Sum}
IF array in [1..n] → {Cyclic Sort}
IF string → {Sliding Window, HashMap, Two Pointers}
IF linked list → {Fast/Slow, Reversal}
IF tree → {DFS, BFS}
IF graph/grid → {BFS, DFS, Union-Find}
IF intervals → {Merge Intervals}
IF stream → {Heap, Two Heaps}
``` 

---

## GOAL → Pattern Mapping

```
pair/triplet sum → {Two Pointers | HashMap}
longest/shortest subarray → {Sliding Window}
count ways → {DP | Backtracking}
max/min with constraint → {DP | Greedy}
all combinations → {Backtracking}
shortest path → {BFS}
all paths → {DFS}
cycle detection → {Fast/Slow | DFS | Union-Find}
top k / kth → {Heap}
merge overlaps → {Merge Intervals}
ordering with dependencies → {Topological Sort}
connectivity/groups → {Union-Find}
range sum → {Prefix Sum}
next greater/smaller → {Monotonic Stack}
```

---

## CONSTRAINT RULES

```
IF O(1) space required → {Two Pointers, Fast/Slow, Cyclic Sort}
IF n > 1e6 → avoid O(n²) → use {O(n), O(n log n)}
IF n ≤ 20 → allow {Backtracking}
IF sorted input → prefer {Binary Search, Two Pointers}
IF matrix/grid → {BFS, DFS}
```

---

## KEYWORD TRIGGERS (HIGHEST PRIORITY)

```
"subarray/substring/contiguous" → Sliding Window
"sorted + pair" → Two Pointers
"cycle/middle" → Fast & Slow
"overlap/meeting/schedule" → Merge Intervals
"1..n missing/duplicate" → Cyclic Sort
"next greater/smaller" → Monotonic Stack
"kth/top k" → Heap
"prefix/range sum" → Prefix Sum
"shortest/min steps" → BFS
"all paths/combinations" → Backtracking/DFS
"dependencies/prereq" → Topological Sort
"connected/groups" → Union-Find
"rotated sorted" → Binary Search (modified)
"median/stream" → Two Heaps
"prefix search/autocomplete" → Trie
```

---

## COMPLEXITY CORRECTION

```
IF brute force is O(n²):
    TRY → Two Pointers | Sliding Window | HashMap

IF repeated subproblems:
    USE → DP

IF repeated range queries:
    USE → Prefix Sum

IF need faster search in sorted:
    USE → Binary Search

IF graph traversal naive:
    USE → BFS (shortest) or DFS (full search)
```

---

## OUTPUT FORMAT (STRICT)

```
Patterns: [P1, P2]

Reasoning:
- Input → ...
- Goal → ...
- Keywords → ...
- Constraints → ...

Chosen because:
<1–2 sentence justification>
```

---

## TEST CASES (MUST PASS)

### Test 1

**Input:** "Find longest substring without repeating characters"

```
Patterns: [Sliding Window]

Reasoning:
- Input → string
- Goal → longest substring
- Keywords → "substring"
- Constraints → O(n) expected

Chosen because:
Contiguous substring + optimization → sliding window
```

---

### Test 2

**Input:** "Find two numbers in sorted array that sum to target"

```
Patterns: [Two Pointers]

Reasoning:
- Input → sorted array
- Goal → pair sum
- Keywords → "sorted", "pair"
- Constraints → O(n)

Chosen because:
Sorted + pair → eliminate nested loop with two pointers
```

---

### Test 3

**Input:** "Return k most frequent elements"

```
Patterns: [HashMap, Heap]

Reasoning:
- Input → array
- Goal → frequency + top k
- Keywords → "top k", "frequent"

Chosen because:
Count with hashmap, select with heap
```

---

### Test 4

**Input:** "Minimum number of steps to reach target in grid"

```
Patterns: [BFS]

Reasoning:
- Input → grid
- Goal → shortest path
- Keywords → "minimum steps"

Chosen because:
Unweighted shortest path → BFS guarantees optimal
```

---

## HARD RULES

```
- NEVER output more than 2 patterns
- ALWAYS justify using signals (input/goal/keyword/constraint)
- PRIORITIZE keyword triggers over all else
- REJECT O(n²) if n is large
- DEFAULT to simpler pattern if tie
```

---

## Mental Shortcut (10-sec mode)

```
substring? → Sliding Window
sorted + pair? → Two Pointers
top k? → Heap
shortest path? → BFS
all combinations? → Backtracking
overlap intervals? → Merge Intervals
```
