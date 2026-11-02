---
name: pstack-ai-devkit
description: >-
  Route work when both pstack and AI DevKit are installed. Pick one session
  owner, resolve shared skill names, and compose docs, tasks, memory,
  subagents, commits, and pull requests. Use when a task matches both a
  pstack playbook and an AI DevKit skill, or when the user mentions pstack,
  poteto, poteto-mode, AI DevKit, ai-devkit, or dev-lifecycle.
---

# Bridge pstack and AI DevKit

Read this file before `poteto-mode` or `dev-lifecycle`. If a rule here conflicts with either kit, this file wins. Then follow only the owner it names.

This file is a project skill. It is absent from `.ai-devkit.json`. Leave `.cursor/skills/pstack-ai-devkit/` in place when you install or update AI DevKit skills.

## Pick one owner

Use the first matching step. If the user names two owners, the one named later in the message wins, and the earlier name becomes side work only where a later section allows it.

1. The user asks for the lifecycle, the next phase, or names `dev-lifecycle`. This includes a message that also invokes `/poteto-mode`. The owner is `dev-lifecycle`. Use the phase map.
2. The user tells you to use one skill under `.cursor/skills/`. The owner is that skill.
3. The user names one pstack playbook. The owner is that playbook.
4. A feature doc already exists and the user says to continue that feature. The owner is `dev-lifecycle`. Use the phase map.
5. The user invokes `/poteto-mode` or asks for a code change. The owner is the matching pstack playbook.
6. Otherwise the owner is the matching pstack playbook.

State the step number before other work.

`dev-worktree` runs only for step 1 or step 4, or when the user asks to start, resume, or switch a feature workspace. Use the existing `feature-<name>` worktree when one exists. Do not create a second worktree for the same feature.

## Phase map

Use this map only for step 1 or step 4. The phase skill owns the docs and the approval gate. The named playbook owns code execution during that phase. Do not run that playbook's Opening a PR step yet. Run it when the user asks to publish. Run it when phase 9 is done and the user wants a pull request.

| Phase | What to run |
| --- | --- |
| 1 and 2, requirements | Stay in `dev-requirements`. Open `playbooks/investigation.md` only when the requirement depends on how current code behaves. Keep that pass read-only. |
| 3, design | `dev-design` owns the design doc. Read the pstack `architect` skill when the design crosses a function boundary. Open `playbooks/prototype.md` when a fork can be settled by running something. |
| 4 and 6, planning | Stay in `dev-planning`. |
| 5 and 7, implementation | Open `playbooks/feature.md` for new behavior, `playbooks/bug-fix.md` for a defect, `playbooks/refactoring.md` for a behavior-preserving restructure, or `playbooks/perf-issue.md` for measured slowness. |
| 8, testing | `dev-testing` owns the testing docs. Read the pstack skill `principle-test-behavior-not-implementation` before you add or edit a test. |
| 9, review | `dev-review` owns the phase. |

Playbook paths are relative to the installed `poteto-mode` skill.

## Shared names

Load only what the row names.

| Name | Winner |
| --- | --- |
| `tdd` | The pstack `tdd` skill. Load `.cursor/skills/tdd/SKILL.md` when the user asks for red-green on every behavior, or the active phase skill requires a failing test before production code. |
| `verify` | Both. `.cursor/skills/verify/SKILL.md` requires fresh command output for the claim. The pstack skill `principle-prove-it-works` requires the real surface. Run `dev-smoke` when a user or a caller can see the change. |

`memory` and pstack `recall` are different stores. Search `memory` for facts a later session in this repo should reuse. Use `recall` to reconstruct this person's recent chats. Do not store task progress in `memory`.

## Overlapping jobs

When the owner step did not already name one of these, use the matching row.

| Job | Run | Do not also run |
| --- | --- | --- |
| Behavior-preserving restructure, and the user did not name `dev-refactor` | `playbooks/refactoring.md` | `dev-refactor` |
| The user names `dev-refactor` | `dev-refactor` | `playbooks/refactoring.md` |
| A bug or a debug request, and the user did not name `dev-debug` | `playbooks/bug-fix.md` | `dev-debug` |
| The user names `dev-debug` | `dev-debug` | `playbooks/bug-fix.md` |
| Review inside phase 9 | `dev-review` | A second pstack review pass on the same diff |
| Review outside a lifecycle phase | `no-comments` before review, and `interrogate` when the design is contested | `dev-review` |
| The user asks to brainstorm | `brainstorm` | `playbooks/prototype.md` |
| A fork that can be settled by running something | `playbooks/prototype.md` | Asking the user which approach to take |
| The user asks to simplify and the edit stays local | `dev-simplify` | `playbooks/refactoring.md` |
| A simplify edit becomes a structural move | `playbooks/refactoring.md` | The rest of the `dev-simplify` checklist |
| Document a module, file, or API | `document-code` | pstack `how`, `why`, and `teach` |
| How something works, why it is that way, or teach it | The matching pstack skill `how`, `why`, or `teach` | `document-code` |
| A retro on finished work | `dev-retro`, and only if the user agrees | `reflect` |
| The user says reflect | `reflect` | `dev-retro` |
| Compact a long AI DevKit session | `session-compact` | Pause safely |
| Pause, resume after a restart, or pick up a prior Cursor session | Pause safely, or Session pickup | `session-compact` |

## Workers

Inside this Cursor chat, delegate with the `poteto-mode` subagent rules. Use `subagent_type` `poteto-agent` unless the routed pstack skill names a different type.

Start `ai-devkit agent` only for Codex, Claude Code, or another harness this chat cannot spawn. Use `agent-orchestration` when that external work spans passes. Use `agent-communication` only to exchange with those agents.

Do not give the same slice to a Cursor subagent and an `ai-devkit agent`.

## Docs and tasks

Feature docs live where `npx ai-devkit@latest lint` says they live. This repo has no `paths.docs` in `.ai-devkit.json`, so that directory is `docs/ai`. Create a feature with `npx ai-devkit@latest docs init-feature <name>`.

A pstack playbook does not get its own doc tree.

When `dev-lifecycle` marks task tracing available, record phase and evidence with the `task` skill. Run task mutations one at a time.

Keep a `show-me-your-work` trail local unless the user asks to commit it. Do not copy that trail into the feature docs.

## Approval

For step 1 or step 4, wait for approval the way `dev-lifecycle` says, before the phase runs.

For a pstack playbook owner, do reversible work and report it. Product direction still waits.

Do not put both gates on the same step.

## Commit and pull request

A pstack playbook that reaches Opening a PR owns commits and the pull request for that run. Follow that playbook.

Any other commit follows `dev-commit`. Any other pull request follows `dev-pr`.

Under `dev-commit`, do not amend or rebase. Under Opening a PR, rebase into small commits the way that playbook says.

## Setup

Role models come from the always-applied pstack models rule. Change them with `/setup-pstack`.

Run `ai-devkit-setup` only after `ai-devkit status --json` shows a gap that setup can fix. If `.ai-devkit.json` exists and `npx ai-devkit@latest lint` exits 0, skip init.

## Stop

Read the owner and follow it. Do not copy its steps into the reply.

This file stops two failures. One is waiting for lifecycle approval and editing code in the same step. The other is giving the same files to `ai-devkit agent` and a Cursor subagent.
