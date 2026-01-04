# Claude Code Best Practices and Reference

## Overview

- Claude Code accelerates development by combining conversational guidance with direct code editing, workspace awareness, and task automation.
- Successful sessions start with clear prompts, explicit goals, and relevant files or directories mentioned with `@` to ground context.
- For complex changes, plan incrementally, validate assumptions early, and leverage built-in tools (memory, subagents, extended thinking) to manage scope.

## Managing Project Memory

- `init` quickly maps a codebase and writes a `CLAUDE.md` guide; review and edit the file so it reflects architecture, common tasks, and coding conventions.
- Use `#` to append persistent notes (framework commands, database schemas, deployment steps) whenever Claude Code repeatedly needs clarification.
- Keep memory concise and actionable; periodically prune or update outdated entries to avoid confusing future sessions.

## Claude Code Commands

- `/clear`: reset conversation history when the session drifts; restate goals afterward.
- `/compact`: summarize long discussions to stay within context limits before continuing.
- `/mcp`: list or manage Model Context Protocol servers to access supplemental tools and services.
- `@`: mention files or directories to inject their contents directly into the conversation.
- `ESC`: interrupt ongoing reasoning to redirect the assistant.
- `ESC ESC`: rewind to an earlier conversation state if a mistaken direction persists.

## Shortcuts and Shell Usage

- `shift`+`tab`: toggle between planning and auto-accept modes to balance safety vs. speed.
- Use standard shell commands by prefixing with `!` (e.g., `!pwd`); type `exit` to close the assistant shell.
- Screenshot workflow: `cmd`+`shift`+`ctrl`+`4` on macOS; paste with `ctrl`+`v` where supported.

## Extended Thinking and Subagents

- Trigger deeper analysis with the keywords `think`, `think hard`, `think harder`, or `ultrathink` when you need exhaustive exploration of architecture or debugging paths.
- Launch Task subagents for parallel brainstorming or multi-step investigations; define focused prompts and share key findings back into the main thread.
- Consider custom subagents (with their own prompts and tools) for recurring, specialized workflows.

## High-Leverage Workflows (80/20 Focus)

- Explore → Plan → Implement → Commit: begin by asking Claude to gather context and outline a plan before touching code, then execute and wrap up with documentation or PR preparation for predictable results.
- TDD loop: have Claude draft failing tests first, confirm failures, then implement the fix while locking tests to prevent regressions; this tight cycle catches issues early.
- Visual diffing: pair Claude with screenshot or design inputs so it can iterate toward pixel-aligned UI changes using automated capture tooling such as the Puppeteer MCP server.
- Safe automation bursts: enable `--dangerously-skip-permissions` only inside disposable sandboxes for bulk cleanup tasks, then review diffs to protect production environments.
- Plan Mode for research: switch to Plan Mode when investigating unfamiliar systems; Claude will read and summarize files without modifying anything, keeping sessions safe.

## Prompting and Session Flow Tips

- Provide Claude Code with the "why" behind changes—business goals, constraints, performance targets—to improve solution quality.
- When requesting code edits, specify the files, functions, or components involved and clarify acceptance criteria (tests, linting, style).
- Break large efforts into staged milestones; review diffs after each stage to maintain control over the workspace.

## Additional Resources

- Common workflows guide: https://code.claude.com/docs/en/common-workflows
- Best practices article: https://www.anthropic.com/engineering/claude-code-best-practices
- How Anthropic teams use Claude Code: https://claude.com/blog/how-anthropic-teams-use-claude-code
- Anthropic Academy course "Claude Code in Action": https://anthropic.skilljar.com/claude-code-in-action
