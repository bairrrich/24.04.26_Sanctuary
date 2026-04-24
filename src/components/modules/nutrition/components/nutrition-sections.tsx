'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Droplets, Plus, Trash2, X } from 'lucide-react';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ANIMATION } from '@/lib/constants';
import { useNutritionStore, type MealEntry } from '@/store/nutrition-store';
import {
  DAY_LABELS,
  formatDateLabel,
  getTodayString,
  MEAL_TYPES,
  shiftDateByDays,
  WATER_PRESETS,
  type NutritionLanguage,
} from '../constants';

export function DateNavigator({
  selectedDate,
  onDateChange,
  language,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  language: NutritionLanguage;
}) {
  const isToday = selectedDate === getTodayString();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-2xl border bg-card p-3"
    >
      <button onClick={() => onDateChange(shiftDateByDays(selectedDate, -1))} className="rounded-lg p-1.5 transition-colors hover:bg-muted">
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button onClick={() => onDateChange(getTodayString())} className="flex flex-col items-center">
        <span className="text-sm font-medium">{formatDateLabel(selectedDate, language)}</span>
        {!isToday && <span className="text-[10px] text-muted-foreground">{language === 'ru' ? 'нажмите: сегодня' : 'tap for today'}</span>}
      </button>

      <button onClick={() => onDateChange(shiftDateByDays(selectedDate, 1))} className="rounded-lg p-1.5 transition-colors hover:bg-muted">
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function DiaryTab({
  language,
  accentColor,
  onAddMeal,
}: {
  language: NutritionLanguage;
  accentColor: string;
  onAddMeal: (mealType?: string) => void;
}) {
  const { meals, dailySummary, targets } = useNutritionStore();
  const deleteMeal = useNutritionStore((s) => s.deleteMeal);

  const getMealsByType = (type: string) => meals.filter((m) => m.mealType === type);

  return (
    <motion.div key="diary" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
      <MacroSummaryCard summary={dailySummary} targets={targets} language={language} accentColor={accentColor} />

      {MEAL_TYPES.map((mealType, i) => {
        const typeMeals = getMealsByType(mealType.id);
        const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

        return (
          <motion.div
            key={mealType.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * ANIMATION.STAGGER_DELAY }}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{mealType.icon}</span>
                <span className="text-sm font-medium">{language === 'ru' ? mealType.ru : mealType.en}</span>
                {typeCalories > 0 && <span className="text-xs text-muted-foreground">{typeCalories} {language === 'ru' ? 'ккал' : 'kcal'}</span>}
              </div>
              <button onClick={() => onAddMeal(mealType.id)} className="rounded-lg p-1.5 transition-colors hover:bg-muted" style={{ color: accentColor }}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {typeMeals.length > 0 ? (
              <div className="divide-y">
                {typeMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} language={language} accentColor={accentColor} onDelete={() => deleteMeal(meal.id)} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center"><p className="text-xs text-muted-foreground">{language === 'ru' ? 'Нет записей' : 'No entries'}</p></div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function MacroSummaryCard({
  summary,
  targets,
  language,
  accentColor,
}: {
  summary: { calories: number; protein: number; fat: number; carbs: number };
  targets: { calories: number; protein: number; fat: number; carbs: number };
  language: NutritionLanguage;
  accentColor: string;
}) {
  const macros = [
    { key: 'protein', label: language === 'ru' ? 'Белки' : 'Protein', value: Math.round(summary.protein), target: targets.protein, unit: 'г', color: '#ef4444' },
    { key: 'fat', label: language === 'ru' ? 'Жиры' : 'Fat', value: Math.round(summary.fat), target: targets.fat, unit: 'г', color: '#f59e0b' },
    { key: 'carbs', label: language === 'ru' ? 'Углеводы' : 'Carbs', value: Math.round(summary.carbs), target: targets.carbs, unit: 'г', color: '#3b82f6' },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{language === 'ru' ? 'Дневная сводка' : 'Daily Summary'}</span>
        <span className="text-lg font-bold" style={{ color: accentColor }}>
          {summary.calories}
          <span className="ml-1 text-xs font-normal text-muted-foreground">/ {targets.calories} {language === 'ru' ? 'ккал' : 'kcal'}</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {macros.map((macro) => {
          const percentage = macro.target > 0 ? Math.min(100, (macro.value / macro.target) * 100) : 0;

          return (
            <div key={macro.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">{macro.label}</span>
                <span className="text-[10px] font-bold" style={{ color: macro.color }}>{macro.value}{macro.unit}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: macro.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function MealCard({
  meal,
  language,
  accentColor,
  onDelete,
}: {
  meal: MealEntry;
  language: NutritionLanguage;
  accentColor: string;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="group flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{meal.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: accentColor }}>{meal.calories} {language === 'ru' ? 'ккал' : 'kcal'}</span>
          <span className="text-[10px] text-muted-foreground">Б:{Math.round(meal.protein)} Ж:{Math.round(meal.fat)} У:{Math.round(meal.carbs)}</span>
        </div>
        {meal.note && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{meal.note}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => setShowDelete(!showDelete)} className="rounded-lg p-1.5 transition-colors hover:bg-muted">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {showDelete && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={onDelete} className="rounded-lg bg-destructive/10 p-1.5 transition-colors hover:bg-destructive/20">
            <X className="h-3.5 w-3.5 text-destructive" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export function WaterTab({ language, accentColor }: { language: NutritionLanguage; accentColor: string }) {
  const { waterEntries, totalWater, waterGoal } = useNutritionStore();
  const addWater = useNutritionStore((s) => s.addWater);
  const deleteWater = useNutritionStore((s) => s.deleteWater);

  const percentage = waterGoal > 0 ? Math.min(100, (totalWater / waterGoal) * 100) : 0;
  const isGoalMet = totalWater >= waterGoal;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div key="water" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-4">
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90 transform">
            <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/30" />
            <motion.circle cx="100" cy="100" r={radius} stroke={accentColor} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className="mb-1 h-6 w-6" style={{ color: accentColor }} />
            <span className="text-2xl font-bold" style={{ color: accentColor }}>{totalWater}</span>
            <span className="text-xs text-muted-foreground">/ {waterGoal} {language === 'ru' ? 'мл' : 'ml'}</span>
          </div>
        </div>

        {isGoalMet && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm font-medium" style={{ color: accentColor }}>🎉 {language === 'ru' ? 'Норма воды выполнена! +15 XP' : 'Water goal met! +15 XP'}</motion.p>}
      </motion.div>

      <div className="flex gap-2">
        {WATER_PRESETS.map((amount) => (
          <Button key={amount} variant="outline" size="sm" className="flex-1" onClick={() => addWater(amount)} style={{ borderColor: accentColor, color: accentColor }}>
            <Droplets className="mr-1 h-3.5 w-3.5" />
            +{amount} {language === 'ru' ? 'мл' : 'ml'}
          </Button>
        ))}
      </div>

      <CustomWaterInput language={language} accentColor={accentColor} />

      {waterEntries.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="border-b p-3"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Сегодня' : 'Today'}</span></div>
          <div className="max-h-64 divide-y overflow-y-auto">
            {waterEntries.map((entry) => (
              <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                  <Droplets className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{entry.amount} {language === 'ru' ? 'мл' : 'ml'}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => deleteWater(entry.id)} className="rounded-lg p-1.5 transition-colors hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Droplets}
          title={language === 'ru' ? 'Нет записей' : 'No water entries'}
          description={language === 'ru' ? 'Добавьте воду, чтобы отслеживать потребление' : 'Add water to track your intake'}
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

function CustomWaterInput({ language, accentColor }: { language: NutritionLanguage; accentColor: string }) {
  const [customAmount, setCustomAmount] = useState('');
  const addWater = useNutritionStore((s) => s.addWater);

  const handleAdd = () => {
    const amount = parseInt(customAmount, 10);
    if (amount > 0) {
      addWater(amount);
      setCustomAmount('');
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        placeholder={language === 'ru' ? 'Другой объём (мл)' : 'Custom amount (ml)'}
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        className="flex-1"
        min={1}
      />
      <Button onClick={handleAdd} disabled={!customAmount || parseInt(customAmount, 10) <= 0} size="sm" style={{ backgroundColor: accentColor }} className="text-white">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AnalyticsTab({ language, accentColor }: { language: NutritionLanguage; accentColor: string }) {
  const { meals, dailySummary, targets, selectedDate } = useNutritionStore();

  const weeklyData = (() => {
    const days: { date: string; label: string; calories: number; meals: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const dateStr = shiftDateByDays(getTodayString(), -i);
      const d = new Date(`${dateStr}T00:00:00`);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
      const isSelectedDate = dateStr === selectedDate;

      days.push({
        date: dateStr,
        label: DAY_LABELS[language][dayIndex],
        calories: isSelectedDate ? dailySummary.calories : 0,
        meals: isSelectedDate ? meals.length : 0,
      });
    }

    return days;
  })();

  const maxCalories = Math.max(targets.calories, ...weeklyData.map((d) => d.calories));
  const totalMealsLogged = meals.length;
  const avgCalories = meals.length > 0 ? Math.round(meals.reduce((sum, m) => sum + m.calories, 0) / meals.length) : 0;
  const avgProtein = meals.length > 0 ? Math.round(meals.reduce((sum, m) => sum + m.protein, 0) / meals.length) : 0;
  const avgFat = meals.length > 0 ? Math.round(meals.reduce((sum, m) => sum + m.fat, 0) / meals.length) : 0;
  const avgCarbs = meals.length > 0 ? Math.round(meals.reduce((sum, m) => sum + m.carbs, 0) / meals.length) : 0;

  const stats = [
    { label: language === 'ru' ? 'Приёмов пищи' : 'Meals Logged', value: totalMealsLogged, icon: '🍽️' },
    { label: language === 'ru' ? 'Средние калории' : 'Avg Calories', value: avgCalories, icon: '🔥' },
    { label: language === 'ru' ? 'Средний белок' : 'Avg Protein', value: `${avgProtein}г`, icon: '🥩' },
    { label: language === 'ru' ? 'Средние жиры' : 'Avg Fat', value: `${avgFat}г`, icon: '🥑' },
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

      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Калории за неделю' : 'Weekly Calories'}</h4>
        <div className="flex h-32 items-end gap-2">
          {weeklyData.map((day, i) => {
            const height = maxCalories > 0 ? Math.max(4, (day.calories / maxCalories) * 100) : 4;
            const isToday = i === weeklyData.length - 1;

            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground">{day.calories > 0 ? day.calories : ''}</span>
                <motion.div initial={{ height: 4 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }} className="min-h-1 w-full rounded-t-md" style={{ backgroundColor: isToday ? accentColor : `${accentColor}40` }} />
                <span className={`text-[9px] ${isToday ? 'font-bold' : 'text-muted-foreground'}`} style={isToday ? { color: accentColor } : undefined}>{day.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-px flex-1" style={{ backgroundColor: `${accentColor}30` }} />
          <span className="text-[9px] text-muted-foreground">{language === 'ru' ? 'Цель' : 'Target'}: {targets.calories} {language === 'ru' ? 'ккал' : 'kcal'}</span>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Средние КБЖУ за день' : 'Average Daily Macros'}</h4>
        <div className="space-y-2">
          {[
            { label: language === 'ru' ? 'Белки' : 'Protein', value: avgProtein, target: targets.protein, color: '#ef4444' },
            { label: language === 'ru' ? 'Жиры' : 'Fat', value: avgFat, target: targets.fat, color: '#f59e0b' },
            { label: language === 'ru' ? 'Углеводы' : 'Carbs', value: avgCarbs, target: targets.carbs, color: '#3b82f6' },
          ].map((macro) => {
            const pct = macro.target > 0 ? Math.min(100, (macro.value / macro.target) * 100) : 0;

            return (
              <div key={macro.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{macro.label}</span>
                  <span className="text-xs" style={{ color: macro.color }}>{macro.value}г / {macro.target}г</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: macro.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function CreateMealSheet({
  open,
  onClose,
  language,
  accentColor,
  defaultMealType,
}: {
  open: boolean;
  onClose: () => void;
  language: NutritionLanguage;
  accentColor: string;
  defaultMealType?: string;
}) {
  const addMeal = useNutritionStore((s) => s.addMeal);
  const selectedDate = useNutritionStore((s) => s.selectedDate);
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState(defaultMealType || 'breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [note, setNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const resetForm = () => {
    setName('');
    setMealType(defaultMealType || 'breakfast');
    setCalories('');
    setProtein('');
    setFat('');
    setCarbs('');
    setNote('');
    setIsCreating(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);

    await addMeal({
      date: selectedDate,
      mealType,
      name: name.trim(),
      calories: parseInt(calories, 10) || 0,
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbs: parseFloat(carbs) || 0,
      note: note.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить приём пищи' : 'Add Meal'}</SheetTitle></SheetHeader>

        <div className="mt-4 space-y-5">
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Тип приёма пищи' : 'Meal Type'}</label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all ${mealType === type.id ? 'border-2 shadow-sm' : 'border-2 border-transparent bg-muted text-muted-foreground'}`}
                  style={mealType === type.id ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` } : undefined}
                >
                  <span>{type.icon}</span>
                  {language === 'ru' ? type.ru : type.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Name'}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={language === 'ru' ? 'Напр: Овсянка с ягодами' : 'e.g. Oatmeal with berries'} autoFocus />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Калории (ккал)' : 'Calories (kcal)'}</label>
            <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" min={0} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Белки (г)' : 'Protein (g)'}</label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" min={0} step={0.1} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Жиры (г)' : 'Fat (g)'}</label>
              <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" min={0} step={0.1} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Углеводы (г)' : 'Carbs (g)'}</label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" min={0} step={0.1} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Заметка (необязательно)' : 'Note (optional)'}</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={language === 'ru' ? 'Дополнительная информация' : 'Additional notes'} />
          </div>

          <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="w-full" style={{ backgroundColor: accentColor }}>
            {isCreating ? (language === 'ru' ? 'Добавление...' : 'Adding...') : (language === 'ru' ? 'Добавить' : 'Add Meal')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
