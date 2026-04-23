# Diary Module Implementation

## Summary
Built the complete Diary module for the Sanctuary Next.js 16 app with API routes, Zustand store, and full UI.

## Files Created/Modified

### API Routes
- **`/src/app/api/diary/route.ts`** - GET (list entries with date range filtering) and POST (create entry with XP emission)
- **`/src/app/api/diary/[id]/route.ts`** - PATCH (update entry) and DELETE (delete entry)

### Zustand Store
- **`/src/store/diary-store.ts`** - Complete store with:
  - `loadEntries(from, to)` - Load entries for a date range
  - `loadEntryByDate(date)` - Load single entry by date
  - `createEntry(data)` - Create entry and emit gamification:updated event
  - `updateEntry(id, data)` - Update entry
  - `deleteEntry(id)` - Delete entry
  - `refreshGamification()` - Dispatches `gamification:updated` custom event on window

### UI Component
- **`/src/components/modules/diary/diary-page.tsx`** - Full diary page with:
  - **PageHeader** with "Diary"/"Дневник" title, BookOpen icon, purple accent
  - **ModuleTabs**: Entries, Calendar, Analytics
  - **Entries Tab**: Today's entry prompt, mood emojis, expand/edit/delete, past entries list
  - **Calendar Tab**: Month grid with entry dots/mood emojis, navigation, click-to-view/create
  - **Analytics Tab**: Stats grid, mood distribution bar chart, writing streak, most common mood
  - **CreateEntrySheet**: Mood selector, title, auto-expanding content, tags, XP notification
  - **EditEntryForm**: Edit mood, title, content, tags

## XP Rules Implemented
- `entry_create` → charisma +5 (always)
- `entry_long` → charisma +12 (content >= 500 chars)
- `daily_reflection` → charisma +15 (first entry of the day)

## Module Accent Color
`oklch(0.606 0.25 292.717)` - purple

## Module Icon
BookOpen (from lucide-react)

## Test Data
5 test diary entries created for dates 2026-04-19 through 2026-04-23 with various moods.

## Verification
- All API endpoints tested and working (GET, POST, PATCH, DELETE)
- XP emission verified working (entry_create +5, daily_reflection +15)
- Lint passes with no errors
- Frontend compiles and loads correctly
