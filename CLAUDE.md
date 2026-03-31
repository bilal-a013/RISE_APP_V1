# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# RISE Tutoring App — Claude Context

## Commands

```bash
npm run dev        # Start web app (from repo root)
npm run build      # Build web app
npm run lint       # Lint web app
npm run typecheck  # TypeScript check (run from apps/web/)
```

No test suite is configured yet.

## What This Project Is
RISE is a premium GCSE self-study platform for UK students aged 13-16. It combines in-person tutoring sessions with an intelligent web/mobile app that picks up exactly where the tutor left off. The core philosophy: zero friction between opening the app and starting work.

## Monorepo Structure
- apps/web — Next.js 14 (App Router, TypeScript, Tailwind CSS) — the main web app
- apps/mobile — Expo 51 (React Native, NativeWind) — mobile app (not started yet)
- packages/shared — shared TypeScript types, constants, utility functions
- supabase/ — database migrations and seed files
- scripts/ — one-off scripts (content generation etc)

## Tech Stack
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS
- Mobile: Expo 51, React Native, NativeWind
- Database: Supabase (Postgres, RLS, Auth)
- AI: Anthropic Claude API (claude-sonnet-4-20250514)
- Monorepo: npm workspaces

## Working Directory
Always work from the repo root unless told otherwise.
Web app lives at: apps/web/
Shared types live at: packages/shared/src/types/index.ts

## Database — Supabase
Tables: subjects, topics, lessons, profiles, lesson_progress, student_sessions
All tables have RLS enabled.
Lessons table has a content jsonb column storing AI-generated lesson content.
lesson_progress has difficulty_level ('building' | 'getting_there' | 'confident') and lesson_1_score columns.

## Design System
- Background: linear-gradient(160deg, #EDE9FF 0%, #F3F0FF 40%, #FDFCFF 100%)
- Primary purple: #7C3AED
- Accent yellow: #FCD34D (used sparingly — CTAs only)
- Cards: white, rounded-3xl, shadow-lg
- Font: font-black for all headings
- Mobile-first: max-w-sm mx-auto
- Everything rounded, generous padding

## Key Product Decisions
1. Students open the app and see their current lesson immediately — zero friction
2. Every lesson has TWO parts: Learn (type=learn, difficulty=building) and Practise (type=practise, difficulty=getting_there or confident)
3. Lesson difficulty auto-sets based on lesson_1_score after completing the Learn lesson
4. Traffic light indicator on every lesson: 🔴 Building | 🟡 Getting There | 🟢 Confident
5. In-person tutor sessions are logged (via QR code) and surfaced on the home screen
6. AI tutor is context-aware — knows what the student covered with their tutor
7. Progress screen uses a Battle Pass mechanic (weekly strip + season tiers) not boring bar charts
8. Lesson content is stored in Supabase (generated once, served identically to all students)
9. Real-time AI reformatting by difficulty level is a later enhancement, not required for the current frontend
10. Interactive artifacts (FOIL grid, balance scale, fraction bar etc) are built as React components

## Current Frontend Behaviour
- Lesson rendering is pure React and reads from `lessons.content` in Supabase
- If `lessons.content` is populated, the app renders that content
- If `lessons.content` is null, the app falls back to `apps/web/src/lib/mockLessons.ts`
- Mock content currently covers all 3 seeded lessons
- The current experience does not require Anthropic to run
- The same lesson content currently renders for all difficulty levels

## Lesson Content Structure (lessons.content jsonb)
{
  hook: string,
  blocks: [{ type: 'concept'|'rule'|'example', heading, body, formula?, steps?, answer? }],
  interactive_type: 'foil_grid'|'balance_scale'|'fraction_aph_plotter'|'number_line'|'probability_tree'|'venn_diagram'|'generic_mcq',
  interactive_config: object,
  try_it: { question, interactive_config, answer, worked_solution[] },
  summary: string[]
}

## Difficulty Levels
- building: red 🔴 — more scaffolding, smaller steps, analogies
- getting_there: yellow 🟡 — standard pace
- confident: green 🟢 — concise, challenge extension added

## Interactive Artifact Components (to be built)
Each is a React component in `apps/web/src/components/artifacts/`:
- FOILGrid — drag terms into grid to expand double brackets
- BalanceScale — drag weights to solve equations
- FractionBar — visual fraction manipulation
- GraphPlotter — plot points and lines
- NumberLine — place values on a number line
- ProbabilityTree — build probability trees
- VennDiagram — drag items into Venn diagram sets
- GenericMCQ — multiple choice fallback

## Current Build Status
- ✅ Repo scaffolded (Next.js + Expo + shared packages)
- ✅ Supabase schema live and seeded
- ✅ 3 lessons have full content (solving-linear-equations, simplifying-expanding-expressions, fractions-adding-subtracting)
- ✅ Shared types updated with DifficultyLevel, DifficultyIndicator, DIFFICULTY_CONFIG
- ✅ Web frontend is built and running locally
- ✅ Home, subjects, progress, and lesson routes exist in `apps/web/src/app`
- ✅ Lesson UI renders hooks, content blocks, Try It, worked solutions, summary, and fallback mock content
- ✅ Supabase client/server setup is wired through env vars
- ✅ Next.js app runs from the repo root with `npm install` then `npm run dev`
- ✅ Next config uses `apps/web/next.config.mjs`

## Frontend Handoff
Claude should treat the web frontend as the active priority.

Current truth:
- The app runs locally
- The current web app is in `apps/web`
- The project is a git repository rooted at `RISE_APP_V1/.git`
- The frontend should be completed before adding any AI reformatting work
- Anthropic is out of scope for now

When continuing frontend work:
- Start from the repo root
- Run `npm run dev` from the repo root
- Use `apps/web/.env.local` for local Supabase credentials
- Do not edit `.env.example` with real secrets
- Use Supabase content when available and `mockLessons.ts` as fallback
- Preserve the current design system and mobile-first layout

Frontend focus areas remaining:
- Finish all user-facing routes and states
- Polish responsive layout, navigation, and empty/loading/error states
- Complete any missing interactive artifact components
- Ensure lesson flow, progress flow, and subject navigation feel production-ready
- Keep using shared types from `@rise/shared`
- Prefer server components unless interactivity requires client components

Git hygiene:
- Commit after each meaningful frontend feature
- Never commit `.env.local` or real credentials
- Ignore `.DS_Store`

## Environment Variables
apps/web/.env.local needs:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (scripts only, never expose to client)

Anthropic is not required to run the current frontend.

## Rules — Always Follow These
1. Never hardcode credentials — always use env vars
2. Never expose SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY to the client
3. Always use TypeScript — no any types
4. Mobile-first design — max-w-sm mx-auto on all pages
5. Use server components by default — only add 'use client' when needed
6. Always use the shared types from @rise/shared
7. Supabase client for server components: use service role only in scripts, anon key in the app
8. All colours must match the design system exactly
9. Keep UI components organised in `apps/web/src/components/`
10. Commit after every working feature
