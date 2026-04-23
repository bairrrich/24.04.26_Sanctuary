# Task: Habits Module API Routes and Zustand Store

## Summary

Created the complete Habits module backend (API routes) and frontend state management (Zustand store) for the Sanctuary app.

## Files Created

### 1. `/src/lib/habit-utils.ts` — Streak Calculation Helper
- `getTodayString()` — Returns YYYY-MM-DD for today
- `getYesterdayString()` — Returns YYYY-MM-DD for yesterday
- `parseDate()` / `formatDate()` — Date parsing/formatting utilities
- `calculateStreak()` — Calculates consecutive-day streak from log dates
- `getStreakMilestone()` / `getStreakAction()` — Streak milestone detection (3,7,14,30,60,100)
- `HABIT_ICONS` — 12 predefined emoji icons
- `HABIT_COLORS` — 8 predefined hex colors

### 2. `/src/app/api/habits/route.ts` — List & Create
- **GET**: List all non-archived habits with today's log and current streak
- **POST**: Create a new habit with auto sort-order

### 3. `/src/app/api/habits/[id]/route.ts` — Update & Archive
- **PATCH**: Update habit fields (name, description, icon, color, type, frequency, targetCount, sortOrder)
- **DELETE**: Soft-delete (archive) a habit by setting `isArchived: true`

### 4. `/src/app/api/habits/log/route.ts` — Toggle & Get Logs
- **POST**: Toggle habit completion for today
  - If already logged → remove log (toggle off)
  - If not logged → create log entry (toggle on)
  - After logging, calculates current streak
  - Emits XP for `habit_complete` (positive habits) or `habit_negative_break` (negative habits)
  - Checks streak milestones and emits bonus XP
  - Checks if ALL positive habits are complete → emits `all_daily_complete` XP
  - XP emission uses internal helper (same logic as `/api/gamification/emit-xp`) to avoid HTTP round-trips
- **GET**: Get logs for a date range (query params: `from`, `to` in YYYY-MM-DD format)

### 5. `/src/store/habits-store.ts` — Zustand Store
- `habits` / `isLoading` / `error` state
- `loadHabits()` — Fetch from GET /api/habits
- `createHabit(data)` — POST /api/habits
- `updateHabit(id, data)` — PATCH /api/habits/[id]
- `deleteHabit(id)` — DELETE /api/habits/[id]
- `toggleHabit(habitId)` — POST /api/habits/log, returns ToggleResult with XP events
- `getLogs(from, to)` — GET /api/habits/log
- `refreshGamification()` — Dispatches `gamification:updated` custom event for cross-store sync

## API Test Results

All endpoints tested successfully:
- ✅ GET /api/habits → `{"habits":[]}`
- ✅ POST /api/habits → `{"habit":{...}}` (201)
- ✅ PATCH /api/habits/[id] → `{"habit":{...}}` (200)
- ✅ DELETE /api/habits/[id] → `{"habit":{...}}` (200, soft archive)
- ✅ POST /api/habits/log → `{"log":{...},"isCompleted":true,"currentStreak":1,"xpEvents":[{"module":"habits","action":"habit_complete","amount":8,"attribute":"agility"}]}` (200)
- ✅ POST /api/habits/log (toggle off) → `{"log":null,"isCompleted":false,"currentStreak":0,"xpEvents":[]}`
- ✅ GET /api/habits/log?from=...&to=... → `{"logs":[]}`
- ✅ Lint passes cleanly

## Design Decisions

1. **Internal XP emission** in the log route (instead of calling emit-xp API) to avoid HTTP round-trips and ensure atomicity
2. **Custom event dispatch** (`gamification:updated`) for cross-store communication instead of direct store imports
3. **Streak milestone XP** only emitted when streak exactly equals milestone (not >=)
4. **All daily complete check** only for positive habits, verified after each toggle
