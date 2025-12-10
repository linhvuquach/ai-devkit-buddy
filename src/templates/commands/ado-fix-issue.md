---
description: Fix an issue, use Azure Devops MCP server to get the work item details
prequesites:
  - Setup Azure Devops MCP server: https://github.com/microsoft/azure-devops-mcp/blob/main/docs/GETTINGSTARTED.md
---

# Fix Issue Command

Identify and resolve code issues

## Instructions

Follow this structured approach to analyze and fix issues: **$ARGUMENTS**

1. **Issue Analysis**

   - Use `Azure DevOps MCP server tools` to get issue details
   - Read the issue description, comments, and any attached logs/screenshots
   - Identify the type of issue (bug, feature request, enhancement, etc.)
   - Understand the expected vs actual behavior

2. **Environment Setup**

   - Ensure you're on the correct branch (usually main/master)
   - Pull latest changes: git pull origin main
   - Create a new feature branch: git checkout -b fix/issue-$ARGUMENTS

3. **Reproduce the Issue**

   - Follow the steps to reproduce described in the issue
   - Set up the development environment if needed
   - Run the application/tests to confirm the issue exists
   - Document the current behavior

4. **Root Cause Analysis**

   - Search the codebase for relevant files and functions
   - Use grep/search tools to locate the problematic code
   - Analyze the code logic and identify the root cause
   - Check for related issues or similar patterns

5. **Solution Design**

   - Design a fix that addresses the root cause, not just symptoms
   - Consider edge cases and potential side effects
   - Ensure the solution follows project conventions and patterns
   - Plan for backward compatibility if needed

6. **Implementation**

   - Implement the fix with clean, readable code
   - Follow the project's coding standards and style
   - Add appropriate error handling and logging
   - Keep changes minimal and focused

7. **Testing Strategy** (if it's already implemented)

   - Write or update tests to cover the fix
   - Ensure existing tests still pass
   - Test edge cases and error conditions
   - Run the full test suite to check for regressions

8. **Code Quality Checks**

   - Run linting and formatting tools
   - Perform static analysis if available
   - Check for security implications
   - Ensure performance isn't negatively impacted

9. **Documentation Updates**
   - Update relevant documentation if needed
   - Add or update code comments for clarity
   - Update changelog if the project maintains one
   - Document any breaking changes

Remember to communicate clearly in both code and comments, and always prioritize maintainable solutions over quick fixes.
