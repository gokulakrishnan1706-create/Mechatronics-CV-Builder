---
description: How to regenerate AI_CONTEXT.md after code changes
---

# Update AI Context

After making code changes, regenerate the AI context file:

// turbo
1. Run `npm run ai-context` from the project root to regenerate `AI_CONTEXT.md`

This scans all files in `src/` and produces a compact summary with:
- File map (names, line counts, sizes, exports, feature flags)
- Dependency graph (which files import which)
- Key state variables per component
- Tech stack and environment variable names
- Architecture notes

## When to Run
- After adding/removing/renaming files
- After significant code changes
- Before switching to a new AI assistant
- Before starting a new conversation with an AI
