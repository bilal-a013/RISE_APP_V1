```markdown
# RISE_APP_V1 Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to contributing to the RISE_APP_V1 TypeScript codebase. It covers the project's coding conventions, common development workflows (including feature development, database migrations, and authentication fixes), and testing patterns. Whether you're adding new features, updating shared modules, or working with Supabase, this guide will help you follow established patterns for consistency and maintainability.

## Coding Conventions

### File Naming

- **CamelCase** is used for file names.
  - Example: `userProfile.ts`, `onboardingFlow.ts`

### Import Style

- **Alias imports** are preferred for referencing modules.
  ```typescript
  import { getUser } from '@/lib/user';
  ```

### Export Style

- **Mixed exports**: Both named and default exports are used as appropriate.
  ```typescript
  // Named export
  export function signIn() { ... }

  // Default export
  export default function OnboardingPage() { ... }
  ```

### Commit Messages

- **Conventional commits** are required.
  - Prefixes: `fix`, `feat`, `chore`
  - Example: `feat: add onboarding step for profile completion`

## Workflows

### Feature Development with Shared Module Update

**Trigger:** When adding a new feature that requires both UI and shared logic changes  
**Command:** `/new-feature-shared`

1. **Create or update page component(s):**
   - Edit or add files in `apps/web/src/app/(app)/*/page.tsx`
   ```typescript
   // Example: apps/web/src/app/dashboard/page.tsx
   import { fetchUserData } from '@/lib/userData';

   export default function DashboardPage() {
     // ...
   }
   ```
2. **Create or update related shared module(s):**
   - Edit or add files in `apps/web/src/lib/*.ts`
   ```typescript
   // Example: apps/web/src/lib/userData.ts
   export function fetchUserData(userId: string) { ... }
   ```
3. **Update or create auth/onboarding logic if needed:**
   - Edit files in `apps/web/src/app/auth/*` or `apps/web/src/lib/onboarding.ts`
   ```typescript
   // Example: apps/web/src/lib/onboarding.ts
   export function completeOnboarding(userId: string) { ... }
   ```

---

### Supabase Schema and Migration Update

**Trigger:** When introducing a new data model or updating an existing one in Supabase  
**Command:** `/new-table`

1. **Create or update a migration SQL file:**
   - Place in `supabase/migrations/`
   ```sql
   -- supabase/migrations/20240601_add_profiles.sql
   CREATE TABLE profiles (
     id uuid PRIMARY KEY,
     display_name text
   );
   ```
2. **Update or create corresponding shared logic:**
   - Edit or add files in `apps/web/src/lib/*.ts`
   ```typescript
   // Example: apps/web/src/lib/profiles.ts
   export function getProfile(userId: string) { ... }
   ```
3. **Update or create related page component(s):**
   - Edit or add files in `apps/web/src/app/(app)/*/page.tsx`
   ```typescript
   // Example: apps/web/src/app/profile/page.tsx
   import { getProfile } from '@/lib/profiles';
   ```

---

### Supabase Auth Environment Fix

**Trigger:** When resolving Supabase authentication issues in deployment or local environments  
**Command:** `/fix-supabase-auth`

1. **Update middleware for auth handling:**
   - Edit `apps/web/middleware.ts`
   ```typescript
   // Example: apps/web/middleware.ts
   import { handleAuth } from '@/lib/supabase/authMiddleware';
   export default handleAuth;
   ```
2. **Edit or create environment scripts:**
   - Update scripts in `apps/web/scripts/`, e.g., `ensure-env-local.mjs`
   ```js
   // Example: apps/web/scripts/ensure-env-local.mjs
   // Ensures required env vars are set for Supabase
   ```
3. **Update auth logic:**
   - Edit `apps/web/src/app/auth/actions.ts`
   ```typescript
   // Example: apps/web/src/app/auth/actions.ts
   export async function signInWithProvider(provider: string) { ... }
   ```
4. **Update Supabase client/server environment files:**
   - Edit files in `apps/web/src/lib/supabase/*.ts`
   ```typescript
   // Example: apps/web/src/lib/supabase/client.ts
   import { createClient } from '@supabase/supabase-js';
   ```

## Testing Patterns

- **Test files** follow the pattern `*.test.*`
- **Testing framework** is not explicitly specified; look for test files alongside modules.
- Example:
  ```
  apps/web/src/lib/userData.test.ts
  ```

## Commands

| Command              | Purpose                                                      |
|----------------------|--------------------------------------------------------------|
| /new-feature-shared  | Start a new feature involving both UI and shared logic       |
| /new-table           | Add or update a Supabase table/schema and related code       |
| /fix-supabase-auth   | Resolve Supabase authentication/environment issues           |
```