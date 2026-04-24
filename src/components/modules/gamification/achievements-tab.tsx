'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Trophy, CheckCircle2 } from 'lucide-react';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ==================== Types ====================

interface AchievementItem {
  id: string;
  nameEn: string;
  nameRu: string;
  descriptionEn: string;
  descriptionRu: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementStats {
  total: number;
  unlocked: number;
  percentage: number;
}

// ==================== Category Mapping ====================

const ACHIEVEMENT_CATEGORIES: Record<string, string> = {
  // Training → strength
  first_workout: 'strength',
  week_warrior: 'strength',
  iron_will: 'strength',
  centurion: 'strength',
  // Habits → agility
  habit_starter: 'agility',
  habit_master: 'agility',
  streak_master: 'agility',
  streak_legend: 'agility',
  // Diary → charisma
  first_entry: 'charisma',
  storyteller: 'charisma',
  chronicler: 'charisma',
  // Finance → intelligence
  budget_boss: 'intelligence',
  accountant: 'intelligence',
  wealth_manager: 'intelligence',
  // Level → general
  level_5: 'general',
  level_10: 'general',
  level_20: 'general',
  level_30: 'general',
  // XP → general
  xp_century: 'general',
  xp_millennium: 'general',
  xp_titan: 'general',
  // Attributes → their own category
  strength_10: 'strength',
  agility_10: 'agility',
  intelligence_10: 'intelligence',
  endurance_10: 'endurance',
  charisma_10: 'charisma',
};

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6366f1',
  strength: '#ef4444',
  endurance: '#22c55e',
  intelligence: '#3b82f6',
  agility: '#f59e0b',
  charisma: '#ec4899',
};

const CATEGORY_LABELS: Record<string, { en: string; ru: string }> = {
  general: { en: 'General', ru: 'Общие' },
  strength: { en: 'Strength', ru: 'Сила' },
  endurance: { en: 'Endurance', ru: 'Выносливость' },
  intelligence: { en: 'Intelligence', ru: 'Интеллект' },
  agility: { en: 'Agility', ru: 'Ловкость' },
  charisma: { en: 'Charisma', ru: 'Харизма' },
};

const CATEGORY_ORDER = ['general', 'strength', 'agility', 'intelligence', 'endurance', 'charisma'];

// ==================== Helpers ====================

function getCategoryForAchievement(id: string): string {
  return ACHIEVEMENT_CATEGORIES[id] ?? 'general';
}

function formatDate(dateStr: string, language: 'en' | 'ru'): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

// ==================== Component ====================

export function AchievementsTab() {
  const language = useSettingsStore((s) => s.language);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [stats, setStats] = useState<AchievementStats>({ total: 0, unlocked: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const res = await fetch('/api/gamification/achievements');
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements ?? []);
        setStats(data.stats ?? { total: 0, unlocked: 0, percentage: 0 });
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Listen for gamification updates to refresh achievements
  useEffect(() => {
    const handleUpdate = () => {
      fetchAchievements();
    };
    window.addEventListener('gamification:updated', handleUpdate);
    return () => window.removeEventListener('gamification:updated', handleUpdate);
  }, [fetchAchievements]);

  // Group achievements by category
  const grouped = CATEGORY_ORDER.map((category) => {
    const items = achievements
      .filter((a) => getCategoryForAchievement(a.id) === category)
      // Unlocked first, then locked
      .sort((a, b) => {
        if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
        return 0;
      });
    return { category, items };
  }).filter((g) => g.items.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      className="space-y-5"
    >
      {/* Progress Stats */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${CATEGORY_COLORS.general}20` }}
          >
            <Trophy className="h-5 w-5" style={{ color: CATEGORY_COLORS.general }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {language === 'ru' ? 'Прогресс достижений' : 'Achievement Progress'}
              </span>
              <Badge variant="secondary" className="text-xs">
                {stats.unlocked}/{stats.total} {language === 'ru' ? 'открыто' : 'unlocked'}
              </Badge>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS.general }}
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {stats.percentage}% {language === 'ru' ? 'завершено' : 'complete'}
            </span>
          </div>
        </div>
      </Card>

      {/* Category Groups */}
      {grouped.map(({ category, items }) => {
        const color = CATEGORY_COLORS[category];
        const label = CATEGORY_LABELS[category];
        const unlockedCount = items.filter((a) => a.isUnlocked).length;

        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {language === 'ru' ? label.ru : label.en}
              </h4>
              <span className="text-[10px] text-muted-foreground">
                {unlockedCount}/{items.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, ...ANIMATION.SPRING_GENTLE }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 transition-opacity ${
                    achievement.isUnlocked
                      ? 'opacity-100 cursor-default'
                      : 'opacity-40 hover:opacity-60 cursor-default'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                      achievement.isUnlocked ? '' : 'grayscale bg-muted'
                    }`}
                    style={
                      achievement.isUnlocked
                        ? { backgroundColor: `${color}20` }
                        : undefined
                    }
                  >
                    {achievement.icon}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {language === 'ru' ? achievement.nameRu : achievement.nameEn}
                  </span>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">
                    {language === 'ru' ? achievement.descriptionRu : achievement.descriptionEn}
                  </span>

                  {achievement.isUnlocked ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2
                        className="h-3 w-3"
                        style={{ color }}
                      />
                      {achievement.unlockedAt && (
                        <span className="text-[8px] text-muted-foreground">
                          {formatDate(achievement.unlockedAt, language)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground mt-0.5" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
