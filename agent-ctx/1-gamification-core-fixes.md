# Task 1 — Gamification Core Fixes & XP Notifications

## Summary
Fixed 4 issues in the gamification system: achievements tab, quest engine hook, XP toast notifications, and legacy file cleanup.

## Changes Made

### 1. Fixed Achievements Tab (`src/components/modules/gamification/achievements-tab.tsx`)
- **Before**: All achievements shown as locked with hardcoded definitions, no API fetch
- **After**:
  - Fetches real achievement data from `/api/gamification/achievements` on mount
  - Shows achievements as unlocked/locked based on `isUnlocked` field from API
  - Shows unlock date for unlocked achievements (formatted per locale)
  - Progress stats bar at top ("8/25 unlocked", percentage, animated progress bar)
  - Groups by category (general, strength, agility, intelligence, endurance, charisma)
  - Unlocked: full color, no grayscale, colored icon background, checkmark + date
  - Locked: dimmed (opacity-40), grayscale icon, lock icon
  - Uses CATEGORY_COLORS for consistent styling
  - Listens to `gamification:updated` to auto-refresh on XP events

### 2. Fixed useQuestEngine Hook (`src/hooks/useQuestEngine.ts`)
- **Before**: Stub returning `{ progressed: true }` always
- **After**:
  - Fetches quest data from `/api/gamification/quests?status=all` after an action
  - Dispatches `gamification:quests-updated` custom event with quest data
  - Returns meaningful data: `{ progressed, questCount, completedCount }`

### 3. Created XP Toast Notifications (`src/components/shared/xp-notification.tsx`)
- Listens to `gamification:updated` custom event
- **Regular XP toast**: module icon + XP amount with attribute color + attribute name badge
- **Level Up toast**: bigger, more prominent — shows "⬆️ Level Up!", new level number, class name
- Auto-dismiss: 3s for XP, 5s for level-up
- Framer Motion slide-in/out from top-right
- Stacked (max 3 visible), older ones removed
- Supports en/ru via settings store

### 4. Updated useGainXP Hook (`src/hooks/useGainXP.ts`)
- Now tracks `previousLevel` before API call by fetching current character data
- Dispatches `gamification:updated` with detailed info:
  - `module`, `action`, `xpAmount`, `attribute`
  - `newLevel`, `previousLevel`, `newTotalXP`
  - `classId`, `isHybrid`, `hybridClassId`
  - `leveledUp`, `achievementsUnlocked`

### 5. Added XPNotification to App Shell (`src/components/layout/app-shell.tsx`)
- Imported and rendered `<XPNotification />` so it's always present

### 6. Deleted Legacy File (`src/lib/quest-definitions.ts`)
- No imports found — safe to delete
- Superseded by `src/lib/gamification/quest-pool.ts`

### 7. Updated Shared Index (`src/components/shared/index.ts`)
- Added `XPNotification` export

## Lint
✅ `bun run lint` passes with no errors
