# AI-DevKit Buddy

> A small package manager for AI agent skills: find, install and share `SKILL.md` folders across Claude Code, Cursor and Codex.

[![npm version](https://img.shields.io/npm/v/ai-devkit-buddy.svg)](https://www.npmjs.com/package/ai-devkit-buddy)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**AI-DevKit Buddy** is a CLI tool designed to help teams maintain consistent AI agent instructions across their projects. It ships a set of built-in skills and command templates, installs skills from any git or local registry, and records what you installed in `.ai-devkit-buddy.json` so a teammate can reproduce it with one command.

## Features

- **Multi-Agent Support**: Installs skills for **Claude Code** (`.claude/skills`), **Cursor** (`.cursor/skills`) and **OpenAI Codex** (`.agents/skills`).
- **Registries**: A registry is any git repo or local folder with `skills/<name>/SKILL.md`. The built-ins are just one registry.
- **Symlink by default**: Skills link into a shared cache (`~/.ai-devkit-buddy/skills-cache`), so one `skill update` refreshes every project. Use `--mode copy` for a local copy.
- **Search**: `skill find` searches an index of every registry you use.
- **Reproducible**: `.ai-devkit-buddy.json` lists environments, skills and extra registries; `install` replays it.

## Installation

You can use it directly with `npx` (recommended) or install it globally.

```bash
# Run directly
npx ai-devkit-buddy init

# Or install globally
npm install -g ai-devkit-buddy
```

## Usage

### Set up a project

```bash
# Interactive: pick agents, then built-in skills and commands
npx ai-devkit-buddy init

# Non-interactive: every built-in skill and command for Claude Code and Cursor
npx ai-devkit-buddy init -e claude,cursor --yes --built-in

# Reproduce a teammate's setup from .ai-devkit-buddy.json
npx ai-devkit-buddy install
```

| `init` flag              | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `-e, --environment`      | Comma-separated agents: `claude`, `cursor`, `codex` (`both` still works). |
| `--built-in`, `-a, --all` | Install every built-in skill and command template without prompting.   |
| `-y, --yes`              | Never prompt. Needs `-e`; installs nothing extra unless `--built-in`.   |
| `--overwrite`            | Replace existing command templates.                                     |

`install [-c <config>] [--overwrite]` applies a config file (default `.ai-devkit-buddy.json`) and exits non-zero on any failure or conflict.

### Manage skills

```bash
npx ai-devkit-buddy skill find interview            # search all registries
npx ai-devkit-buddy skill add anthropics/skills pdf # install one skill
npx ai-devkit-buddy skill add anthropics/skills     # pick interactively
npx ai-devkit-buddy skill add --built-in            # every built-in skill
npx ai-devkit-buddy skill list                      # what this project has
npx ai-devkit-buddy skill list anthropics/skills    # what a registry offers
npx ai-devkit-buddy skill remove pdf
npx ai-devkit-buddy skill update                    # pull cached registries
```

`skill add`, `list` and `remove` take `-g, --global` with `-e, --env <env...>` to work in your home directory instead of the project. `skill add` also takes `--mode link|copy`. `skill find` takes `--refresh`, `--limit <n>` and `--all`. The package ships a pre-built index of every official registry, so the first search works offline. `--refresh` clones the registries and rebuilds the index from their current content.

### Registries

```bash
npx ai-devkit-buddy skill add-registry acme/skills https://github.com/acme/skills.git
npx ai-devkit-buddy skill add-registry me/local ./my-skills   # local folder, used in place
npx ai-devkit-buddy skill remove-registry acme/skills
```

Add `-g` to write the global config (`~/.ai-devkit-buddy/config.json`) and `-f` to replace a conflicting source. The official registry list ships in `skills/registry.json`.

Set `AI_DEVKIT_BUDDY_HOME` to move the cache, index and global config away from `~/.ai-devkit-buddy`.

### Authoring skills

Run `npm run validate-skills [registry-root]` to lint a registry (default `src/templates`): valid folder names, matching frontmatter `name`, a `description` with a "Use when" trigger, and existing referenced files.

## Generated Structure

Skills come from `src/templates/skills/<name>/` (each with a `SKILL.md`) and command templates from `src/templates/commands/*.md`. New templates are picked up automatically; there is no list to maintain.

```
.claude/  (or .cursor/)
  ├── commands/
  │   └── compact.md
  └── skills/
      └── <skill-name> -> ~/.ai-devkit-buddy/skills-cache/<org>/<repo>/skills/<skill-name>
.agents/skills/<skill-name>   (Codex)
```

## Available Templates

**Commands**

| Name    | Description                                                               |
| ------- | ------------------------------------------------------------------------- |
| compact | Summarize the conversation so work can continue in a smaller context window. |

**Skills**

| Name                     | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| goal-review-coach        | Review, score and coach improvements to an individual work goal.        |
| gamify-prototype         | Build gamified interactive HTML design prototypes.                      |
| pattern-match-algorithm  | Map a coding problem to 1–2 likely algorithm patterns.                  |
| repo-onboarding          | Scan a repo and write a full onboarding document.                       |
| tech-interviewer         | Run a mock interview or generate questions (frontend, C#/.NET, database). |
| technical-topic-explorer | Feynman-style explainer grounded in cited production case studies.      |
| ts-code-kata             | Practice TypeScript code katas with strict TDD.                         |

## License

ISC © [linhvuquach](https://github.com/linhvuquach)
