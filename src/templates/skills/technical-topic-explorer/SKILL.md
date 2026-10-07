---
name: technical-topic-explorer
description: Explore and learn a technical topic (concept, technology, protocol, pattern, algorithm, system) with a Feynman-technique explainer grounded in real big-tech production case studies and cited engineering sources. Use when the user says "explain X", "help me understand Y", "I want to learn Z", "deep dive on this topic", or names an unfamiliar technology and wants to understand it. Also covers misconception checks and self-test questions.
---

# Technical Topic Explorer

Explore a technical topic the way a strong senior engineer would: build a genuinely simple
mental model (Feynman technique), test it against reality, then ground it in how real companies
use it in production, with real citations. This is a fuller exploration, not a short brief;
take the space you need, but every sentence must teach something specific.

## Workflow

### 1. Scope the topic

Infer and state your assumption; ask at most one clarifying question, and only if truly
ambiguous.
- What exactly is the topic? ("event sourcing" vs "event sourcing in microservices")
- Learner's starting point: total beginner, or adjacent knowledge (knows Kafka, learning event
  sourcing)? This picks analogies and depth.
- Angle: a decision to make, a system to design, or pure curiosity?

### 2. Research (don't skip)

Use whatever web search/fetch tool your environment provides. Don't rely on training
knowledge alone for case studies — numbers, architecture choices and dates must be verified.
If you have no web tool, say so up front and label every case-study detail as unverified.

- **Track A — production case studies:** how Google, Meta, Netflix, Amazon/AWS, Uber, Airbnb,
  LinkedIn, Stripe, Microsoft, Shopify, Discord, Dropbox, Cloudflare, etc. built or used it.
  Queries: `"<topic>" engineering blog`, `<topic> case study scale`,
  `<topic> postmortem OR outage` (production pain is the most instructive part).
- **Track B — primary sources:** the original paper/RFC/pioneering company, plus 1–2
  well-regarded independent explainers, so the simple explanation isn't a popular
  oversimplification.

Find 2–4 credible, citable sources. If the topic is niche and big-tech cases don't exist, say
so instead of stretching a tenuous connection.

### 3. Build the Feynman explanation

Apply the four steps as a process, not just "use simple words". Details and worked examples
(DNS, JavaScript event loop) are in `references/feynman-method.md`.

1. **Choose** the topic (done in step 1).
2. **Explain** it to a smart outsider (a 12-year-old should follow), no unexplained jargon.
3. **Find the gaps** — check the draft against the research; name where it oversimplifies.
4. **Simplify and refine** with an analogy that maps structurally onto the mechanism and makes
   the *trade-offs* intuitive, not just the happy path. Start from the problem that motivated
   the concept, not the formal definition.

### 4. Assemble the output

Headers may adapt to the topic, but cover all of these:

1. **The problem it solves** — what breaks or hurts without it, concretely.
2. **Simple explanation** — plain language plus the core analogy.
3. **Where the simple version breaks down** — the named gap; this is where depth belongs.
4. **How it actually works** — mechanics one level deeper (≤5 steps for the core flow); use a
   Mermaid diagram if the topic is structural or flow-based.
5. **Common misconceptions** — 2–3 genuinely common ones, each as *Misconception → Reality*.
6. **Real-world production case studies** — 2–4 cited companies: why they chose it and what
   surprised them (postmortems and lessons-learned posts are gold).
7. **Trade-offs and when NOT to use it.**
8. **Connect the dots** — how it relates to 2–3 adjacent concepts the learner likely knows.
9. **Test your understanding** — 3 questions (easy, medium, hard) with clear, verifiable
   answers; offer the answers on request.
10. **Sources** — the specific posts/papers used.

If the user asks to go deeper on a sub-topic, re-run steps 2–4 on that sub-topic.

### 5. Citation discipline

Attribute every specific claim (number, architecture decision, incident, quote) inline, e.g.
"per Netflix's engineering blog". Paraphrase; never reproduce large verbatim chunks. If you
aren't confident a detail is accurate, mark it or drop it.

## Output notes

- Default to a structured chat response. Save a file only if the user asks or it's clearly long
  enough to benefit.
- No textbook filler ("X is an important concept in modern software engineering…").
- End with 1–2 follow-up threads the user might pull on next.
