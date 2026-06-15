---
description: Analyze a heavy Claude Code command and restructure it following Claude Code best practices (skills, agents, supporting files, rules)
argument: path to the command file to refactor
---

# Refactor Command to Claude Code Best Practices

Refactor: `$ARGUMENTS`

Read the command file first.

## Step 1: Assess

Count lines and analyze the command's content. Classify each section:

- **Orchestration**: Argument parsing, input handling, workflow coordination
- **Domain logic**: Step-by-step instructions, decision trees, transformation rules
- **Reference material**: Examples, checklists, templates, lookup tables, before/after comparisons
- **Behavioral rules**: Constraints, guardrails, dos/don'ts that apply broadly
- **Heavy processing**: Tasks that could run independently or in parallel (analysis, generation, validation)

Determine what the command actually needs based on its content — not every command needs all of the below. Only apply what adds value.

## Step 2: Decide the Right Structure

Choose which Claude Code primitives to use based on what you found:

### Skill (`.claude/skills/<name>/SKILL.md`)
**Use when:** The command has substantial domain logic (>50 lines of instructions) that should load on-demand rather than immediately.
- Moves heavy instructions out of the command into a skill that loads only when invoked
- SKILL.md frontmatter: `name`, `description` (≤250 chars, specific), `user-invocable: false`
- Keep SKILL.md under 500 lines — move detailed reference material to sibling files

### Supporting files (alongside `SKILL.md`)
**Use when:** The skill references detailed examples, checklists, templates, or lookup data.
- These are only read by Claude on-demand during skill execution
- Link from SKILL.md using relative markdown links: `[reference.md](reference.md)`
- Group by topic, name descriptively (e.g., `examples.md`, `checklist.md`, `templates.md`)
- No frontmatter needed — plain markdown

### Agents (subagent delegation)
**Use when:** The command has independent tasks that can run in parallel, or heavy processing that benefits from isolated context.
- Use `context: fork` for tasks that produce large output but only a summary is needed
- Use parallel agents for independent analysis steps (e.g., analyze resume + analyze JD simultaneously)
- Define agent usage in the skill, not the command

### Rules / Guardrails
**Use when:** The command has behavioral constraints that should always apply (not just during this command).
- Project-wide rules go in `CLAUDE.md` at project root
- Command-specific rules stay in the skill or command
- Only promote to `CLAUDE.md` if the rule applies beyond this single command

## Step 3: Execute

Based on your assessment, restructure the command. The general pattern:

1. **Slim the command** to ≤20 lines: frontmatter + argument parsing + instruction to invoke the skill
2. **Create the skill directory** if needed: `.claude/skills/<name>/`
3. **Write supporting reference files** first (examples, checklists, templates)
4. **Write SKILL.md** — core workflow referencing supporting files via links
5. **Extract project-wide rules** to `CLAUDE.md` if they apply broadly
6. **Rewrite the command** in-place — keep original `description` and `argument` frontmatter, same filename so the slash command doesn't change

Do NOT create structure that isn't needed. A 40-line command with no reference material might just need minor cleanup, not a full skill extraction.

## Step 4: Report

Print a summary:

```
Refactored: <command path>

Structure:
  <file>: <N> lines — <what it contains> — <when loaded>

Before: <N> lines loaded into context on invocation
After:  <N> lines loaded immediately, rest on-demand
```

If you created or modified `CLAUDE.md`, note which rules were added.
If you set up agent delegation, note which tasks run in parallel.

## Principles

- **Preserve all functionality** — reorganize, never remove
- **Same slash command** — the user's `/command-name` must still work
- **Minimal structure** — don't create skills/agents/files unless they earn their place
- **Token efficiency** — the goal is reducing what loads into context upfront
- **On-demand loading** — heavy content should only load when Claude actually needs it
