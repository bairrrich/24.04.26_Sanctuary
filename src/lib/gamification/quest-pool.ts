/**
 * Quest Pool — definitions of all available quest templates.
 *
 * Each quest has a unique ID, type, category, bilingual title/description,
 * an action pattern (module:action), associated RPG attribute, difficulty,
 * XP reward, and target count.
 */
import type { RPGAttribute } from '@/types';

// ==================== Types ====================

export type QuestType = 'daily' | 'weekly' | 'challenge' | 'quiz' | 'knowledge';
export type QuestCategory = 'finance' | 'training' | 'nutrition' | 'mind' | 'health' | 'general';

export interface QuestTemplate {
  id: string;
  type: QuestType;
  category: QuestCategory;
  titleEn: string;
  titleRu: string;
  descriptionEn?: string;
  descriptionRu?: string;
  action: string; // e.g., "habits:habit_complete" — matches module:action pattern
  stat: RPGAttribute;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardXP: number;
  target: number;
}

// ==================== Quest Templates ====================

export const QUEST_POOL: QuestTemplate[] = [
  // ── Daily: Nutrition ──
  {
    id: 'daily_nutrition_3meals',
    type: 'daily',
    category: 'nutrition',
    titleEn: 'Log 3 meals',
    titleRu: 'Записать 3 приёма пищи',
    descriptionEn: 'Track everything you eat today — at least 3 meals',
    descriptionRu: 'Записывайте всё, что едите сегодня — минимум 3 приёма пищи',
    action: 'nutrition:meal_log',
    stat: 'endurance',
    difficulty: 'easy',
    rewardXP: 15,
    target: 3,
  },
  {
    id: 'daily_nutrition_water',
    type: 'daily',
    category: 'nutrition',
    titleEn: 'Drink 6 glasses of water',
    titleRu: 'Выпить 6 стаканов воды',
    descriptionEn: 'Stay hydrated — log at least 6 water glasses',
    descriptionRu: 'Оставайтесь гидратированными — запишите минимум 6 стаканов воды',
    action: 'nutrition:water_glass',
    stat: 'endurance',
    difficulty: 'easy',
    rewardXP: 12,
    target: 6,
  },

  // ── Daily: Training ──
  {
    id: 'daily_training_workout',
    type: 'daily',
    category: 'training',
    titleEn: 'Complete a workout',
    titleRu: 'Выполнить тренировку',
    descriptionEn: 'Finish any workout today',
    descriptionRu: 'Завершите любую тренировку сегодня',
    action: 'training:workout_complete',
    stat: 'strength',
    difficulty: 'easy',
    rewardXP: 20,
    target: 1,
  },

  // ── Daily: Habits ──
  {
    id: 'daily_habits_complete3',
    type: 'daily',
    category: 'health',
    titleEn: 'Complete 3 habits',
    titleRu: 'Выполнить 3 привычки',
    descriptionEn: 'Check off at least 3 habits today',
    descriptionRu: 'Отметьте минимум 3 привычки сегодня',
    action: 'habits:habit_complete',
    stat: 'agility',
    difficulty: 'easy',
    rewardXP: 15,
    target: 3,
  },
  {
    id: 'daily_habits_all',
    type: 'daily',
    category: 'health',
    titleEn: 'Complete all daily habits',
    titleRu: 'Выполнить все привычки за день',
    descriptionEn: 'Check off every positive habit for today',
    descriptionRu: 'Отметьте все позитивные привычки за сегодня',
    action: 'habits:all_daily_complete',
    stat: 'agility',
    difficulty: 'medium',
    rewardXP: 30,
    target: 1,
  },

  // ── Daily: Diary ──
  {
    id: 'daily_diary_reflection',
    type: 'daily',
    category: 'mind',
    titleEn: 'Write a daily reflection',
    titleRu: 'Написать дневниковую рефлексию',
    descriptionEn: 'Write at least one diary entry today',
    descriptionRu: 'Напишите хотя бы одну запись в дневнике сегодня',
    action: 'diary:entry_create',
    stat: 'charisma',
    difficulty: 'easy',
    rewardXP: 10,
    target: 1,
  },
  {
    id: 'daily_diary_long',
    type: 'daily',
    category: 'mind',
    titleEn: 'Write a deep reflection',
    titleRu: 'Написать глубокую рефлексию',
    descriptionEn: 'Write a diary entry with 500+ characters',
    descriptionRu: 'Напишите запись в дневник из 500+ символов',
    action: 'diary:entry_long',
    stat: 'charisma',
    difficulty: 'medium',
    rewardXP: 20,
    target: 1,
  },

  // ── Daily: Finance ──
  {
    id: 'daily_finance_log2',
    type: 'daily',
    category: 'finance',
    titleEn: 'Log 2 transactions',
    titleRu: 'Записать 2 транзакции',
    descriptionEn: 'Track your spending — log at least 2 transactions',
    descriptionRu: 'Следите за расходами — запишите минимум 2 транзакции',
    action: 'finance:transaction_log',
    stat: 'intelligence',
    difficulty: 'easy',
    rewardXP: 10,
    target: 2,
  },

  // ── Weekly: Training ──
  {
    id: 'weekly_training_3workouts',
    type: 'weekly',
    category: 'training',
    titleEn: 'Complete 3 workouts this week',
    titleRu: 'Завершить 3 тренировки за неделю',
    descriptionEn: 'Stay consistent — 3 workouts in 7 days',
    descriptionRu: 'Будьте последовательны — 3 тренировки за 7 дней',
    action: 'training:workout_complete',
    stat: 'strength',
    difficulty: 'medium',
    rewardXP: 50,
    target: 3,
  },
  {
    id: 'weekly_training_pr',
    type: 'weekly',
    category: 'training',
    titleEn: 'Set a personal record',
    titleRu: 'Установить личный рекорд',
    descriptionEn: 'Beat your previous best in any exercise',
    descriptionRu: 'Превзойдите свой лучший результат в любом упражнении',
    action: 'training:exercise_pr',
    stat: 'strength',
    difficulty: 'hard',
    rewardXP: 40,
    target: 1,
  },

  // ── Weekly: Finance ──
  {
    id: 'weekly_finance_5transactions',
    type: 'weekly',
    category: 'finance',
    titleEn: 'Log 5 transactions',
    titleRu: 'Записать 5 транзакций',
    descriptionEn: 'Keep your finances in order — log 5 transactions this week',
    descriptionRu: 'Держите финансы в порядке — запишите 5 транзакций за неделю',
    action: 'finance:transaction_log',
    stat: 'intelligence',
    difficulty: 'medium',
    rewardXP: 25,
    target: 5,
  },
  {
    id: 'weekly_finance_budget',
    type: 'weekly',
    category: 'finance',
    titleEn: 'Create a budget',
    titleRu: 'Создать бюджет',
    descriptionEn: 'Set up at least one budget category',
    descriptionRu: 'Настройте хотя бы одну категорию бюджета',
    action: 'finance:budget_created',
    stat: 'intelligence',
    difficulty: 'medium',
    rewardXP: 25,
    target: 1,
  },

  // ── Weekly: Nutrition ──
  {
    id: 'weekly_nutrition_water_goal3',
    type: 'weekly',
    category: 'nutrition',
    titleEn: 'Hit water goal 3 times',
    titleRu: 'Достичь нормы воды 3 раза',
    descriptionEn: 'Reach your daily water intake goal on 3 different days',
    descriptionRu: 'Достигайте дневной нормы воды в течение 3 разных дней',
    action: 'nutrition:water_goal',
    stat: 'endurance',
    difficulty: 'medium',
    rewardXP: 35,
    target: 3,
  },

  // ── Weekly: Diary ──
  {
    id: 'weekly_diary_5entries',
    type: 'weekly',
    category: 'mind',
    titleEn: 'Write 5 diary entries',
    titleRu: 'Написать 5 записей в дневник',
    descriptionEn: 'Reflect on your week — 5 diary entries',
    descriptionRu: 'Рефлексия недели — 5 записей в дневник',
    action: 'diary:entry_create',
    stat: 'charisma',
    difficulty: 'medium',
    rewardXP: 30,
    target: 5,
  },

  // ── Challenge: Habits ──
  {
    id: 'challenge_habits_streak7',
    type: 'challenge',
    category: 'health',
    titleEn: '7-day habit streak',
    titleRu: '7-дневная серия привычек',
    descriptionEn: 'Complete a habit every day for 7 consecutive days',
    descriptionRu: 'Выполняйте привычку каждый день в течение 7 дней подряд',
    action: 'habits:streak_7',
    stat: 'endurance',
    difficulty: 'hard',
    rewardXP: 100,
    target: 1,
  },
  {
    id: 'challenge_habits_streak14',
    type: 'challenge',
    category: 'health',
    titleEn: '14-day habit streak',
    titleRu: '14-дневная серия привычек',
    descriptionEn: 'Two weeks of consistency — complete habits for 14 days straight',
    descriptionRu: 'Две недели стабильности — выполняйте привычки 14 дней подряд',
    action: 'habits:streak_14',
    stat: 'endurance',
    difficulty: 'hard',
    rewardXP: 200,
    target: 1,
  },

  // ── Challenge: Training ──
  {
    id: 'challenge_training_7workouts',
    type: 'challenge',
    category: 'training',
    titleEn: '7 workouts challenge',
    titleRu: 'Челлендж 7 тренировок',
    descriptionEn: 'Complete 7 workouts to prove your dedication',
    descriptionRu: 'Завершите 7 тренировок, чтобы доказать свою преданность',
    action: 'training:workout_complete',
    stat: 'strength',
    difficulty: 'hard',
    rewardXP: 120,
    target: 7,
  },

  // ── Quiz ──
  {
    id: 'quiz_movie_quote',
    type: 'quiz',
    category: 'mind',
    titleEn: 'Guess the movie by quote',
    titleRu: 'Угадай фильм по цитате',
    descriptionEn: 'Test your cinema knowledge — guess the movie from a famous quote',
    descriptionRu: 'Проверьте знание кино — угадайте фильм по знаменитой цитате',
    action: 'quests:quiz_correct',
    stat: 'intelligence',
    difficulty: 'easy',
    rewardXP: 15,
    target: 1,
  },
  {
    id: 'quiz_quote_3',
    type: 'quiz',
    category: 'mind',
    titleEn: 'Identify 3 quotes correctly',
    titleRu: 'Угадать 3 цитаты правильно',
    descriptionEn: 'Get 3 quiz questions right in a row',
    descriptionRu: 'Дайте 3 правильных ответа на вопросы викторины подряд',
    action: 'quests:quiz_correct',
    stat: 'intelligence',
    difficulty: 'medium',
    rewardXP: 30,
    target: 3,
  },

  // ── Knowledge ──
  {
    id: 'knowledge_nutrition_macros',
    type: 'knowledge',
    category: 'nutrition',
    titleEn: 'Hit macro targets for a day',
    titleRu: 'Попасть в КБЖУ за день',
    descriptionEn: 'Meet your daily protein, fat, and carb targets',
    descriptionRu: 'Выполните дневные цели по белкам, жирам и углеводам',
    action: 'nutrition:daily_macros_target',
    stat: 'intelligence',
    difficulty: 'medium',
    rewardXP: 35,
    target: 1,
  },
  {
    id: 'knowledge_finance_nospend',
    type: 'knowledge',
    category: 'finance',
    titleEn: 'A day without unnecessary spending',
    titleRu: 'День без лишних трат',
    descriptionEn: 'Go a full day without logging non-essential expenses',
    descriptionRu: 'Прожите целый день без записи необязательных расходов',
    action: 'finance:no_unnecessary_spending_day',
    stat: 'intelligence',
    difficulty: 'easy',
    rewardXP: 12,
    target: 1,
  },
];
