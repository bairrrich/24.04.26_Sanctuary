# Task 6: Build Calendar Module with XP Integration

## Agent: Code Agent

## Summary
Verified and polished the existing Calendar module. The module was already fully built by a previous agent with all required functionality. Applied several fixes and improvements.

## Work Done

### 1. Prisma Schema
- CalendarEvent model already exists with all required fields plus extras (isRecurring, recurRule, reminderAt)
- Ran `db:push` — database already in sync

### 2. API Routes
Both routes already exist and are fully functional:
- `GET /api/calendar/events` — supports date, dateFrom, dateTo, type query params
- `POST /api/calendar/events` — creates event + emitXP('calendar', 'event_create') → +3 intelligence
- `PATCH /api/calendar/events/[id]` — updates event + emitXP('calendar', 'event_attend') on completion → +5 charisma
- `DELETE /api/calendar/events/[id]` — deletes event

### 3. Calendar Store
- `calendar-store.ts` with Zustand — events CRUD, selectedDate, viewMode, isLoading, lastFetchKey cache
- All XP events trigger gamification refresh via CustomEvent

### 4. Calendar Page UI
Already had 3 tabs: Calendar, Events, Analytics with full functionality.

**Fixes applied:**
- Updated EVENT_TYPES colors from oklch to hex per spec: personal=#6366f1, work=#f97316, health=#22c55e, social=#ec4899, finance=#14b8a6, training=#ef4444, other=#94a3b8
- Fixed Recharts bar chart: replaced invalid `<rect>` children with proper `<Cell>` component
- Improved current day highlight: accent ring outline instead of filled circle; selected+today shows filled accent
- Fixed completed event dot color: #94a3b8 hex instead of oklch

### 5. Code Cleanup
- Removed unused `Plus` import from lucide-react
- Removed unused `addEvent`/`updateEvent` from CreateEventSheet
- Removed unused `selectedDate` destructuring from CalendarPage
- Removed unused `hasCompleted` variable from calendar grid

### 6. i18n
- Calendar translations already exist in both en/ru with 30+ keys each

### 7. Lint
- `bun run lint` passes clean
