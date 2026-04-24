'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, RefreshCw, Check, Clock, Zap, Star } from 'lucide-react';
import { EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';

// ==================== Types ====================

interface QuestTemplate {
  titleEn: string;
  titleRu: string;
  descriptionEn?: string;
  descriptionRu?: string;
  type: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardXP: number;
  stat: string;
}

interface Quest {
  id: string;
  questId: string;
  status: 'active' | 'completed' | 'expired';
  progress: number;
  target: number;
  completedAt?: string | null;
  expiresAt?: string | null;
  template: QuestTemplate | null;
}

// ==================== Helpers ====================

const DIFFICULTY_COLORS = {
  easy: 'text-green-600 bg-green-500/10',
  medium: 'text-amber-600 bg-amber-500/10',
  hard: 'text-red-600 bg-red-500/10',
};

const DIFFICULTY_LABELS = {
  easy: { en: 'Easy', ru: 'Легко' },
  medium: { en: 'Medium', ru: 'Средне' },
  hard: { en: 'Hard', ru: 'Сложно' },
};

const STAT_ICONS: Record<string, string> = {
  strength: '💪',
  agility: '⚡',
  intelligence: '🧠',
  endurance: '🛡️',
  charisma: '⭐',
};

const STAT_LABELS: Record<string, { en: string; ru: string }> = {
  strength: { en: 'Strength', ru: 'Сила' },
  agility: { en: 'Agility', ru: 'Ловкость' },
  intelligence: { en: 'Intelligence', ru: 'Интеллект' },
  endurance: { en: 'Endurance', ru: 'Выносливость' },
  charisma: { en: 'Charisma', ru: 'Харизма' },
};

// ==================== Main Component ====================

export function QuestsTab() {
  const language = useSettingsStore((s) => s.language);
  const accentColor = MODULE_REGISTRY.gamification.accentColor;
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadQuests = useCallback(async () => {
    try {
      const res = await fetch('/api/gamification/quests');
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests ?? []);
      }
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuests();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQuests]);

  const generateDailyQuests = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gamification/quests', { method: 'POST' });
      if (res.ok) {
        // Re-fetch enriched quest data via GET
        await loadQuests();
      }
    } catch (error) {
      console.error('Error generating quests:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Group quests by type (from template)
  const dailyQuests = quests.filter((q) => q.template?.type === 'daily');
  const weeklyQuests = quests.filter((q) => q.template?.type === 'weekly');
  const challengeQuests = quests.filter((q) => q.template?.type === 'challenge' || q.template?.type === 'quiz' || q.template?.type === 'knowledge');
  const completedQuests = quests.filter((q) => q.status === 'completed');
  const activeQuests = quests.filter((q) => q.status === 'active');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // No quests at all
  if (quests.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title={language === 'ru' ? 'Нет квестов' : 'No quests'}
        description={
          language === 'ru'
            ? 'Сгенерируйте ежедневные квесты, чтобы зарабатывать XP'
            : 'Generate daily quests to earn bonus XP'
        }
        accentColor={accentColor}
        actionLabel={language === 'ru' ? 'Сгенерировать квесты' : 'Generate quests'}
        onAction={generateDailyQuests}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header with generate button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" style={{ color: accentColor }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Квесты' : 'Quests'} ({activeQuests.length}/{quests.length})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateDailyQuests}
          disabled={isGenerating}
          className="h-7 text-xs gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
          {language === 'ru' ? 'Новые квесты' : 'New quests'}
        </Button>
      </div>

      {/* Daily Quests */}
      {dailyQuests.length > 0 && (
        <QuestSection
          title={language === 'ru' ? 'Ежедневные' : 'Daily'}
          quests={dailyQuests}
          language={language}
          accentColor={accentColor}
        />
      )}

      {/* Weekly Quests */}
      {weeklyQuests.length > 0 && (
        <QuestSection
          title={language === 'ru' ? 'Еженедельные' : 'Weekly'}
          quests={weeklyQuests}
          language={language}
          accentColor={accentColor}
        />
      )}

      {/* Challenge/Quiz Quests */}
      {challengeQuests.length > 0 && (
        <QuestSection
          title={language === 'ru' ? 'Испытания' : 'Challenges'}
          quests={challengeQuests}
          language={language}
          accentColor={accentColor}
        />
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <QuestSection
          title={language === 'ru' ? 'Завершённые' : 'Completed'}
          quests={completedQuests}
          language={language}
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Quest Section ====================

function QuestSection({
  title,
  quests,
  language,
  accentColor,
}: {
  title: string;
  quests: Quest[];
  language: 'en' | 'ru';
  accentColor: string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        {title}
      </h4>
      {quests.map((quest, i) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          language={language}
          accentColor={accentColor}
          index={i}
        />
      ))}
    </div>
  );
}

// ==================== Quest Card ====================

function QuestCard({
  quest,
  language,
  accentColor,
  index,
}: {
  quest: Quest;
  language: 'en' | 'ru';
  accentColor: string;
  index: number;
}) {
  const isCompleted = quest.status === 'completed';
  const progress = Math.min(quest.progress / quest.target, 1);
  const t = quest.template;
  const title = t ? (language === 'ru' ? t.titleRu : t.titleEn) : quest.questId;
  const description = t ? (language === 'ru' ? t.descriptionRu : t.descriptionEn) : undefined;
  const difficulty = t?.difficulty ?? 'easy';
  const rewardXP = t?.rewardXP ?? 0;
  const stat = t?.stat ?? 'intelligence';
  const difficultyLabel = DIFFICULTY_LABELS[difficulty]?.[language] ?? difficulty;
  const statIcon = STAT_ICONS[stat] ?? '⭐';
  const statLabel = STAT_LABELS[stat]?.[language] ?? stat;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ...ANIMATION.SPRING_GENTLE }}
      className={`rounded-xl border bg-card p-3.5 transition-all ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Top row: title + XP */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isCompleted && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            )}
            <p className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}>
              {title}
            </p>
          </div>
          {description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* XP Reward badge */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <Zap className="h-3 w-3" style={{ color: accentColor }} />
          <span className="text-xs font-bold" style={{ color: accentColor }}>
            +{rewardXP}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {/* Difficulty badge */}
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[difficulty]}`}>
              {difficultyLabel}
            </span>
            {/* Stat badge */}
            <span className="flex items-center gap-0.5 text-[9px] font-medium text-muted-foreground">
              {statIcon} {statLabel}
            </span>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {quest.progress}/{quest.target}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: isCompleted ? '#22c55e' : accentColor }}
          />
        </div>
      </div>

      {/* Expiry info */}
      {quest.expiresAt && !isCompleted && (
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">
            {formatExpiry(quest.expiresAt, language)}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ==================== Helpers ====================

function formatExpiry(expiresAt: string, language: 'en' | 'ru'): string {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return language === 'ru' ? 'Истёк' : 'Expired';
  if (diffDays > 0) return language === 'ru' ? `Осталось ${diffDays} дн.` : `${diffDays}d left`;
  if (diffHours > 0) return language === 'ru' ? `Осталось ${diffHours} ч.` : `${diffHours}h left`;
  return language === 'ru' ? 'Менее часа' : 'Less than 1h';
}
