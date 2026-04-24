# Task 20: Supabase Auth + Edge Function Integration

## What was built

### 1. Auth Store (`/src/store/auth-store.ts`)
- Zustand store tracking: `user`, `session`, `isLoading`, `isAuthenticated`, `isGuest`, `isInitialized`
- Methods: `initialize()`, `signIn()`, `signUp()`, `signOut()`, `continueAsGuest()`, `exitGuest()`
- Initializes Supabase auth listener on client side via `createClient()` from `@/lib/supabase/client`
- On auth state change, updates store automatically
- No localStorage persistence (session managed by Supabase cookies)

### 2. Auth Provider (`/src/components/providers/auth-provider.tsx`)
- `'use client'` component
- Calls `authStore.initialize()` on mount
- Shows loading spinner while checking session
- Renders children once initialized

### 3. Auth Page (`/src/components/auth/auth-page.tsx`)
- RPG-themed login/signup page with shadcn Tabs
- Login tab: email + password + Sign In button
- Sign Up tab: email + password + username + Create Account button
- Loading states, error messages, success messages (email confirmation)
- "Continue as Guest" button below auth form
- Decorative background elements, framer-motion animations
- Full i18n support (en/ru)

### 4. App Shell Updated (`/src/components/layout/app-shell.tsx`)
- Shows AuthPage when not authenticated and not guest
- Shows main app when authenticated or in guest mode
- Auth gate only activates after initialization (no flash)

### 5. Page Updated (`/src/app/page.tsx`)
- Wrapped AppShell with AuthProvider

### 6. Server Client Updated (`/src/lib/supabase/server.ts`)
- `createSupabaseAdminClient()` now async with proper cookie handling
- Supports `SUPABASE_SERVICE_ROLE_KEY` env var (falls back to anon key)

### 7. Edge Function Proxy API Routes
- `/api/supabase/emit-xp` - POST proxy to Edge Function
- `/api/supabase/generate-quests` - POST proxy to Edge Function
- `/api/supabase/check-achievements` - POST proxy to Edge Function
- Keeps Supabase anon key server-side, avoids CORS issues

### 8. i18n Keys Added
- Auth section with full en/ru translations (20+ keys each)

## Files Created
- `/src/store/auth-store.ts`
- `/src/components/providers/auth-provider.tsx`
- `/src/components/auth/auth-page.tsx`
- `/src/app/api/supabase/emit-xp/route.ts`
- `/src/app/api/supabase/generate-quests/route.ts`
- `/src/app/api/supabase/check-achievements/route.ts`

## Files Modified
- `/src/components/layout/app-shell.tsx`
- `/src/app/page.tsx`
- `/src/lib/supabase/server.ts`
- `/src/lib/i18n.ts`

## Verification
- Lint passes clean
- Dev server compiles successfully (200 OK)
