'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Flame, Check, Trash2, Edit3, X, ChevronDown } from 'lucide-react';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION } from '@/lib/constants';
import { HABIT_ICONS, HABIT_COLORS, getTodayString } from '@/lib/habit-utils';
import { useSettingsStore } from '@/store/settings-store';
import { useHabitsStore, type Habit, type CreateHabitData } from '@/store/habits-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

export function HabitsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.habits;
  const { habits, isLoading, loadHabits } = useHabitsStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('today');
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Listen for gamification updates from other modules
  useEffect(() => {
    const handler = () => {
      loadCharacter();
    };
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const positiveHabits = habits.filter((h) => h.type === 'positive');
  const negativeHabits = habits.filter((h) => h.type === 'negative');
  const completedCount = positiveHabits.filter((h) => h.todayLog !== null).length;
  const totalCount = positiveHabits.length;

  const tabs: TabItem[] = [
    { id: 'today', label: language === 'ru' ? 'Сегодня' : 'Today' },
    { id: 'all', label: language === 'ru' ? 'Все' : 'All' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Привычки' : 'Habits'}
        icon={Target}
        accentColor={config.accentColor}
        subtitle={
          totalCount > 0
            ? `${completedCount}/${totalCount} ${language === 'ru' ? 'выполнено' : 'done'}`
            : undefined
        }
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={Target}
            title={language === 'ru' ? 'Нет привычек' : 'No habits yet'}
            description={
              language === 'ru'
                ? 'Добавьте первую привычку, чтобы начать отслеживание'
                : 'Add your first habit to start tracking'
            }
            accentColor={config.accentColor}
            actionLabel={language === 'ru' ? 'Добавить привычку' : 'Add habit'}
            onAction={() => setShowCreateSheet(true)}
          />
        ) : (
          <>
            {/* Progress Summary */}
            {totalCount > 0 && (
              <ProgressSummary
                completed={completedCount}
                total={totalCount}
                accentColor={config.accentColor}
                language={language}
              />
            )}

            <ModuleTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={config.accentColor}
            />

            <AnimatePresence mode="wait">
              {activeTab === 'today' && (
                <TodayTab
                  positiveHabits={positiveHabits}
                  negativeHabits={negativeHabits}
                  language={language}
                  accentColor={config.accentColor}
                />
              )}
              {activeTab === 'all' && (
                <AllTab
                  habits={habits}
                  language={language}
                  accentColor={config.accentColor}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab
                  habits={habits}
                  language={language}
                  accentColor={config.accentColor}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <FAB
        accentColor={config.accentColor}
        onClick={() => setShowCreateSheet(true)}
      />

      <CreateHabitSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        language={language}
        accentColor={config.accentColor}
      />
    </div>
  );
}

// ==================== Progress Summary ====================

function ProgressSummary({
  completed,
  total,
  accentColor,
  language,
}: {
  completed: number;
  total: number;
  accentColor: string;
  language: 'en' | 'ru';
}) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {language === 'ru' ? 'Прогресс за сегодня' : "Today's Progress"}
        </span>
        <span className="text-sm font-bold" style={{ color: accentColor }}>
          {completed}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      {completed === total && total > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium text-center"
          style={{ color: accentColor }}
        >
          {language === 'ru' ? '🎉 Все привычки выполнены! +30 XP' : '🎉 All habits done! +30 XP'}
        </motion.p>
      )}
    </motion.div>
  );
}

// ==================== Today Tab ====================

function TodayTab({
  positiveHabits,
  negativeHabits,
  language,
  accentColor,
}: {
  positiveHabits: Habit[];
  negativeHabits: Habit[];
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const toggleHabit = useHabitsStore((s) => s.toggleHabit);

  return (
    <motion.div
      key="today"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {positiveHabits.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {language === 'ru' ? 'Позитивные привычки' : 'Positive Habits'}
          </h3>
          {positiveHabits.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id)}
              language={language}
              index={i}
            />
          ))}
        </div>
      )}

      {negativeHabits.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {language === 'ru' ? 'Негативные привычки' : 'Negative Habits'}
          </h3>
          {negativeHabits.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id)}
              language={language}
              index={i + positiveHabits.length}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ==================== Habit Card ====================

function HabitCard({
  habit,
  onToggle,
  language,
  index,
}: {
  habit: Habit;
  onToggle: () => void;
  language: 'en' | 'ru';
  index: number;
}) {
  const isCompleted = habit.todayLog !== null;
  const isNegative = habit.type === 'negative';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }}
      className="group"
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-all active:scale-[0.98] ${
          isCompleted
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-card hover:bg-muted/50'
        }`}
      >
        {/* Completion Circle */}
        <div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all"
          style={{ backgroundColor: isCompleted ? habit.color : `${habit.color}15` }}
        >
          <span className={`text-base ${isCompleted ? 'grayscale-0 brightness-200 contrast-200' : ''}`}>
            {habit.icon}
          </span>
          {isCompleted && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {isNegative && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-red-500/10 text-red-500">
                {language === 'ru' ? 'Избегать' : 'Avoid'}
              </span>
            )}
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-medium">
                <Flame className="h-3 w-3" />
                {habit.currentStreak}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] font-bold text-primary"
            >
              +XP
            </motion.span>
          )}
          {habit.currentStreak > 0 && !isCompleted && (
            <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-medium">
              <Flame className="h-3 w-3" />{habit.currentStreak}d
            </span>
          )}
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
        </div>
      </button>
    </motion.div>
  );
}

// ==================== All Tab ====================

function AllTab({
  habits,
  language,
  accentColor,
}: {
  habits: Habit[];
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  return (
    <motion.div
      key="all"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-2"
    >
      {habits.map((habit, i) => (
        <motion.div
          key={habit.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * ANIMATION.STAGGER_DELAY }}
          className="flex items-center gap-3 rounded-xl border bg-card p-3"
        >
          <span className="text-lg">{habit.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{habit.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                style={{
                  backgroundColor: habit.type === 'positive' ? '#22c55e15' : '#ef444415',
                  color: habit.type === 'positive' ? '#22c55e' : '#ef4444',
                }}
              >
                {habit.type === 'positive'
                  ? language === 'ru' ? 'Позитивная' : 'Positive'
                  : language === 'ru' ? 'Негативная' : 'Negative'}
              </span>
              {habit.currentStreak > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-medium">
                  <Flame className="h-3 w-3" /> {habit.currentStreak}d
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingHabit(habit)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </motion.div>
      ))}

      {/* Edit Sheet */}
      <Sheet open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{language === 'ru' ? 'Редактировать привычку' : 'Edit Habit'}</SheetTitle>
          </SheetHeader>
          {editingHabit && (
            <EditHabitForm
              habit={editingHabit}
              onClose={() => setEditingHabit(null)}
              language={language}
            />
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

// ==================== Analytics Tab ====================

function AnalyticsTab({
  habits,
  language,
  accentColor,
}: {
  habits: Habit[];
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
  const bestHabit = habits.find((h) => h.currentStreak === maxStreak);
  const completedToday = habits.filter((h) => h.todayLog !== null).length;

  const stats = [
    {
      label: language === 'ru' ? 'Всего привычек' : 'Total Habits',
      value: habits.length,
      icon: '📊',
    },
    {
      label: language === 'ru' ? 'Выполнено сегодня' : 'Done Today',
      value: completedToday,
      icon: '✅',
    },
    {
      label: language === 'ru' ? 'Сумма серий' : 'Total Streaks',
      value: totalStreak,
      icon: '🔥',
    },
    {
      label: language === 'ru' ? 'Лучшая серия' : 'Best Streak',
      value: maxStreak,
      icon: '🏆',
    },
  ];

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
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

      {/* Best Habit */}
      {bestHabit && maxStreak > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Лучшая привычка' : 'Best Habit'}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl">{bestHabit.icon}</span>
            <div>
              <p className="text-sm font-medium">{bestHabit.name}</p>
              <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                <Flame className="h-3 w-3" /> {maxStreak} {language === 'ru' ? 'дней' : 'days'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Streak Leaderboard */}
      {habits.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Серии' : 'Streaks'}
          </h4>
          {habits
            .filter((h) => h.currentStreak > 0)
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .map((habit) => (
              <div key={habit.id} className="flex items-center gap-2">
                <span className="text-sm">{habit.icon}</span>
                <span className="text-xs flex-1 truncate">{habit.name}</span>
                <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                  <Flame className="h-3 w-3" />
                  {habit.currentStreak}
                </div>
              </div>
            ))}
          {habits.every((h) => h.currentStreak === 0) && (
            <p className="text-xs text-muted-foreground text-center py-2">
              {language === 'ru' ? 'Нет активных серий' : 'No active streaks'}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ==================== Create Habit Sheet ====================

function CreateHabitSheet({
  open,
  onClose,
  language,
  accentColor,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const createHabit = useHabitsStore((s) => s.createHabit);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#06b6d4');
  const [type, setType] = useState<'positive' | 'negative'>('positive');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    await createHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      icon: selectedIcon,
      color: selectedColor,
      type,
    });
    setName('');
    setDescription('');
    setSelectedIcon('🎯');
    setSelectedColor('#06b6d4');
    setType('positive');
    setIsCreating(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Новая привычка' : 'New Habit'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType('positive')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === 'positive'
                  ? 'bg-green-500/10 text-green-600 border-2 border-green-500/30'
                  : 'bg-muted text-muted-foreground border-2 border-transparent'
              }`}
            >
              ✅ {language === 'ru' ? 'Позитивная' : 'Positive'}
            </button>
            <button
              onClick={() => setType('negative')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === 'negative'
                  ? 'bg-red-500/10 text-red-500 border-2 border-red-500/30'
                  : 'bg-muted text-muted-foreground border-2 border-transparent'
              }`}
            >
              🚫 {language === 'ru' ? 'Негативная' : 'Negative'}
            </button>
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
                type === 'positive'
                  ? language === 'ru' ? 'Напр: Утренняя зарядка' : 'e.g. Morning workout'
                  : language === 'ru' ? 'Напр: Не курить' : 'e.g. No smoking'
              }
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Описание (необязательно)' : 'Description (optional)'}
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ru' ? 'Зачем эта привычка?' : 'Why this habit?'}
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Иконка' : 'Icon'}
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`h-10 w-10 rounded-xl text-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Цвет' : 'Color'}
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
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
              : language === 'ru' ? 'Создать привычку' : 'Create Habit'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== Edit Habit Form ====================

function EditHabitForm({
  habit,
  onClose,
  language,
}: {
  habit: Habit;
  onClose: () => void;
  language: 'en' | 'ru';
}) {
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const [name, setName] = useState(habit.name);
  const [selectedIcon, setSelectedIcon] = useState(habit.icon);
  const [selectedColor, setSelectedColor] = useState(habit.color);

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateHabit(habit.id, {
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    onClose();
  };

  return (
    <div className="space-y-5 mt-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          {language === 'ru' ? 'Название' : 'Name'}
        </label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          {language === 'ru' ? 'Иконка' : 'Icon'}
        </label>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => setSelectedIcon(icon)}
              className={`h-10 w-10 rounded-xl text-lg transition-all ${
                selectedIcon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          {language === 'ru' ? 'Цвет' : 'Color'}
        </label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`h-8 w-8 rounded-full transition-all ${
                selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={!name.trim()} className="w-full">
        {language === 'ru' ? 'Сохранить' : 'Save'}
      </Button>
    </div>
  );
}
