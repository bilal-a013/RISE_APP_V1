# RISE App — Project Context

## Commands

```bash
npm run dev        # Start web app (from repo root)
npm run build      # Build web app
npm run lint       # Lint web app
npm run typecheck  # TypeScript check (run from apps/web/)
```

No test suite is configured yet.

## What This Project Is
RISE is a GCSE maths study product built around a sharper first-time student experience.

The current product direction is:
- New students should get a short, beautified onboarding instead of a plain sign-up form.
- Students should land in a dashboard that recommends what they should do next right now.
- Students must still be able to ignore the recommendation and choose what they want to learn.
- Tutor-linked student journeys matter, but the full tutor system is later work.
- For now, the tutor-linked path is scaffolded with a dummy tutor-code flow.
- For now, maths is the only visible subject. Other subjects are intentionally out of the UI until maths is stronger.

## Current Product Truth
- There are now two entry routes:
  - `new student`
  - `tutor code`
- New-student onboarding asks for:
  - name
  - age range
  - working level
  - target grade
  - guidance style
- Tutor-code onboarding is currently a scaffold, not a full tutor platform.
- The demo tutor code is `RAYAN-SIMS`.
- Tutor codes currently preload onboarding data through app logic, not a dedicated tutor dashboard yet.
- The home dashboard now acts like a guided launchpad, not just a generic signed-in screen.
- Streak and XP cards are interactive and open the full progress view.
- In-progress lesson previews on the home screen are slightly blurred so the main CTA is to continue.
- The app is maths-only in the visible browsing experience right now.

## Immediate Product Priorities
1. Make the new-user maths journey feel premium, obvious, and friction-light.
2. Keep the dashboard recommendation smart and useful without removing student choice.
3. Keep tightening the maths lesson flow before reopening other subjects.
4. Preserve room for a future tutor-side system that logs one-to-one sessions and feeds the student app.
5. Avoid building the full tutor tooling too early; the tutor-code scaffold is enough for now.

## Monorepo Structure
- `apps/web` — Next.js 14 App Router, TypeScript, Tailwind CSS
- `apps/mobile` — placeholder only, not active yet
- `packages/shared` — shared TypeScript types and constants
- `supabase/` — not yet initialised; placeholder for future schema and migrations

## Tech Stack
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS
- Database/Auth: Supabase
- Monorepo: npm workspaces
- Live AI requirement: not required for the current frontend

## Active Web Routes
Routes inside `(app)/` are authenticated and share the app shell layout.

- `/` — splash/entry page; redirects authenticated users to `/home`
- `/auth/start` — choose `new student` or `tutor code`
- `/auth/signup` — multi-step onboarding-led signup
- `/auth/tutor-code` — dummy tutor-code entry
- `/auth/login` — returning student login
- `/auth/callback` — OAuth callback handler (Next.js route handler)
- `/home` — personalised home dashboard (`(app)/home`)
- `/subjects` — maths hub (`(app)/subjects`)
- `/subjects/[slug]` — maths subject overview
- `/lessons/[id]` — lesson experience
- `/progress` — full progress dashboard

## Key Files To Know
- `apps/web/src/app/page.tsx` — splash/entry page
- `apps/web/src/app/(app)/home/page.tsx` — personalised home dashboard
- `apps/web/src/app/auth/actions.ts` — auth actions and onboarding metadata handling
- `apps/web/src/app/auth/callback/route.ts` — OAuth callback handler
- `apps/web/src/app/auth/start/page.tsx` — start-path chooser
- `apps/web/src/app/auth/tutor-code/page.tsx` — dummy tutor-code flow
- `apps/web/src/app/actions/lesson.ts` — lesson completion server action
- `apps/web/src/components/auth/NewStudentSignupFlow.tsx` — multi-step signup onboarding
- `apps/web/src/components/layout/BottomNav.tsx` — desktop/mobile nav shell
- `apps/web/src/components/lesson/LessonContent.tsx` — lesson renderer
- `apps/web/src/components/artifacts/GenericMCQ.tsx` — interactive MCQ artifact
- `apps/web/src/components/ui/DifficultyBadge.tsx` — traffic-light difficulty badge
- `apps/web/src/app/(app)/subjects/page.tsx` — maths-only browsing hub
- `apps/web/src/app/(app)/progress/page.tsx` — full progress view linked from home cards
- `apps/web/src/lib/onboarding.ts` — onboarding options, tutor-code preset, recommendation helpers
- `apps/web/src/lib/supabase/client.ts` — browser Supabase client
- `apps/web/src/lib/supabase/server.ts` — server Supabase client
- `apps/web/src/app/globals.css` — current design tokens and shell classes

## Data Model Notes
Current important tables:
- `subjects`
- `topics`
- `lessons`
- `profiles`
- `lesson_progress`
- `student_sessions`

Important current usage:
- Auth user metadata now stores onboarding answers like:
  - `full_name`
  - `age_range`
  - `working_level`
  - `target_grade`
  - `study_style`
  - `preferred_subject`
  - `onboarding_mode`
  - `tutor_code`
  - `recommended_topic`
  - `onboarding_complete`
- `student_sessions` still represent tutor-linked context on the student side.
- The future tutor system should eventually become the source of truth for tutor codes and session logging.

## Current Design Direction
The app's visual language mirrors the Rise Tutoring Website (Far15M/Rise-Tutoring-Website).
- **Font:** Outfit (Google Fonts, weights 300–800)
- **Background:** Fixed pastel gradient on `html` — linear-gradient(135deg, #e2d6ff → #ccece9 → #fcecc8 → #f8d5e4 → #e2d6ff), background-attachment: fixed
- **Primary:** `#7C3AED` (Tailwind `primary-600`) with full 50–950 scale
- **Secondary:** `#1E1B4B` for headings; `#6B6394` for body text
- **Cards:** `.glass-card` (white 65%, blur 20px) and `.glass-card-solid` (white 85%)
- **Buttons:** `.rise-btn-primary` (purple gradient), `.rise-btn-outline` (transparent + purple border)
- **Sidebar:** Light glass white, not dark
- Premium but direct, not over-decorated. Maths-first copy throughout.

## UI Rules That Matter Right Now
- Do not reintroduce other visible subjects like geography, English, or science.
- Keep the home dashboard recommendation prominent.
- Keep a clear alternative path for students who want to choose their own topic.
- Treat clickable summary cards as real navigation, not dead decoration.
- Preserve the slightly blurred in-progress lesson preview behaviour on the home screen unless intentionally redesigning it.
- Keep copy shorter, clearer, and less generic.

## Lesson Architecture (v2)

### Subject scope
RISE is Edexcel GCSE Maths only. All lesson content and UI copy is maths-specific.

### Lesson pairs
Every subtopic is split into exactly two lessons:
1. **Learn** (`type: 'learn'`) — teaches the concept
2. **Practise** (`type: 'practise'`) — builds fluency with 5 graded questions

### Content format
All lesson content is typed in `packages/shared/src/types/index.ts` as `AnyLessonContent`.

**v2 Learn lesson** (`LearnLessonContent`):
- `intro` — topic name + what you will learn
- `why_it_matters` — 2–3 bullet points
- `explanation` — body, optional formula, optional key terms
- `visual` — prebuilt interactive config (no runtime AI)
- `worked_example` — question + numbered steps + answer
- `summary` — 3–5 key points
- `scaffolding` — optional: `simplified_explanation` + `extra_hints` for `building`; `extension_note` for `confident`

**v2 Practise lesson** (`PractiseLessonContent`):
- `orientation` — one-sentence reminder of what is being practised
- `worked_example` — model question shown before the student starts
- `questions` — exactly 5, ordered easier → harder; each has optional `hint` (shown to `building` students)
- `common_mistakes` — 2–3 entries, each collapsible
- `summary` — method checklist

**Legacy v1** (`LessonContent`) — kept for backward compatibility with existing Supabase data.

### Type guards
Use `isLearnContent(c)`, `isPractiseContent(c)`, `isLegacyContent(c)` from `@rise/shared` to narrow content type before rendering.

### Support-level adaptation
`building` / `getting_there` / `confident` controls scaffolding intensity **not** topic or lesson identity:
- `building`: shows `simplified_explanation`, `extra_hints`, and per-question `hint` prompts
- `getting_there`: standard content only
- `confident`: shows `extension_note`
No runtime AI. All scaffolding content is prebuilt in the lesson object.

### Tutor banner
The tutor banner in the lesson page (`/lessons/[id]`) is shown **only** when `student_sessions.topics_covered` contains the current lesson's topic name for the authenticated student. It is never shown based on onboarding mode alone. No fake always-on tutor messaging.

### Mock content fallback
- Lesson content is read from `lessons.content` in Supabase.
- If null, falls back to `apps/web/src/lib/mockLessons.ts`.
- Mock content includes full v2 learn/practise pairs for:
  - Solving Linear Equations (learn + practise)
  - Expanding Brackets (learn + practise)
  - Legacy fractions content (v1, backward compat)

## Difficulty Levels
- `building`
- `getting_there`
- `confident`

These drive the traffic-light difficulty system, progress summaries, and scaffolding in lessons.

## Frontend Build Status
- ✅ Web app runs locally
- ✅ Personalised home dashboard exists
- ✅ New-student onboarding flow exists
- ✅ Tutor-code scaffold exists
- ✅ Maths-only browsing flow exists
- ✅ Progress page can be opened from home cards
- ✅ Lesson rendering is wired
- ✅ Supabase client/server setup is wired
- ✅ `npm run build --workspace=apps/web` passes

## Known Gaps / Later Work
- The actual tutor-side app/system does not exist yet.
- Tutor codes are still dummy presets in app logic, not database-driven or generated from tutor notes.
- Other subjects are intentionally hidden for now.
- More interactive lesson artifacts can still be built out later.
- ESLint is not fully set up in this repo yet; `next lint` currently stops at initial configuration.

## Working Conventions
- Work from the repo root unless told otherwise.
- Run the web app from the repo root with `npm run dev`.
- Prefer server components unless interactivity is required.
- Use shared types from `@rise/shared`.
- Never hardcode credentials.
- Never expose service-role keys or private API keys to the client.
- Keep `.env.local` private and out of commits.
- Ignore `.DS_Store`.

## Environment Variables
`apps/web/.env.local` needs:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for scripts only, never for client exposure
