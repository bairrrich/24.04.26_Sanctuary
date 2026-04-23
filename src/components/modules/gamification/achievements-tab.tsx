'use client';

import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';

/** Achievement definitions — will expand as modules are built */
const ACHIEVEMENT_DEFINITIONS = [
  // General
  { id: 'first_xp', icon: '🌟', nameRu: 'Первые шаги', nameEn: 'First Steps', descRu: 'Получите первый опыт', descEn: 'Earn your first XP', category: 'general' },
  { id: 'level_5', icon: '📈', nameRu: 'Специализация', nameEn: 'Specialization', descRu: 'Достигните 5 уровня', descEn: 'Reach level 5', category: 'general' },
  { id: 'level_10', icon: '🚀', nameRu: 'Эксперт', nameEn: 'Expert', descRu: 'Достигните 10 уровня', descEn: 'Reach level 10', category: 'general' },
  { id: 'level_20', icon: '💎', nameRu: 'Мастер', nameEn: 'Master', descRu: 'Достигните 20 уровня', descEn: 'Reach level 20', category: 'general' },
  { id: 'level_30', icon: '👑', nameRu: 'Легенда', nameEn: 'Legend', descRu: 'Достигните 30 уровня', descEn: 'Reach level 30', category: 'general' },
  { id: 'all_attrs_5', icon: '⚖️', nameRu: 'Баланс', nameEn: 'Balance', descRu: 'Все характеристики уровня 5+', descEn: 'All attributes level 5+', category: 'general' },
  { id: 'xp_1000', icon: '💯', nameRu: 'Тысячник', nameEn: 'Thousandaire', descRu: 'Наберите 1000 XP', descEn: 'Earn 1000 XP', category: 'general' },
  { id: 'xp_10000', icon: '🔥', nameRu: 'Десятитысячник', nameEn: 'Ten K', descRu: 'Наберите 10000 XP', descEn: 'Earn 10000 XP', category: 'general' },

  // Strength
  { id: 'first_workout', icon: '💪', nameRu: 'Первый подход', nameEn: 'First Set', descRu: 'Завершите первую тренировку', descEn: 'Complete your first workout', category: 'strength' },
  { id: 'strength_10', icon: '🏋️', nameRu: 'Качок', nameEn: 'Swoldier', descRu: 'Сила уровня 10', descEn: 'Strength level 10', category: 'strength' },

  // Endurance
  { id: 'first_meal', icon: '🥗', nameRu: 'Первый приём', nameEn: 'First Meal', descRu: 'Запишите первый приём пищи', descEn: 'Log your first meal', category: 'endurance' },
  { id: 'endurance_10', icon: '🛡️', nameRu: 'Стойкий', nameEn: 'Resilient', descRu: 'Выносливость уровня 10', descEn: 'Endurance level 10', category: 'endurance' },

  // Intelligence
  { id: 'first_transaction', icon: '💰', nameRu: 'Первая запись', nameEn: 'First Entry', descRu: 'Запишите первую транзакцию', descEn: 'Log your first transaction', category: 'intelligence' },
  { id: 'intelligence_10', icon: '🧠', nameRu: 'Мыслитель', nameEn: 'Thinker', descRu: 'Интеллект уровня 10', descEn: 'Intelligence level 10', category: 'intelligence' },

  // Agility
  { id: 'first_habit', icon: '🎯', nameRu: 'Первый шаг', nameEn: 'First Step', descRu: 'Выполните первую привычку', descEn: 'Complete your first habit', category: 'agility' },
  { id: 'agility_10', icon: '⚡', nameRu: 'Быстрый', nameEn: 'Swift', descRu: 'Ловкость уровня 10', descEn: 'Agility level 10', category: 'agility' },

  // Charisma
  { id: 'first_diary', icon: '✍️', nameRu: 'Первая мысль', nameEn: 'First Thought', descRu: 'Сделайте первую запись в дневнике', descEn: 'Write your first diary entry', category: 'charisma' },
  { id: 'charisma_10', icon: '⭐', nameRu: 'Оратор', nameEn: 'Speaker', descRu: 'Харизма уровня 10', descEn: 'Charisma level 10', category: 'charisma' },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6366f1',
  strength: '#ef4444',
  endurance: '#22c55e',
  intelligence: '#3b82f6',
  agility: '#f59e0b',
  charisma: '#ec4899',
};

export function AchievementsTab() {
  const language = useSettingsStore((s) => s.language);

  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      className="space-y-4"
    >
      <h3 className="text-sm font-semibold">
        {language === 'ru' ? 'Достижения' : 'Achievements'}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACHIEVEMENT_DEFINITIONS.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, ...ANIMATION.SPRING_GENTLE }}
            className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 opacity-40 hover:opacity-60 transition-opacity cursor-default"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg grayscale">
              {achievement.icon}
            </div>
            <span className="text-[10px] font-medium text-center leading-tight">
              {language === 'ru' ? achievement.nameRu : achievement.nameEn}
            </span>
            <span className="text-[9px] text-muted-foreground text-center leading-tight">
              {language === 'ru' ? achievement.descRu : achievement.descEn}
            </span>
            <Lock className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
