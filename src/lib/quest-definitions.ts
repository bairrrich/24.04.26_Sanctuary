/**
 * Quest Definitions — templates for daily and weekly quest generation.
 * Each quest template defines a trigger (module:action), target count,
 * difficulty, XP reward, and the RPG attribute it targets.
 */

export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestType = 'daily' | 'weekly';

export interface QuestTemplate {
  id: string;
  type: QuestType;
  titleEn: string;
  titleRu: string;
  descEn: string;
  descRu: string;
  module: string;
  action: string;
  target: number;
  difficulty: QuestDifficulty;
  xpReward: number;
  attribute: string;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // ==================== Daily Quests ====================
  {
    id: 'daily_habit_3',
    type: 'daily',
    titleEn: 'Habit Streak',
    titleRu: 'Серия привычек',
    descEn: 'Complete 3 habits today',
    descRu: 'Выполните 3 привычки сегодня',
    module: 'habits',
    action: 'habit_complete',
    target: 3,
    difficulty: 'easy',
    xpReward: 15,
    attribute: 'agility',
  },
  {
    id: 'daily_habit_all',
    type: 'daily',
    titleEn: 'Perfectionist',
    titleRu: 'Перфекционист',
    descEn: 'Complete all daily habits',
    descRu: 'Выполните все привычки за день',
    module: 'habits',
    action: 'all_daily_complete',
    target: 1,
    difficulty: 'hard',
    xpReward: 30,
    attribute: 'agility',
  },
  {
    id: 'daily_water',
    type: 'daily',
    titleEn: 'Hydration',
    titleRu: 'Водный баланс',
    descEn: 'Drink 4 glasses of water',
    descRu: 'Выпейте 4 стакана воды',
    module: 'nutrition',
    action: 'water_glass',
    target: 4,
    difficulty: 'easy',
    xpReward: 10,
    attribute: 'endurance',
  },
  {
    id: 'daily_water_goal',
    type: 'daily',
    titleEn: 'Hydration Master',
    titleRu: 'Мастер гидратации',
    descEn: 'Reach your daily water goal',
    descRu: 'Достигните дневной нормы воды',
    module: 'nutrition',
    action: 'water_goal',
    target: 1,
    difficulty: 'medium',
    xpReward: 20,
    attribute: 'endurance',
  },
  {
    id: 'daily_meal',
    type: 'daily',
    titleEn: 'Food Logger',
    titleRu: 'Дневник питания',
    descEn: 'Log 2 meals today',
    descRu: 'Запишите 2 приёма пищи',
    module: 'nutrition',
    action: 'meal_log',
    target: 2,
    difficulty: 'easy',
    xpReward: 10,
    attribute: 'endurance',
  },
  {
    id: 'daily_diary',
    type: 'daily',
    titleEn: 'Reflect',
    titleRu: 'Рефлексия',
    descEn: 'Write a diary entry',
    descRu: 'Сделайте запись в дневнике',
    module: 'diary',
    action: 'entry_create',
    target: 1,
    difficulty: 'easy',
    xpReward: 8,
    attribute: 'charisma',
  },
  {
    id: 'daily_transaction',
    type: 'daily',
    titleEn: 'Budget Watcher',
    titleRu: 'Финансовый контроль',
    descEn: 'Log 2 transactions',
    descRu: 'Запишите 2 транзакции',
    module: 'finance',
    action: 'transaction_log',
    target: 2,
    difficulty: 'easy',
    xpReward: 8,
    attribute: 'intelligence',
  },
  {
    id: 'daily_workout',
    type: 'daily',
    titleEn: 'Daily Grind',
    titleRu: 'Ежедневная тренировка',
    descEn: 'Complete a workout',
    descRu: 'Завершите тренировку',
    module: 'training',
    action: 'workout_complete',
    target: 1,
    difficulty: 'medium',
    xpReward: 20,
    attribute: 'strength',
  },

  // ==================== Weekly Quests ====================
  {
    id: 'weekly_habit_15',
    type: 'weekly',
    titleEn: 'Consistency',
    titleRu: 'Последовательность',
    descEn: 'Complete 15 habits this week',
    descRu: 'Выполните 15 привычек за неделю',
    module: 'habits',
    action: 'habit_complete',
    target: 15,
    difficulty: 'medium',
    xpReward: 50,
    attribute: 'agility',
  },
  {
    id: 'weekly_workout_3',
    type: 'weekly',
    titleEn: 'Warrior Week',
    titleRu: 'Неделя воина',
    descEn: 'Complete 3 workouts this week',
    descRu: 'Завершите 3 тренировки за неделю',
    module: 'training',
    action: 'workout_complete',
    target: 3,
    difficulty: 'hard',
    xpReward: 60,
    attribute: 'strength',
  },
  {
    id: 'weekly_diary_5',
    type: 'weekly',
    titleEn: 'Chronicler',
    titleRu: 'Летописец',
    descEn: 'Write 5 diary entries this week',
    descRu: 'Напишите 5 записей в дневнике',
    module: 'diary',
    action: 'entry_create',
    target: 5,
    difficulty: 'medium',
    xpReward: 40,
    attribute: 'charisma',
  },
  {
    id: 'weekly_water_20',
    type: 'weekly',
    titleEn: 'Water Champion',
    titleRu: 'Водный чемпион',
    descEn: 'Drink 20 glasses of water this week',
    descRu: 'Выпейте 20 стаканов воды за неделю',
    module: 'nutrition',
    action: 'water_glass',
    target: 20,
    difficulty: 'medium',
    xpReward: 40,
    attribute: 'endurance',
  },
  {
    id: 'weekly_meal_10',
    type: 'weekly',
    titleEn: 'Meal Planner',
    titleRu: 'Планировщик питания',
    descEn: 'Log 10 meals this week',
    descRu: 'Запишите 10 приёмов пищи за неделю',
    module: 'nutrition',
    action: 'meal_log',
    target: 10,
    difficulty: 'medium',
    xpReward: 35,
    attribute: 'endurance',
  },
  {
    id: 'weekly_transaction_7',
    type: 'weekly',
    titleEn: 'Accountant',
    titleRu: 'Бухгалтер',
    descEn: 'Log 7 transactions this week',
    descRu: 'Запишите 7 транзакций за неделю',
    module: 'finance',
    action: 'transaction_log',
    target: 7,
    difficulty: 'easy',
    xpReward: 30,
    attribute: 'intelligence',
  },
];

/** Get random daily quest templates (3-4 per day) */
export function getDailyQuestTemplates(): QuestTemplate[] {
  const daily = QUEST_TEMPLATES.filter(q => q.type === 'daily');
  // Shuffle and pick 3-4
  const shuffled = [...daily].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3 + (Math.random() > 0.5 ? 1 : 0));
}

/** Get random weekly quest templates (2-3 per week) */
export function getWeeklyQuestTemplates(): QuestTemplate[] {
  const weekly = QUEST_TEMPLATES.filter(q => q.type === 'weekly');
  const shuffled = [...weekly].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + (Math.random() > 0.5 ? 1 : 0));
}

/** Get end of day timestamp */
export function endOfDay(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Get end of week timestamp (Sunday 23:59:59) */
export function endOfWeek(): Date {
  const d = new Date();
  const dayOfWeek = d.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d;
}
