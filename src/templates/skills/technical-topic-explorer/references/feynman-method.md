# Feynman method: rules and worked examples

## The four steps

1. **Choose** a topic.
2. **Explain** it as if teaching a 12-year-old.
3. **Identify gaps** where the explanation breaks down.
4. **Simplify and refine** using analogies and plain language.

## Quality rules

- Zero jargon in the simple explanation; a 12-year-old must be able to follow it.
- Every analogy must map accurately to the real concept. No misleading simplifications; if an
  analogy fails somewhere, say where.
- "How it works" core flow: ≤5 steps.
- Misconceptions must be genuinely common, not trivial.
- Self-check questions must have clear, verifiable answers.
- Keep each section concise.

## Worked example 1: DNS

**Simple explanation:** DNS is the phone book of the internet. Typing `google.com` gives your
computer a name, not a location, so it asks DNS for the actual address (IP), like looking up a
restaurant's street address by its name.

**How it works:**
1. You type `google.com`.
2. Your computer checks its local cache.
3. If unknown, it asks a recursive resolver (usually your ISP's).
4. The resolver walks the hierarchy: root → `.com` nameserver → `google.com` nameserver.
5. The final nameserver returns the IP (e.g. `142.250.80.46`) and your browser connects.

**Misconceptions:**
- "DNS only runs once" → results are cached with a TTL; after it expires the lookup repeats.
- "There's one DNS server" → it's a distributed hierarchy of thousands of servers.

**Connect the dots:** caching (TTL at every layer); load balancing (DNS can return different
IPs).

**Test:** (Easy) What does DNS translate a name into? (Medium) What happens when a cache entry
expires? (Hard) How could DNS poisoning redirect users to a malicious site?

## Worked example 2: JavaScript event loop

**Simple explanation:** A chef (JavaScript) can only do one thing at a time. When a dish needs
10 minutes in the oven, they set a timer and start the next order. When it rings, they return
to finish the dish. The event loop manages the timers and tells the chef when to come back.

**How it works:**
1. Code runs line by line on the single-threaded **call stack**.
2. An async operation (timer, fetch, I/O) is handed to the runtime APIs.
3. When it completes, its callback goes into the **task queue**.
4. The **event loop** asks "is the stack empty?" and if so pushes the next callback onto it.
5. Repeat forever.

**Misconceptions:**
- "JS is multi-threaded because it handles async" → it's single-threaded; async work is
  delegated to the runtime.
- "`setTimeout(fn, 0)` runs immediately" → it runs after the stack clears and microtasks
  finish; 0 ms is a minimum delay, not a guarantee.

**Connect the dots:** cooperative multitasking (Python `asyncio`); microtasks vs macrotasks
(Promises run before `setTimeout` callbacks).

**Test:** (Easy) Can JS run two functions at the exact same time on its main thread? (Medium)
In what order does this log: `console.log('A'); setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));`? (Hard) Why can a long synchronous loop freeze
the UI even with pending async callbacks?
