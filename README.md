# AI-DevKit Buddy

> Streamline your AI-assisted development workflow by generating standardized prompt templates for AI coding assistants.

[![npm version](https://img.shields.io/npm/v/ai-devkit-buddy.svg)](https://www.npmjs.com/package/ai-devkit-buddy)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**AI-DevKit Buddy** is a CLI tool designed to help teams maintain consistent AI agent instructions across their projects. It automatically generates structured prompt templates for various development phases (Requirements, Design, Planning, Coding, Review) compatible with popular AI coding assistants.

## Features

- **Unified Templates**: Standardized prompts for every stage of development.
- **Multi-Agent Support**: Generates commands and skills for **Cursor** (`.cursor/`) and **Claude Code** (`.claude/`).
- **Flexible Setup**: Initialize specific phases or the entire suite.
- **State Tracking**: Keeps track of your configuration in `.ai-devkit-buddy.json`.

## Installation

You can use it directly with `npx` (recommended) or install it globally.

```bash
# Run directly
npx ai-devkit-buddy init

# Or install globally
npm install -g ai-devkit-buddy
```

## Usage

### Interactive Mode

Simply run the `init` command to start the interactive wizard:

```bash
npx ai-devkit-buddy init
```

Follow the prompts to select your target environment (Cursor/Claude) and the commands and skills you want to install.

### CLI Flags

You can also skip the prompts by using flags:

```bash
# Initialize everything for Cursor
npx ai-devkit-buddy init -e cursor -a

# Initialize specific types for both environments
npx ai-devkit-buddy init -e both -t compact,ts-code-kata
```

#### Options

| Flag            | Alias | Description                                                                  |
| --------------- | ----- | ---------------------------------------------------------------------------- |
| `--environment` | `-e`  | Target environment: `cursor`, `claude`, or `both`.                           |
| `--all`         | `-a`  | Initialize all available types.                                              |
| `--types`       | `-t`  | Comma-separated list of types (e.g., `compact, ts-code-kata`). |
| `--help`        | `-h`  | Display help message.                                                        |
| `--version`     | `-v`  | Display version number.                                                      |

## Generated Structure

Commands are copied from `src/templates/commands/*.md` and skills from `src/templates/skills/<name>/` (each with a `SKILL.md`). New templates are picked up automatically; there is no list to maintain.

```
.cursor/  (or .claude/)
  ├── commands/
  │   └── compact.md
  └── skills/
      └── <skill-name>/SKILL.md (+ references/)
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

