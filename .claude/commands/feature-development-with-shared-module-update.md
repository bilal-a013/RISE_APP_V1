---
name: feature-development-with-shared-module-update
description: Workflow command scaffold for feature-development-with-shared-module-update in RISE_APP_V1.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-with-shared-module-update

Use this workflow when working on **feature-development-with-shared-module-update** in `RISE_APP_V1`.

## Goal

Implements a new feature or foundation, involving updates to both page components and shared library modules.

## Common Files

- `apps/web/src/app/(app)/*/page.tsx`
- `apps/web/src/lib/*.ts`
- `apps/web/src/app/auth/*`
- `apps/web/src/lib/onboarding.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update page component(s) in apps/web/src/app/(app)/*/page.tsx
- Create or update related shared module(s) in apps/web/src/lib/*.ts
- Update or create any necessary auth or onboarding logic in apps/web/src/app/auth/* or apps/web/src/lib/onboarding.ts

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.