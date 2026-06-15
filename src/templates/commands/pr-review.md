# Pull Request Review

Review a GitHub pull request thoroughly using the `gh` CLI.

## Instructions

Follow these steps to conduct a thorough PR review:

1. **Discover Open PRs (if no PR number is given)**

   - Run `gh pr list` to show all open pull requests
   - Ask the user which PR number to review before proceeding

2. **Fetch PR Metadata**

   Run the following to get PR details:
   ```
   gh pr view <number> --json title,body,author,baseRefName,headRefName,state,additions,deletions,changedFiles,labels
   ```

3. **Fetch the Diff**

   ```
   gh pr diff <number>
   ```

4. **Analyze and Review**

   Provide a thorough review covering:

   - **Overview** — What the PR does, its purpose, and scope of changes
   - **Code Quality & Style** — Consistency with project conventions, naming, formatting
   - **Correctness** — Logic errors, edge cases, off-by-one errors, null/undefined handling
   - **Performance** — Inefficient algorithms, unnecessary re-renders, N+1 queries, memory leaks
   - **Security** — Injection vulnerabilities, exposed secrets, missing input validation, broken auth
   - **Test Coverage** — Whether changes are tested, quality of new/existing tests, missing scenarios
   - **Specific Suggestions** — Concrete, actionable improvements with file and line references where possible
   - **Risks** — Any breaking changes, migration concerns, or deployment considerations

## Output Format

Use clear sections and bullet points. Prioritize findings by severity:

- **Critical** — Must fix before merging (correctness bugs, security issues)
- **High** — Should fix before merging (missing tests, performance problems)
- **Medium** — Nice to fix (style, minor refactors)
- **Low** — Optional improvements or future work

Keep the review concise but thorough. Be constructive — explain *why* a change is needed, not just *what* to change.
