'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Edit3, Flame, Trash2 } from 'lucide-react';
import { ANIMATION } from '@/lib/constants';
import { HABIT_COLORS, HABIT_ICONS } from '@/lib/habit-utils';
import { useHabitsStore, type Habit } from '@/store/habits-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function ProgressSummary({
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
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{language === 'ru' ? 'Прогресс за сегодня' : "Today's Progress"}</span>
        <span className="text-sm font-bold" style={{ color: accentColor }}>{completed}/{total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: accentColor }} />
      </div>
      {completed === total && total > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs font-medium" style={{ color: accentColor }}>
          {language === 'ru' ? '🎉 Все привычки выполнены! +30 XP' : '🎉 All habits done! +30 XP'}
        </motion.p>
      )}
    </motion.div>
  );
}

export function TodayTab({
  positiveHabits,
  negativeHabits,
  language,
}: {
  positiveHabits: Habit[];
  negativeHabits: Habit[];
  language: 'en' | 'ru';
}) {
  const toggleHabit = useHabitsStore((s) => s.toggleHabit);

  return (
    <motion.div key="today" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
      {positiveHabits.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Позитивные привычки' : 'Positive Habits'}</h3>
          {positiveHabits.map((habit, i) => <HabitCard key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} language={language} index={i} />)}
        </div>
      )}

      {negativeHabits.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Негативные привычки' : 'Negative Habits'}</h3>
          {negativeHabits.map((habit, i) => <HabitCard key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} language={language} index={i + positiveHabits.length} />)}
        </div>
      )}
    </motion.div>
  );
}

function HabitCard({ habit, onToggle, language, index }: { habit: Habit; onToggle: () => void; language: 'en' | 'ru'; index: number; }) {
  const isCompleted = habit.todayLog !== null;
  const isNegative = habit.type === 'negative';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }} className="group">
      <button onClick={onToggle} className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-all active:scale-[0.98] ${isCompleted ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all" style={{ backgroundColor: isCompleted ? habit.color : `${habit.color}15` }}>
          <span className={`text-base ${isCompleted ? 'grayscale-0 brightness-200 contrast-200' : ''}`}>{habit.icon}</span>
          {isCompleted && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className={`truncate text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{habit.name}</p>
          <div className="mt-0.5 flex items-center gap-2">
            {isNegative && <span className="rounded bg-red-500/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-500">{language === 'ru' ? 'Избегать' : 'Avoid'}</span>}
            {habit.currentStreak > 0 && <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-500"><Flame className="h-3 w-3" />{habit.currentStreak}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isCompleted && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[10px] font-bold text-primary">+XP</motion.span>}
          {habit.currentStreak > 0 && !isCompleted && <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-500"><Flame className="h-3 w-3" />{habit.currentStreak}d</span>}
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: habit.color }} />
        </div>
      </button>
    </motion.div>
  );
}

export function AllTab({ habits, language }: { habits: Habit[]; language: 'en' | 'ru'; }) {
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  return (
    <motion.div key="all" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2">
      {habits.map((habit, i) => (
        <motion.div key={habit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * ANIMATION.STAGGER_DELAY }} className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <span className="text-lg">{habit.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{habit.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: habit.type === 'positive' ? '#22c55e15' : '#ef444415', color: habit.type === 'positive' ? '#22c55e' : '#ef4444' }}>
                {habit.type === 'positive' ? (language === 'ru' ? 'Позитивная' : 'Positive') : (language === 'ru' ? 'Негативная' : 'Negative')}
              </span>
              {habit.currentStreak > 0 && <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-500"><Flame className="h-3 w-3" /> {habit.currentStreak}d</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditingHabit(habit)} className="rounded-lg p-1.5 transition-colors hover:bg-muted"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button onClick={() => deleteHabit(habit.id)} className="rounded-lg p-1.5 transition-colors hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button>
          </div>
        </motion.div>
      ))}

      <Sheet open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Редактировать привычку' : 'Edit Habit'}</SheetTitle></SheetHeader>
          {editingHabit && <EditHabitForm habit={editingHabit} onClose={() => setEditingHabit(null)} language={language} />}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

export function AnalyticsTab({ habits, language }: { habits: Habit[]; language: 'en' | 'ru'; }) {
  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
  const bestHabit = habits.find((h) => h.currentStreak === maxStreak);
  const completedToday = habits.filter((h) => h.todayLog !== null).length;

  const stats = [
    { label: language === 'ru' ? 'Всего привычек' : 'Total Habits', value: habits.length, icon: '📊' },
    { label: language === 'ru' ? 'Выполнено сегодня' : 'Done Today', value: completedToday, icon: '✅' },
    { label: language === 'ru' ? 'Сумма серий' : 'Total Streaks', value: totalStreak, icon: '🔥' },
    { label: language === 'ru' ? 'Лучшая серия' : 'Best Streak', value: maxStreak, icon: '🏆' },
  ];

  return (
    <motion.div key="analytics" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08, ...ANIMATION.SPRING_GENTLE }} className="rounded-xl border bg-card p-3 text-center">
            <span className="text-xl">{stat.icon}</span>
            <p className="mt-1 text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {bestHabit && maxStreak > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Лучшая привычка' : 'Best Habit'}</span>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl">{bestHabit.icon}</span>
            <div>
              <p className="text-sm font-medium">{bestHabit.name}</p>
              <p className="flex items-center gap-1 text-xs font-medium text-orange-500"><Flame className="h-3 w-3" /> {maxStreak} {language === 'ru' ? 'дней' : 'days'}</p>
            </div>
          </div>
        </div>
      )}

      {habits.length > 0 && (
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Серии' : 'Streaks'}</h4>
          {habits.filter((h) => h.currentStreak > 0).sort((a, b) => b.currentStreak - a.currentStreak).map((habit) => (
            <div key={habit.id} className="flex items-center gap-2">
              <span className="text-sm">{habit.icon}</span>
              <span className="flex-1 truncate text-xs">{habit.name}</span>
              <div className="flex items-center gap-1 text-xs font-medium text-orange-500"><Flame className="h-3 w-3" />{habit.currentStreak}</div>
            </div>
          ))}
          {habits.every((h) => h.currentStreak === 0) && <p className="py-2 text-center text-xs text-muted-foreground">{language === 'ru' ? 'Нет активных серий' : 'No active streaks'}</p>}
        </div>
      )}
    </motion.div>
  );
}

export function CreateHabitSheet({
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
    await createHabit({ name: name.trim(), description: description.trim() || undefined, icon: selectedIcon, color: selectedColor, type });
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
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Новая привычка' : 'New Habit'}</SheetTitle></SheetHeader>

        <div className="mt-4 space-y-5">
          <div className="flex gap-2">
            <button onClick={() => setType('positive')} className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${type === 'positive' ? 'border-2 border-green-500/30 bg-green-500/10 text-green-600' : 'border-2 border-transparent bg-muted text-muted-foreground'}`}>✅ {language === 'ru' ? 'Позитивная' : 'Positive'}</button>
            <button onClick={() => setType('negative')} className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${type === 'negative' ? 'border-2 border-red-500/30 bg-red-500/10 text-red-500' : 'border-2 border-transparent bg-muted text-muted-foreground'}`}>🚫 {language === 'ru' ? 'Негативная' : 'Negative'}</button>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'positive' ? (language === 'ru' ? 'Напр: Утренняя зарядка' : 'e.g. Morning workout') : (language === 'ru' ? 'Напр: Не курить' : 'e.g. No smoking')}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Описание (необязательно)' : 'Description (optional)'}</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === 'ru' ? 'Зачем эта привычка?' : 'Why this habit?'} />
          </div>

          <div>
            <label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Иконка' : 'Icon'}</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button key={icon} onClick={() => setSelectedIcon(icon)} className={`h-10 w-10 rounded-xl text-lg transition-all ${selectedIcon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}>{icon}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Цвет' : 'Color'}</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((color) => (
                <button key={color} onClick={() => setSelectedColor(color)} className={`h-8 w-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="w-full" style={{ backgroundColor: accentColor }}>
            {isCreating ? (language === 'ru' ? 'Создание...' : 'Creating...') : (language === 'ru' ? 'Создать привычку' : 'Create Habit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

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
    await updateHabit(habit.id, { name: name.trim(), icon: selectedIcon, color: selectedColor });
    onClose();
  };

  return (
    <div className="mt-4 space-y-5">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Иконка' : 'Icon'}</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICONS.map((icon) => (
            <button key={icon} onClick={() => setSelectedIcon(icon)} className={`h-10 w-10 rounded-xl text-lg transition-all ${selectedIcon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>{icon}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Цвет' : 'Color'}</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((color) => (
            <button key={color} onClick={() => setSelectedColor(color)} className={`h-8 w-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={!name.trim()} className="w-full">{language === 'ru' ? 'Сохранить' : 'Save'}</Button>
    </div>
  );
}
