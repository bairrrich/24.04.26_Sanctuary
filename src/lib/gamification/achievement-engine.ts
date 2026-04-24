/**
 * Achievement Engine — defines all achievement conditions and provides
 * a function to check which achievements are newly unlocked based on
 * the current character stats.
 */
import type { RPGAttribute } from '@/types';

// ==================== Types ====================

export interface AchievementDef {
  id: string;
  nameEn: string;
  nameRu: string;
  descriptionEn: string;
  descriptionRu: string;
  icon: string;
  condition: (stats: AchievementCheckContext) => boolean;
}

export interface AchievementCheckContext {
  totalXP: number;
  level: number;
  attributeXP: Record<string, number>;
  totalWorkouts: number;
  totalHabitsCompleted: number;
  totalDiaryEntries: number;
  totalTransactions: number;
  streakDays: number;
}

// ==================== Achievement Definitions ====================

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Training Achievements ──
  {
    id: 'first_workout',
    nameEn: 'First Workout',
    nameRu: 'Первая тренировка',
    descriptionEn: 'Complete your first workout',
    descriptionRu: 'Завершите первую тренировку',
    icon: '🏋️',
    condition: (s) => s.totalWorkouts >= 1,
  },
  {
    id: 'week_warrior',
    nameEn: 'Week Warrior',
    nameRu: 'Воин недели',
    descriptionEn: 'Complete 7 workouts',
    descriptionRu: 'Завершите 7 тренировок',
    icon: '⚔️',
    condition: (s) => s.totalWorkouts >= 7,
  },
  {
    id: 'iron_will',
    nameEn: 'Iron Will',
    nameRu: 'Железная воля',
    descriptionEn: 'Complete 30 workouts',
    descriptionRu: 'Завершите 30 тренировок',
    icon: '🔩',
    condition: (s) => s.totalWorkouts >= 30,
  },
  {
    id: 'centurion',
    nameEn: 'Centurion',
    nameRu: 'Центурион',
    descriptionEn: 'Complete 100 workouts',
    descriptionRu: 'Завершите 100 тренировок',
    icon: '🏛️',
    condition: (s) => s.totalWorkouts >= 100,
  },

  // ── Habit Achievements ──
  {
    id: 'habit_starter',
    nameEn: 'Habit Starter',
    nameRu: 'Начало привычек',
    descriptionEn: 'Complete your first habit',
    descriptionRu: 'Выполните первую привычку',
    icon: '✅',
    condition: (s) => s.totalHabitsCompleted >= 1,
  },
  {
    id: 'habit_master',
    nameEn: 'Habit Master',
    nameRu: 'Мастер привычек',
    descriptionEn: 'Complete 50 habits',
    descriptionRu: 'Выполните 50 привычек',
    icon: '🎯',
    condition: (s) => s.totalHabitsCompleted >= 50,
  },
  {
    id: 'streak_master',
    nameEn: 'Streak Master',
    nameRu: 'Мастер серий',
    descriptionEn: 'Maintain a 7-day habit streak',
    descriptionRu: 'Поддерживайте 7-дневную серию привычек',
    icon: '🔥',
    condition: (s) => s.streakDays >= 7,
  },
  {
    id: 'streak_legend',
    nameEn: 'Streak Legend',
    nameRu: 'Легенда серий',
    descriptionEn: 'Maintain a 30-day habit streak',
    descriptionRu: 'Поддерживайте 30-дневную серию привычек',
    icon: '🌋',
    condition: (s) => s.streakDays >= 30,
  },

  // ── Diary Achievements ──
  {
    id: 'first_entry',
    nameEn: 'First Entry',
    nameRu: 'Первая запись',
    descriptionEn: 'Write your first diary entry',
    descriptionRu: 'Напишите первую запись в дневник',
    icon: '📝',
    condition: (s) => s.totalDiaryEntries >= 1,
  },
  {
    id: 'storyteller',
    nameEn: 'Storyteller',
    nameRu: 'Рассказчик',
    descriptionEn: 'Write 10 diary entries',
    descriptionRu: 'Напишите 10 записей в дневник',
    icon: '📖',
    condition: (s) => s.totalDiaryEntries >= 10,
  },
  {
    id: 'chronicler',
    nameEn: 'Chronicler',
    nameRu: 'Летописец',
    descriptionEn: 'Write 50 diary entries',
    descriptionRu: 'Напишите 50 записей в дневник',
    icon: '📚',
    condition: (s) => s.totalDiaryEntries >= 50,
  },

  // ── Finance Achievements ──
  {
    id: 'budget_boss',
    nameEn: 'Budget Boss',
    nameRu: 'Босс бюджета',
    descriptionEn: 'Log your first transaction',
    descriptionRu: 'Запишите первую транзакцию',
    icon: '💰',
    condition: (s) => s.totalTransactions >= 1,
  },
  {
    id: 'accountant',
    nameEn: 'Accountant',
    nameRu: 'Бухгалтер',
    descriptionEn: 'Log 25 transactions',
    descriptionRu: 'Запишите 25 транзакций',
    icon: '📊',
    condition: (s) => s.totalTransactions >= 25,
  },
  {
    id: 'wealth_manager',
    nameEn: 'Wealth Manager',
    nameRu: 'Управляющий капиталом',
    descriptionEn: 'Log 100 transactions',
    descriptionRu: 'Запишите 100 транзакций',
    icon: '🏦',
    condition: (s) => s.totalTransactions >= 100,
  },

  // ── Level Achievements ──
  {
    id: 'level_5',
    nameEn: 'Apprentice',
    nameRu: 'Ученик',
    descriptionEn: 'Reach level 5',
    descriptionRu: 'Достигните 5 уровня',
    icon: '🌟',
    condition: (s) => s.level >= 5,
  },
  {
    id: 'level_10',
    nameEn: 'Adept',
    nameRu: 'Адепт',
    descriptionEn: 'Reach level 10',
    descriptionRu: 'Достигните 10 уровня',
    icon: '⭐',
    condition: (s) => s.level >= 10,
  },
  {
    id: 'level_20',
    nameEn: 'Expert',
    nameRu: 'Эксперт',
    descriptionEn: 'Reach level 20',
    descriptionRu: 'Достигните 20 уровня',
    icon: '💫',
    condition: (s) => s.level >= 20,
  },
  {
    id: 'level_30',
    nameEn: 'Legend',
    nameRu: 'Легенда',
    descriptionEn: 'Reach level 30',
    descriptionRu: 'Достигните 30 уровня',
    icon: '👑',
    condition: (s) => s.level >= 30,
  },

  // ── XP Achievements ──
  {
    id: 'xp_century',
    nameEn: 'XP Century',
    nameRu: 'Сотня XP',
    descriptionEn: 'Earn 100 total XP',
    descriptionRu: 'Наберите 100 XP',
    icon: '💯',
    condition: (s) => s.totalXP >= 100,
  },
  {
    id: 'xp_millennium',
    nameEn: 'XP Millennium',
    nameRu: 'Тысяча XP',
    descriptionEn: 'Earn 1000 total XP',
    descriptionRu: 'Наберите 1000 XP',
    icon: '🔮',
    condition: (s) => s.totalXP >= 1000,
  },
  {
    id: 'xp_titan',
    nameEn: 'XP Titan',
    nameRu: 'Титан XP',
    descriptionEn: 'Earn 10000 total XP',
    descriptionRu: 'Наберите 10000 XP',
    icon: '💎',
    condition: (s) => s.totalXP >= 10000,
  },

  // ── Attribute Achievements ──
  {
    id: 'strength_10',
    nameEn: 'Mighty',
    nameRu: 'Могучий',
    descriptionEn: 'Earn 100 strength XP',
    descriptionRu: 'Наберите 100 XP силы',
    icon: '💪',
    condition: (s) => (s.attributeXP['strength'] ?? 0) >= 100,
  },
  {
    id: 'agility_10',
    nameEn: 'Swift',
    nameRu: 'Стремительный',
    descriptionEn: 'Earn 100 agility XP',
    descriptionRu: 'Наберите 100 XP ловкости',
    icon: '🏃',
    condition: (s) => (s.attributeXP['agility'] ?? 0) >= 100,
  },
  {
    id: 'intelligence_10',
    nameEn: 'Brilliant',
    nameRu: 'Блестящий',
    descriptionEn: 'Earn 100 intelligence XP',
    descriptionRu: 'Наберите 100 XP интеллекта',
    icon: '🧠',
    condition: (s) => (s.attributeXP['intelligence'] ?? 0) >= 100,
  },
  {
    id: 'endurance_10',
    nameEn: 'Resilient',
    nameRu: 'Стойкий',
    descriptionEn: 'Earn 100 endurance XP',
    descriptionRu: 'Наберите 100 XP выносливости',
    icon: '🛡️',
    condition: (s) => (s.attributeXP['endurance'] ?? 0) >= 100,
  },
  {
    id: 'charisma_10',
    nameEn: 'Charming',
    nameRu: 'Обаятельный',
    descriptionEn: 'Earn 100 charisma XP',
    descriptionRu: 'Наберите 100 XP харизмы',
    icon: '✨',
    condition: (s) => (s.attributeXP['charisma'] ?? 0) >= 100,
  },
];

// ==================== Achievement Checking ====================

/**
 * Check all achievement conditions against the current stats.
 * Returns an array of achievement IDs that are newly met.
 *
 * Note: This does NOT check against already-unlocked achievements.
 * The caller (emit-xp.ts) filters out already-unlocked ones before
 * creating UserAchievement records.
 */
export function checkAchievements(context: AchievementCheckContext): string[] {
  const unlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    try {
      if (achievement.condition(context)) {
        unlocked.push(achievement.id);
      }
    } catch {
      // If a condition throws, skip it — non-critical
    }
  }

  return unlocked;
}

/**
 * Get an achievement definition by ID.
 */
export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get all achievement definitions.
 */
export function getAllAchievements(): AchievementDef[] {
  return ACHIEVEMENTS;
}
