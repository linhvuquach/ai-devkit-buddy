---
name: repo-onboarding
description: Scan an entire repository and write a complete onboarding document (purpose, structure, domain model, architecture diagram, APIs, infra, workflows, security, gotchas, setup checklist) to knowledge-base/onboarding.md. Use when the user asks to "onboard me to this repo", "document this codebase", "generate an onboarding doc", or wants a new engineer productive in 15–30 minutes.
---

# Repo Onboarding

Act as a codebase analyst, senior architect and onboarding writer. Understand how the system
works end to end and produce an accurate, complete onboarding document. Condense freely, but
never omit a critical concept. Every claim must come from files you read, not guesses; mark
inferences as inferred.

## Gather

Use code search, not just directory listing, across: source (backend, frontend, workers,
libs), config (Docker, compose, k8s, Terraform, CI/CD), package manifests, migrations and
schemas, tests, scripts, docs, env templates. On large repos, fan out with subagents per
top-level area and merge their notes.

Extract: domain entities, core modules, public APIs, event/message flows, database structure,
key business workflows, architectural decisions, integrations, important constants, config
switches and feature flags.

## Pipeline (do in order)

1. **Project** — purpose (from docs or inferred), user groups/clients, core problem.
2. **Structure** — scan folders recursively; per component record path, purpose, notable files
   (entry points, routing, schema, DI, pipelines) and how it fits.
3. **Domain** — entities, aggregates, enums, value objects, relationships; the system's
   mental model.
4. **Architecture** — components, data stores, integrations, queues, jobs, event flows,
   caching, search, auth providers, observability. Produce a **Mermaid diagram that renders**.
5. **APIs** — REST/GraphQL/gRPC/WebSocket/SDK methods: method, path/operation, purpose,
   request/response shape, key validation/middleware. Cover all key endpoints; group where
   possible ("all `/auth/*` endpoints do X").
6. **Infra** — local dev, env var contract, Docker/compose, CI/CD, k8s/IaC, logging/metrics,
   workers/cron. Explain build → test → deploy → runtime.
7. **Workflows** — step-by-step sequences for each major flow (signup/auth, creation,
   background jobs, publishing, billing, sync…).
8. **Security** — auth model/providers, roles/permissions, input validation, rate limits,
   secrets, secure storage, CORS/CSRF.
9. **Insights** — non-obvious decisions, performance-sensitive code, complexity and coupling
   hotspots, flaky tests, special constraints, missing docs, dead code, ownership hints.
10. **Checklist** — 5–15 practical steps: set up env, run dev, run tests, inspect DB, debug,
    key scripts, where to read next.

## Output

Write `knowledge-base/onboarding.md` (create the folder if needed) using the structure in
`references/output-template.md`. Skip a section only if it truly doesn't apply, and say so.
After writing, verify that the Mermaid block is syntactically valid and that referenced file
paths exist.
