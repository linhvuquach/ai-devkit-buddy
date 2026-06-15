---
description: Discover top Claude Code setup repositories for React
---

You are a senior software engineer and open-source researcher specializing in React, AI-assisted development workflows, and production-grade architecture. You are highly skilled at evaluating GitHub repositories for real-world usability, maintainability, and scalability.

---

## **Context**

We are looking for the best GitHub repositories that demonstrate how to set up and use Claude Code (Anthropic Claude API or tooling) in a **production-ready React project**.

The goal is to identify repositories that go beyond simple demos and showcase:

- Clean architecture
- Scalable folder structure
- Real-world patterns (state management, API integration, error handling)
- Claude integration (prompt orchestration, streaming, structured outputs, etc.)
- Developer experience (DX), testing, and deployment readiness

---

## Task

Search GitHub and identify the **top 10 repositories** that meet the following criteria:

1. Use **React (or Next.js)** as the frontend framework
2. Integrate **Claude Code (Anthropic API or SDK)**
3. Demonstrate **production-ready practices**, including:
   - Environment configuration (.env, secrets handling)
   - API abstraction layer
   - Error handling & retries
   - Modular and scalable architecture
   - Code quality (TypeScript preferred)
4. Have strong **signals of quality**, such as:
   - Stars (relative, not absolute)
   - Recent commits (actively maintained)
   - Clear README and documentation
   - Real-world use case (not toy/demo only)

For each repository:

- Analyze structure, architecture, and Claude integration approach
- Identify why it is production-ready
- Extract reusable patterns

---

## **Format**

Return output in **Markdown table format**:

| Rank | Repo Name | GitHub URL | Tech Stack | Claude Integration Type | Why It's Production-Ready | Key Patterns to Reuse |
| ---- | --------- | ---------- | ---------- | ----------------------- | ------------------------- | --------------------- |

Then include a **summary section**:

#### Key Insights

- Top 3 common architectural patterns
- Common mistakes to avoid
- Recommended "starter blueprint" approach

---

## **Examples**

#### Example 1 (Good)

- Repo: "ai-chat-app-nextjs"
- Why: Uses Next.js API routes for Claude, streaming responses, clean separation of UI and AI logic, proper env handling
- Pattern: API abstraction + hooks-based AI client

#### Example 2 (Bad - Exclude)

- Repo: Simple React app calling Claude API directly in component
- Why: No backend, no security, no architecture → NOT production-ready

---

## **Constraints**

- Only include repositories with **public GitHub URLs**
- Exclude:
  - Toy demos or minimal examples
  - Repos without clear Claude integration
  - Outdated or unmaintained repos
- Prefer:
  - TypeScript over JavaScript
  - Next.js over plain React (if applicable)
- Ensure diversity in approaches (not 10 clones of same template)
- Keep explanations concise but specific (no vague statements)

---

## **Output Validation Checklist (MUST PASS)**

- Exactly 10 repositories listed
- Each repo includes all required columns
- Each "Why It's Production-Ready" is concrete and verifiable
- No duplicate or low-quality repos
