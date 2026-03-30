# RISE — GCSE Self-Study & AI Tutoring App

## Project Purpose

RISE is a UK-focused GCSE revision and AI tutoring application. It helps students aged 14–16 study independently using AI-powered tutoring, structured revision tools, and progress tracking. The name RISE reflects the app's mission: to help students grow in knowledge and confidence through smart, personalised study.

## Monorepo Structure

```
RISE_APP_V1/
├── apps/
│   ├── web/          # Next.js 14 web app (browser)
│   └── mobile/       # Expo React Native app (iOS & Android)
├── packages/
│   └── shared/       # Shared TypeScript types, constants, and utilities
├── package.json      # Root npm workspaces config
├── .gitignore
└── CLAUDE.md         # You are here
```

## Tech Stack

### Web App (`apps/web`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18+

### Mobile App (`apps/mobile`)
- **Framework**: Expo (SDK 50+)
- **UI Library**: React Native
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)

### Shared Package (`packages/shared`)
- **Language**: TypeScript
- Exports shared types, constants (subjects, exam boards, etc.), and utility functions consumed by both `apps/web` and `apps/mobile`

### Backend / Services (planned)
- **Database & Auth**: Supabase (Postgres + Auth + Storage)
- **AI Tutoring**: Anthropic Claude API

## npm Workspaces

This repo uses **npm workspaces** (npm 9+, Node 18+). All `node_modules` are hoisted to the root.

```bash
# Install all dependencies from root
npm install

# Run web dev server
npm run dev:web

# Run mobile dev server
npm run dev:mobile

# Build web app
npm run build:web

# Type-check all packages
npm run type-check
```

## Environment Variables

Each app has a `.env.example` file. Copy it to `.env.local` before running:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
```

Required variables:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_ANON_KEY` — your Supabase anon/public key
- `ANTHROPIC_API_KEY` — your Anthropic API key (server-side only for web)

## Key Conventions

- All shared logic (types, constants, helpers) goes in `packages/shared` to avoid duplication
- Web-specific logic stays in `apps/web`, mobile-specific in `apps/mobile`
- GCSE subjects and UK exam board constants are defined in `packages/shared/src/constants`
- TypeScript is strict across all packages
- Tailwind classes are used for styling in both web (standard Tailwind) and mobile (NativeWind)

## UK Context

- Target audience: UK secondary school students (Year 10–11, ages 14–16)
- Curriculum: GCSE (General Certificate of Secondary Education)
- Exam boards: AQA, Edexcel, OCR, WJEC, CCEA
- Subjects: Maths, English Language, English Literature, Sciences (Biology, Chemistry, Physics), History, Geography, and more
