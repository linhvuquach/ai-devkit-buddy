# AI-DevKit Buddy

> Streamline your AI-assisted development workflow by generating standardized prompt templates for AI coding assistants.

[![npm version](https://img.shields.io/npm/v/ai-devkit-buddy.svg)](https://www.npmjs.com/package/ai-devkit-buddy)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**AI-DevKit Buddy** is a CLI tool designed to help teams maintain consistent AI agent instructions across their projects. It automatically generates structured prompt templates for various development phases (Requirements, Design, Planning, Coding, Review) compatible with popular AI coding assistants.

## Features

- **Unified Templates**: Standardized prompts for every stage of development.
- **Multi-Agent Support**: Generates commands for **Cursor** (`.cursor/commands/`) and **Claude Code** (`.claude/commands/`).
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

Follow the prompts to select your target environment (Cursor/Claude) and the command types you want to configure.

### CLI Flags

You can also skip the prompts by using flags:

```bash
# Initialize everything for Cursor
npx ai-devkit-buddy init -e cursor -a

# Initialize specific types for both environments
npx ai-devkit-buddy init -e both -t refine-new-us-azure-devops
```

#### Options

| Flag            | Alias | Description                                                                  |
| --------------- | ----- | ---------------------------------------------------------------------------- |
| `--environment` | `-e`  | Target environment: `cursor`, `claude`, or `both`.                           |
| `--all`         | `-a`  | Initialize all available types.                                              |
| `--types`       | `-t`  | Comma-separated list of types (e.g., `onboarding, capture-knowledge, .etc`). |
| `--help`        | `-h`  | Display help message.                                                        |
| `--version`     | `-v`  | Display version number.                                                      |

## Generated Structure

Depending on your selection, the tool will generate markdown templates in the following locations:

**Cursor**

```
.cursor/
  └── commands/
      └── onboarding.md
      └── refine-new-us-azure-devops.md
      └── capture-knowledge.md
```

**Claude**

```
.claude/
  └── commands/
      └── onboarding.md
      └── refine-new-us-azure-devops.md
      └── capture-knowledge.md
```

## Supported Command Types

1.  **refine-new-us-azure-devops**: Refine a new user story using Azure DevOps MCP server.
2.  **capture-knowledge**: Capture knowledge of a code entry point and save it to the knowledge docs.

## License

ISC © [linhvuquach](https://github.com/linhvuquach)
