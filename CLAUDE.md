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
- `supabase/` — schema, migrations, and seed data if/when present
- `scripts/` — one-off scripts

## Tech Stack
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS
- Database/Auth: Supabase
- Monorepo: npm workspaces
- Live AI requirement: not required for the current frontend

## Active Web Routes
- `/` — personalised home dashboard
- `/auth/start` — choose `new student` or `tutor code`
- `/auth/signup` — multi-step onboarding-led signup
- `/auth/tutor-code` — dummy tutor-code entry
- `/auth/login` — returning student login
- `/subjects` — maths hub
- `/subjects/[slug]` — maths subject overview
- `/lessons/[id]` — lesson experience
- `/progress` — full progress dashboard

## Key Files To Know
- `apps/web/src/app/page.tsx` — personalised home dashboard
- `apps/web/src/app/auth/actions.ts` — auth actions and onboarding metadata handling
- `apps/web/src/app/auth/start/page.tsx` — start-path chooser
- `apps/web/src/app/auth/tutor-code/page.tsx` — dummy tutor-code flow
- `apps/web/src/components/auth/NewStudentSignupFlow.tsx` — multi-step signup onboarding
- `apps/web/src/app/subjects/page.tsx` — maths-only browsing hub
- `apps/web/src/app/progress/page.tsx` — full progress view linked from home cards
- `apps/web/src/lib/onboarding.ts` — onboarding options, tutor-code preset, recommendation helpers
- `apps/web/src/app/globals.css` — current design tokens and shell classes
- `apps/web/src/components/layout/BottomNav.tsx` — desktop/mobile nav shell

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
- Dark outer shell with a lighter main workspace panel
- Sharper radii than before; less pill-shaped everywhere
- Narrower display typography using a condensed font for headings and key UI text
- Main window gets more space; sidebar is shorter and tighter
- Premium but direct, not over-decorated
- Maths-first copy throughout

## UI Rules That Matter Right Now
- Do not reintroduce other visible subjects like geography, English, or science.
- Keep the home dashboard recommendation prominent.
- Keep a clear alternative path for students who want to choose their own topic.
- Treat clickable summary cards as real navigation, not dead decoration.
- Preserve the slightly blurred in-progress lesson preview behaviour on the home screen unless intentionally redesigning it.
- Keep copy shorter, clearer, and less generic.

## Lesson Rendering
- Lesson content is read from `lessons.content` in Supabase.
- If `lessons.content` is null, the app falls back to `apps/web/src/lib/mockLessons.ts`.
- The same lesson content currently renders for all difficulty levels.
- Real-time AI lesson rewriting is not part of the current requirement.

## Difficulty Levels
- `building`
- `getting_there`
- `confident`

These still drive the traffic-light style difficulty system and progress summaries.

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
