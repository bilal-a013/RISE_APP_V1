---
name: supabase-schema-and-migration-update
description: Workflow command scaffold for supabase-schema-and-migration-update in RISE_APP_V1.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /supabase-schema-and-migration-update

Use this workflow when working on **supabase-schema-and-migration-update** in `RISE_APP_V1`.

## Goal

Adds or updates a database table or schema, including creating a migration and updating related backend logic.

## Common Files

- `supabase/migrations/*.sql`
- `apps/web/src/lib/*.ts`
- `apps/web/src/app/(app)/*/page.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a migration SQL file in supabase/migrations/
- Update or create corresponding shared logic in apps/web/src/lib/*.ts
- Update or create related page component(s) in apps/web/src/app/(app)/*/page.tsx

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.