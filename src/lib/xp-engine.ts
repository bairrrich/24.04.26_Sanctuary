/**
 * XP Engine — Shared service for cross-module XP integration.
 *
 * Every module calls emitXP() to award experience.
 * The engine calculates levels, classes, and triggers achievements.
 */
import type { RPGAttribute } from '@/types';

// ==================== XP Rules ====================

export interface XPRule {
  attribute: RPGAttribute;
  baseXP: number;
  description?: string;
}

export type ModuleAction = string;

export const XP_RULES: Record<string, Record<ModuleAction, XPRule>> = {
  habits: {
    habit_complete: { attribute: 'agility', baseXP: 8, description: 'Привычка выполнена' },
    habit_negative_break: { attribute: 'endurance', baseXP: 5, description: 'Негативная привычка нарушена' },
    streak_3: { attribute: 'agility', baseXP: 20, description: 'Серия 3 дня' },
    streak_7: { attribute: 'endurance', baseXP: 50, description: 'Серия 7 дней' },
    streak_14: { attribute: 'endurance', baseXP: 100, description: 'Серия 14 дней' },
    streak_30: { attribute: 'endurance', baseXP: 250, description: 'Серия 30 дней' },
    streak_60: { attribute: 'endurance', baseXP: 500, description: 'Серия 60 дней' },
    streak_100: { attribute: 'endurance', baseXP: 1000, description: 'Серия 100 дней' },
    all_daily_complete: { attribute: 'agility', baseXP: 30, description: 'Все привычки за день' },
  },
  nutrition: {
    meal_log: { attribute: 'endurance', baseXP: 3, description: 'Приём пищи записан' },
    water_glass: { attribute: 'endurance', baseXP: 2, description: 'Стакан воды' },
    water_goal: { attribute: 'endurance', baseXP: 15, description: 'Норма воды выполнена' },
    daily_calories_target: { attribute: 'endurance', baseXP: 20, description: 'Цель по калориям достигнута' },
    daily_macros_target: { attribute: 'endurance', baseXP: 25, description: 'Цель по КБЖУ достигнута' },
    fasting_complete: { attribute: 'endurance', baseXP: 30, description: 'Голодание завершено' },
    recipe_create: { attribute: 'intelligence', baseXP: 10, description: 'Рецепт создан' },
  },
  training: {
    workout_complete: { attribute: 'strength', baseXP: 15, description: 'Тренировка завершена' },
    exercise_pr: { attribute: 'strength', baseXP: 25, description: 'Личный рекорд' },
    weekly_goal: { attribute: 'strength', baseXP: 50, description: 'Недельная цель тренировок' },
    monthly_goal: { attribute: 'strength', baseXP: 150, description: 'Месячная цель тренировок' },
    rest_day_respected: { attribute: 'endurance', baseXP: 5, description: 'День отдыха соблюдён' },
  },
  finance: {
    transaction_log: { attribute: 'intelligence', baseXP: 3, description: 'Транзакция записана' },
    budget_created: { attribute: 'intelligence', baseXP: 15, description: 'Бюджет создан' },
    budget_met: { attribute: 'intelligence', baseXP: 30, description: 'Бюджет соблюдён' },
    savings_goal_reached: { attribute: 'intelligence', baseXP: 50, description: 'Цель накоплений достигнута' },
    investment_log: { attribute: 'intelligence', baseXP: 10, description: 'Инвестиция записана' },
    no_unnecessary_spending_day: { attribute: 'intelligence', baseXP: 8, description: 'День без лишних трат' },
  },
  diary: {
    entry_create: { attribute: 'charisma', baseXP: 5, description: 'Запись в дневнике' },
    entry_long: { attribute: 'charisma', baseXP: 12, description: 'Длинная запись (500+ символов)' },
    daily_reflection: { attribute: 'charisma', baseXP: 15, description: 'Ежедневная рефлексия' },
  },
  health: {
    mood_log: { attribute: 'charisma', baseXP: 3, description: 'Настроение записано' },
    wellbeing_good: { attribute: 'endurance', baseXP: 5, description: 'Хорошее самочувствие' },
    illness_recovery: { attribute: 'endurance', baseXP: 30, description: 'Выздоровление' },
    body_measurements: { attribute: 'endurance', baseXP: 5, description: 'Замеры тела записаны' },
  },
  collections: {
    item_add: { attribute: 'intelligence', baseXP: 5, description: 'Элемент добавлен в коллекцию' },
    review_write: { attribute: 'charisma', baseXP: 10, description: 'Отзыв написан' },
    collection_complete: { attribute: 'intelligence', baseXP: 30, description: 'Коллекция завершена' },
  },
  shifts: {
    shift_complete: { attribute: 'endurance', baseXP: 10, description: 'Смена отработана' },
    overtime_logged: { attribute: 'strength', baseXP: 5, description: 'Переработка учтена' },
  },
  feed: {
    post_create: { attribute: 'charisma', baseXP: 8, description: 'Пост опубликован' },
    post_shared: { attribute: 'charisma', baseXP: 3, description: 'Запись поделена' },
  },
  genealogy: {
    member_add: { attribute: 'charisma', baseXP: 10, description: 'Член семьи добавлен' },
    event_add: { attribute: 'charisma', baseXP: 5, description: 'Событие добавлено' },
  },
  looksmaxxing: {
    routine_complete: { attribute: 'charisma', baseXP: 8, description: 'Рутина выполнена' },
    progress_photo: { attribute: 'charisma', baseXP: 5, description: 'Фото прогресса' },
    rating_improve: { attribute: 'charisma', baseXP: 20, description: 'Рейтинг улучшен' },
  },
  calendar: {
    event_create: { attribute: 'intelligence', baseXP: 3, description: 'Событие создано' },
    event_attend: { attribute: 'charisma', baseXP: 5, description: 'Событие посещено' },
  },
  reminders: {
    reminder_complete: { attribute: 'agility', baseXP: 3, description: 'Напоминание выполнено' },
  },
  quests: {
    quest_complete: { attribute: 'intelligence', baseXP: 20, description: 'Квест завершён' },
    quiz_correct: { attribute: 'intelligence', baseXP: 10, description: 'Правильный ответ в викторине' },
    quote_guess: { attribute: 'intelligence', baseXP: 8, description: 'Цитата угадана' },
  },
};

// ==================== Level Formulas ====================

/** Calculate XP needed for a given attribute level */
export function xpForAttributeLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.4));
}

/** Calculate total XP needed to reach a given attribute level from level 1 */
export function totalXPForAttributeLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForAttributeLevel(i);
  }
  return total;
}

/** Calculate character level from total XP */
export function characterLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = xpForCharacterLevel(level);
  while (totalXP >= xpNeeded) {
    level++;
    xpNeeded = xpForCharacterLevel(level);
  }
  return level;
}

/** XP needed to reach next character level from current level */
export function xpForCharacterLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** Total XP needed to reach a given character level from level 1 */
export function totalXPForCharacterLevel(targetLevel: number): number {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += xpForCharacterLevel(i);
  }
  return total;
}

/** Get XP progress within current level */
export function getXPProgressInLevel(totalXP: number, level: number): { current: number; needed: number; percentage: number } {
  const xpForCurrentLevel = totalXPForCharacterLevel(level);
  const xpForNextLevel = totalXPForCharacterLevel(level + 1);
  const current = totalXP - xpForCurrentLevel;
  const needed = xpForNextLevel - xpForCurrentLevel;
  return {
    current: Math.max(0, current),
    needed,
    percentage: Math.min(100, Math.max(0, (current / needed) * 100)),
  };
}

/** Get attribute XP progress within current attribute level */
export function getAttributeXPProgress(currentXP: number, currentLevel: number): { current: number; needed: number; percentage: number } {
  const xpForCurrentLevel = totalXPForAttributeLevel(currentLevel);
  const xpForNextLevel = totalXPForAttributeLevel(currentLevel + 1);
  const current = currentXP - xpForCurrentLevel;
  const needed = xpForNextLevel - xpForCurrentLevel;
  return {
    current: Math.max(0, current),
    needed,
    percentage: Math.min(100, Math.max(0, (current / needed) * 100)),
  };
}

/** Calculate attribute level from XP */
export function attributeLevelFromXP(xp: number): number {
  let level = 1;
  let totalNeeded = xpForAttributeLevel(level);
  while (xp >= totalNeeded) {
    level++;
    totalNeeded = xpForAttributeLevel(level);
  }
  return level;
}

// ==================== Emit XP ====================

export interface EmitXPParams {
  module: string;
  action: string;
  metadata?: Record<string, unknown>;
}

/** Get XP rule for a module action */
export function getXPRule(module: string, action: string): XPRule | null {
  return XP_RULES[module]?.[action] ?? null;
}

/** Calculate all XP that would be awarded for an action */
export function calculateXP(module: string, action: string): { attribute: RPGAttribute; amount: number } | null {
  const rule = getXPRule(module, action);
  if (!rule) return null;
  return { attribute: rule.attribute, amount: rule.baseXP };
}
