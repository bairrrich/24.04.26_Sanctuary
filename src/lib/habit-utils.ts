/**
 * Habit utility functions — streak calculation, date helpers, and constants.
 */

// ==================== Date Helpers ====================

/** Returns today's date as YYYY-MM-DD string */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns yesterday's date as YYYY-MM-DD string */
export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse YYYY-MM-DD to Date at midnight UTC */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date to YYYY-MM-DD */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==================== Streak Calculation ====================

/**
 * Calculate the current consecutive-day streak from an array of log dates.
 *
 * Logs should be sorted descending by date (most recent first).
 * The streak counts backwards from today (or yesterday if today isn't logged yet).
 */
export function calculateStreak(logs: { date: string }[]): number {
  if (!logs || logs.length === 0) return 0;

  // Deduplicate and sort descending
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort((a, b) => b.localeCompare(a));
  if (uniqueDates.length === 0) return 0;

  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Streak must start from today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = parseDate(uniqueDates[i - 1]);
    const curr = parseDate(uniqueDates[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ==================== Streak Milestones ====================

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/** Get the XP action string for a streak milestone */
export function getStreakAction(milestone: StreakMilestone): string {
  return `streak_${milestone}`;
}

/** Check if a streak value hits a milestone, returns the milestone or null */
export function getStreakMilestone(streak: number): StreakMilestone | null {
  // Check from largest to smallest so we return the highest applicable milestone
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (streak === STREAK_MILESTONES[i]) {
      return STREAK_MILESTONES[i];
    }
  }
  return null;
}

// ==================== Icon & Color Constants ====================

export const HABIT_ICONS = [
  '🎯',
  '💪',
  '🏃',
  '📖',
  '🧘',
  '💧',
  '🍎',
  '😴',
  '🚭',
  '🚫',
  '📱❌',
  '☀️',
] as const;

export type HabitIcon = (typeof HABIT_ICONS)[number];

export const HABIT_COLORS = [
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ef4444', // red
  '#22c55e', // green
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number];
