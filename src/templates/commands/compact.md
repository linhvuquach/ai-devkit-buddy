# Compact Conversation

Summarize the current conversation into a compact, structured form so work can continue with a smaller context window, without losing any information needed to keep going.

## Instructions

Produce a summary of the conversation so far. The summary must be thorough and technically precise, focusing on information that is essential for continuing the work. Structure it using the sections below, in order. Omit a section only if it is genuinely empty.

1. **Primary Request and Intent**

   - Capture the user's explicit goals and requirements in their own words where possible.
   - Include all stated constraints, preferences, and follow-up instructions, not just the original ask.

2. **Key Technical Concepts**

   - List frameworks, languages, libraries, architectural patterns, and domain concepts discussed.
   - Note any conventions or standards the user asked to follow.

3. **Files and Code Sections**

   - List every file that was read, created, or modified, with its path.
   - For each, note why it matters and summarize the relevant changes or findings.
   - Include short code snippets only when they are important for understanding state (e.g., a signature that changed, a config value).

4. **Errors and Fixes**

   - List errors or failures encountered (build failures, test failures, bugs) and how each was resolved.
   - Note any user feedback that corrected the approach, and what changed as a result.

5. **Problem Solving**

   - Summarize problems solved so far and the reasoning behind key decisions.
   - Note any ongoing troubleshooting or open technical questions.

6. **All User Messages**

   - List all non-tool-result user messages in order, verbatim or near-verbatim.
   - This is critical for tracking the exact sequence of user intent and feedback over time.

7. **Pending Tasks**

   - List outstanding work items the user explicitly asked for that are not yet done.

8. **Current Work**

   - Describe precisely what was being worked on immediately before this summary was produced.
   - Include the specific file, function, or task, with enough detail to resume without re-deriving context.

9. **Next Step (optional)**

   - State the next action to take, only if it follows directly from the most recent work and matches the user's explicit request.
   - Quote the user's own words for the task being continued to confirm alignment.
   - If the most recent work was already completed and there is no explicit follow-up request, do not invent a next step — state that the task is complete and await further instruction.

## Output Format

Wrap the summary in a top-level `# Compact Summary` heading. After producing it, treat it as the full context for the conversation going forward: continue the work using only the information captured above plus any files you re-read as needed, rather than relying on the original untruncated history.
