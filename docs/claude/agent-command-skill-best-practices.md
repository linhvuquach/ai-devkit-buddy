# Claude Code: Agents, Commands & Skills - Decision Guide

## Overview

**Agents** are autonomous executors that make decisions and use tools to accomplish open-ended goals. **Commands** are deterministic, parameterized actions that execute predefined workflows. **Skills** are contextual knowledge bundles that augment Claude's capabilities without adding new tool access.

- **Agents** = "Figure out how and do it"
- **Commands** = "Do exactly this, with these inputs"
- **Skills** = "Know about this domain when working"

## Decision Framework

| Use Case                                          | Choose      | Why                                        |
| ------------------------------------------------- | ----------- | ------------------------------------------ |
| Multi-step exploration with unknown solution path | **Agent**   | Needs reasoning, tool selection, iteration |
| Repeatable workflow with clear inputs/outputs     | **Command** | Deterministic, fast, composable            |
| Domain expertise without new tools                | **Skill**   | Enhances quality without adding complexity |
| User needs control over exact steps               | **Command** | Predictable, debuggable, no surprises      |
| Task requires adaptive problem-solving            | **Agent**   | Can recover from failures, adjust strategy |
| Integrating external tool/API patterns            | **Command** | Encapsulates API logic, reusable           |
| Improving code style/conventions                  | **Skill**   | Passive guidance for all operations        |

**Key Decision Trigger**: If you can write a flowchart with <5 decision points → **Command**. If the flowchart has dynamic branching or unknowns → **Agent**. If it's knowledge not process → **Skill**.

## Best Practices

### Agents

- **Do**: Use for debugging sessions, exploratory refactoring, requirement discovery
- **Don't**: Use for operations requiring audit trails or regulatory compliance
- **Pitfall**: Over-relying on agents for simple tasks wastes tokens and time
- **Optimization**: Give agents clear success criteria and constraints upfront

### Commands

- **Do**: Chain commands for complex but deterministic workflows (e.g., `scaffold-api` → `add-tests` → `deploy`)
- **Don't**: Build commands that require subjective judgment calls
- **Pitfall**: Creating too many single-use commands instead of flexible parameterization
- **Optimization**: Design commands with composability in mind; return structured data for piping

### Skills

- **Do**: Create skills for project-specific patterns (architecture decisions, naming conventions)
- **Don't**: Duplicate tool functionality or add executable logic
- **Pitfall**: Overly verbose skills dilute focus; keep them <500 tokens
- **Optimization**: Reference external docs rather than embedding full specifications

## Examples

### Scenario 1: API Integration Project

```markdown
Problem: Integrate Stripe payment processing

❌ Wrong Approach:

- Create single agent "integrate-stripe" (too vague, unpredictable output)

✅ Right Approach:

1. **Skill**: `stripe-patterns.md` (error handling conventions, webhook signatures)
2. **Command**: `add-stripe-endpoint` (params: route, webhook_event)
   - Scaffolds boilerplate with correct error handling
3. **Agent**: "Debug webhook signature validation failures"
   - Uses skill context + command outputs to troubleshoot
```

### Scenario 2: Monorepo Refactoring

```markdown
Problem: Extract shared utilities into packages

✅ Strategy:

1. **Agent**: "Analyze cross-package dependencies and suggest extraction candidates"
   - Autonomous exploration, generates report
2. **Skill**: `monorepo-conventions.md` (import rules, package boundaries)
3. **Command**: `extract-package` (params: files[], target_package)
   - Deterministic move + update imports
4. **Command**: `update-workspace-deps`
   - Fixes package.json references
```

### Scenario 3: Legacy Code Migration

```markdown
Problem: Migrate class components to hooks

❌ Wrong: Agent for entire codebase (unpredictable, hard to review)

✅ Right:

1. **Command**: `analyze-component` (params: filepath) → returns complexity score
2. **Agent**: "Plan migration strategy for complex components" (uses analysis)
3. **Skill**: `react-hooks-patterns.md` (useEffect dependencies, custom hooks)
4. **Command**: `migrate-simple-component` (params: filepath, strategy)
5. Agent handles edge cases flagged during command execution
```

## Quick Checklist

**Use Agent if**:

- [ ] Success criteria subjective or exploratory
- [ ] Unknown number of steps required
- [ ] Need adaptive error recovery

**Use Command if**:

- [ ] Workflow is repeatable across projects
- [ ] Inputs/outputs clearly defined
- [ ] Need to compose with other commands

**Use Skill if**:

- [ ] Improving quality without new capabilities
- [ ] Encoding conventions/preferences
- [ ] Enhancing existing agent/command behavior

**Red Flags**:

- Agent has <3 tool calls → should be command
- Command has branching logic based on code analysis → should be agent
- Skill contains step-by-step instructions → should be command

## Summary

**Think in layers**: Skills set context, Commands execute deterministic workflows, Agents solve ambiguous problems. Start with Commands for 80% of repetitive work, add Skills for domain consistency, deploy Agents only when exploration or multi-step reasoning is essential. The best workflows **compose all three**: Skills guide, Commands automate, Agents adapt.

**Golden Rule**: Minimize agent surface area by maximizing command reusability and skill specificity.
