'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell, Plus, ChevronLeft, ChevronRight, Trash2, Trophy,
  Timer, Flame, TrendingUp, Award, BarChart3, ChevronDown, Check, X,
} from 'lucide-react';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION, SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useTrainingStore, type Workout, type Exercise, type CreateExerciseData } from '@/store/training-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

// ==================== Helpers ====================

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr: string, language: 'en' | 'ru'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const months = language === 'ru'
    ? ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function formatFullDate(dateStr: string, language: 'en' | 'ru'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const weekdays = language === 'ru'
    ? ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = language === 'ru'
    ? ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const WORKOUT_TYPES = [
  { id: 'strength', emoji: '🏋️', labelEn: 'Strength', labelRu: 'Силовая' },
  { id: 'cardio', emoji: '🏃', labelEn: 'Cardio', labelRu: 'Кардио' },
  { id: 'flexibility', emoji: '🧘', labelEn: 'Flexibility', labelRu: 'Гибкость' },
  { id: 'other', emoji: '⚡', labelEn: 'Other', labelRu: 'Другое' },
] as const;

function getTypeLabel(type: string, language: 'en' | 'ru'): string {
  const found = WORKOUT_TYPES.find((t) => t.id === type);
  if (!found) return type;
  return language === 'ru' ? found.labelRu : found.labelEn;
}

function getTypeEmoji(type: string): string {
  const found = WORKOUT_TYPES.find((t) => t.id === type);
  return found?.emoji ?? '💪';
}

function formatVolume(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * ex.weight, 0);
}

// ==================== Inline Spinner ====================

function InlineSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

// ==================== Main Component ====================

export function TrainingPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.training;
  const {
    dailyWorkouts, isDailyLoading, selectedDate,
    loadWorkouts, setSelectedDate,
  } = useTrainingStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('workouts');
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  // Load workouts for selected date — only when date actually changes
  useEffect(() => {
    loadWorkouts(selectedDate);
  }, [selectedDate, loadWorkouts]);

  // Listen for gamification updates
  useEffect(() => {
    const handler = () => {
      loadCharacter();
    };
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const hasWorkoutToday = dailyWorkouts.length > 0;

  const tabs: TabItem[] = [
    { id: 'workouts', label: language === 'ru' ? 'Тренировки' : 'Workouts' },
    { id: 'history', label: language === 'ru' ? 'История' : 'History' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Тренировки' : 'Training'}
        icon={Dumbbell}
        accentColor={config.accentColor}
        subtitle={
          hasWorkoutToday
            ? `${dailyWorkouts.length} ${language === 'ru' ? 'тренировка' : 'workout'}${dailyWorkouts.length > 1 ? 's' : ''}`
            : undefined
        }
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {/* Always show tabs — never hide them during loading */}
        <ModuleTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor={config.accentColor}
        />

        {/* Tab content — no AnimatePresence mode="wait" for instant switching */}
        {activeTab === 'workouts' && (
          <WorkoutsTab
            workouts={dailyWorkouts}
            isLoading={isDailyLoading}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            language={language}
            accentColor={config.accentColor}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            language={language}
            accentColor={config.accentColor}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            language={language}
            accentColor={config.accentColor}
          />
        )}
      </div>

      <FAB
        accentColor={config.accentColor}
        onClick={() => setShowCreateSheet(true)}
      />

      <CreateWorkoutSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        language={language}
        accentColor={config.accentColor}
        selectedDate={selectedDate}
      />
    </div>
  );
}

// ==================== Workouts Tab ====================

function WorkoutsTab({
  workouts,
  isLoading,
  selectedDate,
  onDateChange,
  language,
  accentColor,
}: {
  workouts: Workout[];
  isLoading: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const today = getTodayString();
  const isToday = selectedDate === today;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Date Navigation — always visible */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-3">
        <button
          onClick={() => onDateChange(addDays(selectedDate, -1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {formatFullDate(selectedDate, language)}
          </p>
          {isToday && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {language === 'ru' ? 'Сегодня' : 'Today'}
            </span>
          )}
        </div>
        <button
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          disabled={selectedDate >= today}
        >
          <ChevronRight className={`h-5 w-5 ${selectedDate >= today ? 'opacity-30' : ''}`} />
        </button>
      </div>

      {/* Loading state — inline, not blocking the whole page */}
      {isLoading ? (
        <InlineSpinner />
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={language === 'ru' ? 'Нет тренировок' : 'No workouts'}
          description={
            language === 'ru'
              ? 'Начните тренировку, чтобы зафиксировать прогресс'
              : 'Start a workout to track your progress'
          }
          accentColor={accentColor}
          actionLabel={language === 'ru' ? 'Начать тренировку' : 'Start workout'}
          onAction={() => {
            const fab = document.querySelector('[data-fab]') as HTMLElement;
            fab?.click();
          }}
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout, i) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              language={language}
              accentColor={accentColor}
              index={i}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ==================== Workout Card ====================

function WorkoutCard({
  workout,
  language,
  accentColor,
  index,
}: {
  workout: Workout;
  language: 'en' | 'ru';
  accentColor: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const deleteWorkout = useTrainingStore((s) => s.deleteWorkout);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {getTypeEmoji(workout.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{workout.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
            >
              {getTypeLabel(workout.type, language)}
            </span>
            {workout.duration > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-medium">
                <Timer className="h-3 w-3" />
                {workout.duration} {language === 'ru' ? 'мин' : 'min'}
              </span>
            )}
            {workout.exercises.length > 0 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {workout.exercises.length} {language === 'ru' ? 'упр.' : 'ex.'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {workout.exercises.some((e) => e.isPR) && (
            <Trophy className="h-4 w-4 text-amber-500" />
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Exercises */}
      {expanded && (
        <div className="overflow-hidden">
          <div className="px-4 pb-3 space-y-2">
            {workout.exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                language={language}
                accentColor={accentColor}
              />
            ))}
            {workout.exercises.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {language === 'ru' ? 'Нет упражнений' : 'No exercises'}
              </p>
            )}
            {/* Volume & Delete */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-[10px] text-muted-foreground">
                {language === 'ru' ? 'Объём' : 'Volume'}: {formatVolume(workout.exercises).toLocaleString()} kg
              </span>
              <button
                onClick={() => deleteWorkout(workout.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ==================== Exercise Row ====================

function ExerciseRow({
  exercise,
  language,
  accentColor,
}: {
  exercise: Exercise;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 p-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium truncate">{exercise.name}</p>
          {exercise.isPR && (
            <span
              className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded shrink-0"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              <Trophy className="h-2.5 w-2.5" />
              PR
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {exercise.sets > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {exercise.sets}×{exercise.reps}
              {exercise.weight > 0 && ` ×${exercise.weight}kg`}
            </span>
          )}
          {exercise.duration > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Timer className="h-2.5 w-2.5" />
              {exercise.duration}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== History Tab ====================

function HistoryTab({
  language,
  accentColor,
}: {
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const loadWorkoutsRange = useTrainingStore((s) => s.loadWorkoutsRange);
  const rangeWorkouts = useTrainingStore((s) => s.rangeWorkouts);
  const isRangeLoading = useTrainingStore((s) => s.isRangeLoading);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(getTodayString());

  useEffect(() => {
    loadWorkoutsRange(fromDate, toDate);
  }, [fromDate, toDate, loadWorkoutsRange]);

  // Group workouts by date
  const groupedWorkouts = useMemo(() => {
    const groups: Record<string, Workout[]> = {};
    for (const w of rangeWorkouts) {
      if (!groups[w.date]) groups[w.date] = [];
      groups[w.date].push(w);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [rangeWorkouts]);

  if (isRangeLoading && rangeWorkouts.length === 0) {
    return <InlineSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {groupedWorkouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={language === 'ru' ? 'Нет истории' : 'No history'}
          description={
            language === 'ru'
              ? 'Тренировки за последние 30 дней не найдены'
              : 'No workouts found in the last 30 days'
          }
          accentColor={accentColor}
        />
      ) : (
        groupedWorkouts.map(([date, dateWorkouts]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {formatFullDate(date, language)}
            </h3>
            {dateWorkouts.map((workout, i) => (
              <HistoryWorkoutCard
                key={workout.id}
                workout={workout}
                language={language}
                accentColor={accentColor}
                index={i}
              />
            ))}
          </div>
        ))
      )}
    </motion.div>
  );
}

// ==================== History Workout Card (expandable) ====================

function HistoryWorkoutCard({
  workout,
  language,
  accentColor,
  index,
}: {
  workout: Workout;
  language: 'en' | 'ru';
  accentColor: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const deleteWorkout = useTrainingStore((s) => s.deleteWorkout);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-lg">{getTypeEmoji(workout.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{workout.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
              style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
            >
              {getTypeLabel(workout.type, language)}
            </span>
            {workout.duration > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {workout.duration} {language === 'ru' ? 'мин' : 'min'}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {workout.exercises.length} {language === 'ru' ? 'упр.' : 'ex.'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {workout.exercises.some((e) => e.isPR) && (
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-1.5">
            {workout.exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                language={language}
                accentColor={accentColor}
              />
            ))}
            {workout.note && (
              <p className="text-[10px] text-muted-foreground italic px-1">
                {workout.note}
              </p>
            )}
            <div className="flex items-center justify-end pt-1.5 border-t">
              <button
                onClick={() => deleteWorkout(workout.id)}
                className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ==================== Analytics Tab ====================

function AnalyticsTab({
  language,
  accentColor,
}: {
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const loadWorkoutsRange = useTrainingStore((s) => s.loadWorkoutsRange);
  const rangeWorkouts = useTrainingStore((s) => s.rangeWorkouts);
  const isRangeLoading = useTrainingStore((s) => s.isRangeLoading);
  const [rangeLoaded, setRangeLoaded] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    loadWorkoutsRange(d.toISOString().split('T')[0], getTodayString()).then(() => setRangeLoaded(true));
  }, [loadWorkoutsRange]);

  const workouts = rangeWorkouts;
  const allExercises = workouts.flatMap((w) => w.exercises);
  const totalVolume = formatVolume(allExercises);
  const totalPRs = allExercises.filter((e) => e.isPR).length;

  // Workout type distribution
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of workouts) {
      counts[w.type] = (counts[w.type] || 0) + 1;
    }
    return WORKOUT_TYPES.map((t) => ({
      type: t.id,
      emoji: t.emoji,
      label: language === 'ru' ? t.labelRu : t.labelEn,
      count: counts[t.id] || 0,
    })).filter((t) => t.count > 0);
  }, [workouts, language]);

  const maxTypeCount = Math.max(...typeDistribution.map((t) => t.count), 1);

  // Recent PRs
  const recentPRs = useMemo(() => {
    return allExercises
      .filter((e) => e.isPR)
      .slice(0, 10);
  }, [allExercises]);

  const stats = [
    {
      label: language === 'ru' ? 'Всего тренировок' : 'Total Workouts',
      value: workouts.length,
      icon: '🏋️',
    },
    {
      label: language === 'ru' ? 'Всего упражнений' : 'Total Exercises',
      value: allExercises.length,
      icon: '💪',
    },
    {
      label: language === 'ru' ? 'Личные рекорды' : 'PRs',
      value: totalPRs,
      icon: '🏆',
    },
    {
      label: language === 'ru' ? 'Общий объём' : 'Total Volume',
      value: totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`,
      icon: '📊',
    },
  ];

  if (isRangeLoading && !rangeLoaded) {
    return <InlineSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, ...ANIMATION.SPRING_GENTLE }}
            className="rounded-xl border bg-card p-3 text-center"
          >
            <span className="text-xl">{stat.icon}</span>
            <p className="text-lg font-bold mt-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Workout Type Distribution */}
      {typeDistribution.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Типы тренировок' : 'Workout Types'}
          </h4>
          {typeDistribution.map((item) => (
            <div key={item.type} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span>{item.emoji}</span>
                  {item.label}
                </span>
                <span className="text-xs font-bold" style={{ color: accentColor }}>
                  {item.count}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            {language === 'ru' ? 'Личные рекорды' : 'Personal Records'}
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
            {recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center gap-2 rounded-lg bg-amber-500/5 p-2"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs font-medium flex-1 truncate">{pr.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {pr.sets > 0 ? `${pr.sets}×${pr.reps}` : ''}
                  {pr.weight > 0 ? ` @${pr.weight}kg` : ''}
                  {pr.duration > 0 ? ` ${pr.duration}s` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workouts.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title={language === 'ru' ? 'Нет данных' : 'No data'}
          description={
            language === 'ru'
              ? 'Завершите тренировку, чтобы увидеть аналитику'
              : 'Complete workouts to see analytics'
          }
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Create Workout Sheet ====================

function CreateWorkoutSheet({
  open,
  onClose,
  language,
  accentColor,
  selectedDate,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
  selectedDate: string;
}) {
  const createWorkout = useTrainingStore((s) => s.createWorkout);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('strength');
  const [note, setNote] = useState('');
  const [exercises, setExercises] = useState<CreateExerciseData[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // New exercise form state
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('');
  const [newExReps, setNewExReps] = useState('');
  const [newExWeight, setNewExWeight] = useState('');
  const [newExDuration, setNewExDuration] = useState('');
  const [newExIsPR, setNewExIsPR] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setDuration('');
    setType('strength');
    setNote('');
    setExercises([]);
    setNewExName('');
    setNewExSets('');
    setNewExReps('');
    setNewExWeight('');
    setNewExDuration('');
    setNewExIsPR(false);
  }, []);

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    setExercises([
      ...exercises,
      {
        name: newExName.trim(),
        sets: parseInt(newExSets) || 0,
        reps: parseInt(newExReps) || 0,
        weight: parseFloat(newExWeight) || 0,
        duration: parseInt(newExDuration) || 0,
        isPR: newExIsPR,
      },
    ]);
    setNewExName('');
    setNewExSets('');
    setNewExReps('');
    setNewExWeight('');
    setNewExDuration('');
    setNewExIsPR(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    await createWorkout({
      date: selectedDate,
      name: name.trim(),
      duration: parseInt(duration) || 0,
      type,
      note: note.trim() || undefined,
      exercises,
    });
    resetForm();
    setIsCreating(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Новая тренировка' : 'New Workout'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Type Selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Тип тренировки' : 'Workout Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    type === t.id
                      ? 'border-2'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                  style={
                    type === t.id
                      ? { backgroundColor: `${accentColor}10`, borderColor: `${accentColor}40`, color: accentColor }
                      : {}
                  }
                >
                  <span>{t.emoji}</span>
                  {language === 'ru' ? t.labelRu : t.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Название' : 'Name'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                language === 'ru'
                  ? 'Напр: Жим лёжа, Кардио день'
                  : 'e.g. Bench Press Day, Cardio'
              }
              autoFocus
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Длительность (мин)' : 'Duration (min)'}
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Заметка (необязательно)' : 'Note (optional)'}
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ru' ? 'Как прошла тренировка?' : 'How was the workout?'}
            />
          </div>

          {/* Exercises */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Упражнения' : 'Exercises'} ({exercises.length})
            </label>

            {/* Added exercises list */}
            {exercises.length > 0 && (
              <div className="space-y-2 mb-3">
                {exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate">{ex.name}</p>
                        {ex.isPR && (
                          <span
                            className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded shrink-0"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                          >
                            PR
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {(ex.sets ?? 0) > 0 ? `${ex.sets}×${ex.reps ?? 0}` : ''}
                        {ex.weight ? ` @${ex.weight}kg` : ''}
                        {ex.duration ? ` ${ex.duration}s` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExercise(i)}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add exercise form */}
            <div className="space-y-2 rounded-xl border border-dashed p-3">
              <Input
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                placeholder={language === 'ru' ? 'Название упражнения' : 'Exercise name'}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={newExSets}
                  onChange={(e) => setNewExSets(e.target.value)}
                  placeholder={language === 'ru' ? 'Подходы' : 'Sets'}
                />
                <Input
                  type="number"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                  placeholder={language === 'ru' ? 'Повтор.' : 'Reps'}
                />
                <Input
                  type="number"
                  value={newExWeight}
                  onChange={(e) => setNewExWeight(e.target.value)}
                  placeholder="kg"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={newExDuration}
                    onChange={(e) => setNewExDuration(e.target.value)}
                    placeholder={language === 'ru' ? 'Время (сек)' : 'Time (sec)'}
                  />
                </div>
                <button
                  onClick={() => setNewExIsPR(!newExIsPR)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    newExIsPR
                      ? 'bg-amber-500/10 text-amber-600 border-2 border-amber-500/30'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                >
                  <Trophy className="h-3 w-3" />
                  PR
                </button>
              </div>
              <Button
                onClick={handleAddExercise}
                disabled={!newExName.trim()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {language === 'ru' ? 'Добавить упражнение' : 'Add Exercise'}
              </Button>
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Создание...' : 'Creating...'
              : language === 'ru' ? 'Создать тренировку' : 'Create Workout'}
          </Button>

          {/* XP Info */}
          <div className="text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">
              +15 XP {language === 'ru' ? 'сила' : 'strength'} — {language === 'ru' ? 'тренировка завершена' : 'workout complete'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              +25 XP {language === 'ru' ? 'сила' : 'strength'} — {language === 'ru' ? 'личный рекорд' : 'personal record'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
