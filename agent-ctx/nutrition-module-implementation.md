# Nutrition Module - Implementation Summary

## Task ID: nutrition-module

## What was built

### 1. API Routes

**`/src/app/api/nutrition/meals/route.ts`**
- `GET`: List meals for a date (query param `date=YYYY-MM-DD`), returns grouped by mealType, daily summary, and targets from CharacterSetupData
- `POST`: Create a new meal entry. Emits XP for `meal_log`. Checks if daily calories target met → emits `daily_calories_target`. Checks if daily macros target met → emits `daily_macros_target`. Uses `emitXPInternal` pattern copied from habits/log/route.ts.

**`/src/app/api/nutrition/meals/[id]/route.ts`**
- `PATCH`: Update a meal entry (name, mealType, calories, protein, fat, carbs, note)
- `DELETE`: Delete a meal entry

**`/src/app/api/nutrition/water/route.ts`**
- `GET`: Get water intake for a date, returns entries, total amount, and goal
- `POST`: Add a water entry. Emits XP for `water_glass`. Checks if water goal (2000ml default or from setup) met → emits `water_goal`. Uses `emitXPInternal`.

**`/src/app/api/nutrition/water/[id]/route.ts`**
- `DELETE`: Delete a water entry

### 2. Zustand Store

**`/src/store/nutrition-store.ts`**
- Full store with: `meals`, `waterEntries`, `totalWater`, `waterGoal`, `dailySummary`, `targets`, `isLoading`, `selectedDate`
- Actions: `loadDay`, `addMeal`, `updateMeal`, `deleteMeal`, `addWater`, `deleteWater`, `setSelectedDate`, `refreshGamification`
- `refreshGamification()` dispatches `gamification:updated` custom event on `window` (same pattern as habits-store)

### 3. Nutrition UI

**`/src/components/modules/nutrition/nutrition-page.tsx`**
- PageHeader with "Nutrition" / "Питание" title, Apple icon, accent color
- DateNavigator: Navigate between days with chevrons, tap for today
- ModuleTabs: Diary, Water, Analytics
- **Diary Tab**: 
  - MacroSummaryCard (calories, protein, fat, carbs with progress bars)
  - Meal sections (Breakfast, Lunch, Dinner, Snack) with add button per section
  - Each meal entry shows name + calories + macros with delete
  - FAB opens Sheet to add new meal
- **Water Tab**:
  - Big circular SVG water progress indicator (current / goal in ml)
  - Quick add buttons (+250ml, +500ml, +750ml)
  - Custom water input
  - List of today's water entries with delete
- **Analytics Tab**:
  - Stats cards (meals logged, avg calories, avg protein, avg fat)
  - Weekly calorie bar chart
  - Average daily macros with progress bars
- **CreateMealSheet**: Full form with meal type selector, name, calories, protein/fat/carbs, note
- All components use shadcn/ui, Framer Motion, same styling patterns as Habits module
- Full i18n support (en/ru)

## Key Design Decisions
- XP emissions use `emitXPInternal` pattern (copied inline) - no HTTP call to /api/gamification/emit-xp
- Daily XP bonuses (calories_target, macros_target, water_goal) check for existing same-day XP events to avoid duplicate awards
- Default nutrition targets: 2000 kcal, 150g protein, 65g fat, 250g carbs, 2000ml water
- Targets can be overridden via CharacterSetupData (set during gamification setup)

## Lint Status
✅ Passes `bun run lint` with zero errors
