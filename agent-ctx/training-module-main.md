# Training Module Implementation

## Task ID: training-module
## Agent: main

## Summary
Built the complete Training module for the Sanctuary app, including API routes, Zustand store, and full UI implementation.

## Files Created/Modified

### API Routes
1. **`/src/app/api/training/workouts/route.ts`** - GET and POST endpoints
   - GET: Lists workouts by single date (`?date=YYYY-MM-DD`) or date range (`?from=YYYY-MM-DD&to=YYYY-MM-DD`)
   - POST: Creates workout with exercises; emits XP for `workout_complete` (+15 strength) and `exercise_pr` (+25 strength per PR)

2. **`/src/app/api/training/workouts/[id]/route.ts`** - PATCH and DELETE endpoints
   - PATCH: Updates workout fields and optionally replaces exercises
   - DELETE: Hard-deletes workout (cascade removes exercises)

### Zustand Store
3. **`/src/store/training-store.ts`** - Training state management
   - Manages workouts array, loading state, selected date
   - Actions: loadWorkouts, loadWorkoutsRange, createWorkout, updateWorkout, deleteWorkout
   - refreshGamification() dispatches `gamification:updated` custom event on window

### UI Component
4. **`/src/components/modules/training/training-page.tsx`** - Full training page
   - PageHeader with Dumbbell icon and red/coral accent color
   - ModuleTabs: Workouts, History, Analytics
   - Workouts tab: date navigation, workout cards with expandable exercises, PR badges
   - History tab: grouped by date, expandable workout cards
   - Analytics tab: stats grid, workout type distribution bars, recent PRs list
   - CreateWorkoutSheet: type selector, name, duration, note, exercise form with sets/reps/weight/duration/PR toggle

## XP Integration
- `emitXPInternal` function copied from habits log route pattern
- Uses `calculateXP`, `attributeLevelFromXP`, `characterLevelFromXP` from xp-engine
- Uses `assignClass` from class-system
- After XP-emitting actions, store calls `refreshGamification()` which dispatches custom event

## Testing
- All API routes tested via curl: GET, POST, PATCH, DELETE all working
- XP emission verified: workout_complete (+15 strength), exercise_pr (+25 strength per PR)
- Test data created: 4 workouts across 4 dates with various types
- No TypeScript errors in training module code
- Lint passes (only pre-existing nutrition-page error)

## Design Patterns
- Follows same patterns as Habits module (store structure, XP emission, gamification refresh)
- Uses same shared components: PageHeader, ModuleTabs, FAB, EmptyState
- Uses shadcn/ui: Button, Input, Sheet, SheetContent, SheetHeader, SheetTitle
- Framer Motion animations on all interactive elements
- Bilingual support (en/ru) throughout
