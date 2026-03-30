# RISE Tutoring App — Claude Context

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
l (web), Expo (mobile)
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
2. Every lesson has TWO parts: Learn (type=learn, diffibuilding) and Practise (type=practise, difficulty=getting_there or confident)
3. Lesson difficulty auto-sets based on lesson_1_score after completing the Learn lesson
4. Traffic light indicator on every lesson: 🔴 Building | 🟡 Getting There | 🟢 Confident
5. In-person tutor sessions are logged (via QR code) and surfaced on the home screen
6. AI tutor is context-aware — knows what the student covered with their tutor
7. Progress screen uses a Battle Pass mechanic (weekly strip + season tiers) not boring bar charts
8. Lesson content is stored in Supabase (generated once, served identically to all students)
9. Claude API reformats content presentation based on student difficulty level
10. Interactive artifacts (FOIL grid, balance scale, fraction bar etc) are built as React components

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
Each is a React component in apps/web/components/artifacts/:
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
- ✅ Supabase schema live (6 tables, RLS,seeded (Foundation tier, learn type)
- ✅ 3 lessons have full content (solving-linear-equations, simplifying-expanding-expressions, fractions-adding-subtracting)
- ✅ Shared types updated with DifficultyLevel, DifficultyIndicator, DIFFICULTY_CONFIG
- 🔴 Frontend not started yet

## Environment Variables
apps/web/.env.local needs:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ANTHROPIC_API_KEY
- SUPABASE_SERVICE_ROLE_KEY (scripts only, never expose to client)

## Rules — Always Follow These
1. Never hardcode credentials — always use env vars
2. Never expose SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY to the client
3. Always use TypeScript — no any types
4. Mobile-first design — max-w-sm mx-auto on all pages
5. Use server components by default — only add 'use client' when needed
6. Always use the shared types from @rise/shared
7. Supabase client for server components: use service role only in scripts, anon key in the app
8. All colours must match the design system exactly
9. Keall and in apps/web/components/
10. Commit after every working feature
