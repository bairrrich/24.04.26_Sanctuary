'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Apple,
  Plus,
  Droplets,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION, SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import {
  useNutritionStore,
  type MealEntry,
} from '@/store/nutrition-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

// ==================== Main Page ====================

export function NutritionPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.nutrition;
  const { isLoading, meals, selectedDate, loadDay } = useNutritionStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('diary');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<string | undefined>(undefined);

  const handleOpenCreateSheet = (mealType?: string) => {
    setDefaultMealType(mealType);
    setShowCreateSheet(true);
  };

  useEffect(() => {
    loadDay(selectedDate);
  }, [loadDay, selectedDate]);

  // Listen for gamification updates from other modules
  useEffect(() => {
    const handler = () => {
      loadCharacter();
    };
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'diary', label: language === 'ru' ? 'Дневник' : 'Diary' },
    { id: 'water', label: language === 'ru' ? 'Вода' : 'Water' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  const totalMeals = meals.length;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Питание' : 'Nutrition'}
        icon={Apple}
        accentColor={config.accentColor}
        subtitle={
          totalMeals > 0
            ? `${totalMeals} ${language === 'ru' ? 'приёмов пищи' : 'meals logged'}`
            : undefined
        }
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Date Navigation */}
            <DateNavigator
              selectedDate={selectedDate}
              onDateChange={(date) => useNutritionStore.getState().setSelectedDate(date)}
              language={language}
              accentColor={config.accentColor}
            />

            <ModuleTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={config.accentColor}
            />

            <AnimatePresence mode="wait">
              {activeTab === 'diary' && (
                <DiaryTab
                  language={language}
                  accentColor={config.accentColor}
                  onAddMeal={(mealType) => handleOpenCreateSheet(mealType)}
                />
              )}
              {activeTab === 'water' && (
                <WaterTab
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
            </AnimatePresence>
          </>
        )}
      </div>

      <FAB
        accentColor={config.accentColor}
        onClick={() => handleOpenCreateSheet()}
      />

      <CreateMealSheet
        open={showCreateSheet}
        onClose={() => { setShowCreateSheet(false); setDefaultMealType(undefined); }}
        language={language}
        accentColor={config.accentColor}
        defaultMealType={defaultMealType}
      />
    </div>
  );
}

// ==================== Date Navigator ====================

function DateNavigator({
  selectedDate,
  onDateChange,
  language,
  accentColor,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const navigateDate = (direction: -1 | 1) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  const goToToday = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    onDateChange(today);
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return language === 'ru' ? 'Сегодня' : 'Today';
    if (diff === -1) return language === 'ru' ? 'Вчера' : 'Yesterday';
    if (diff === 1) return language === 'ru' ? 'Завтра' : 'Tomorrow';

    const weekdays = language === 'ru'
      ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = language === 'ru'
      ? ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const isToday = (() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return selectedDate === today;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-2xl border bg-card p-3"
    >
      <button
        onClick={() => navigateDate(-1)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        onClick={goToToday}
        className="flex flex-col items-center"
      >
        <span className="text-sm font-medium">{formatDateLabel(selectedDate)}</span>
        {!isToday && (
          <span className="text-[10px] text-muted-foreground">
            {language === 'ru' ? 'нажмите: сегодня' : 'tap for today'}
          </span>
        )}
      </button>

      <button
        onClick={() => navigateDate(1)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ==================== Diary Tab ====================

function DiaryTab({
  language,
  accentColor,
  onAddMeal,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  onAddMeal: (mealType?: string) => void;
}) {
  const { meals, dailySummary, targets } = useNutritionStore();
  const deleteMeal = useNutritionStore((s) => s.deleteMeal);

  const mealTypes = [
    { id: 'breakfast', label: language === 'ru' ? 'Завтрак' : 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: language === 'ru' ? 'Обед' : 'Lunch', icon: '☀️' },
    { id: 'dinner', label: language === 'ru' ? 'Ужин' : 'Dinner', icon: '🌙' },
    { id: 'snack', label: language === 'ru' ? 'Перекус' : 'Snack', icon: '🍎' },
  ];

  const getMealsByType = (type: string) => meals.filter((m) => m.mealType === type);

  return (
    <motion.div
      key="diary"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {/* Daily Macro Summary */}
      <MacroSummaryCard
        summary={dailySummary}
        targets={targets}
        language={language}
        accentColor={accentColor}
      />

      {/* Meal Sections */}
      {mealTypes.map((mealType, i) => {
        const typeMeals = getMealsByType(mealType.id);
        const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

        return (
          <motion.div
            key={mealType.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * ANIMATION.STAGGER_DELAY }}
            className="rounded-2xl border bg-card overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-base">{mealType.icon}</span>
                <span className="text-sm font-medium">{mealType.label}</span>
                {typeCalories > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {typeCalories} {language === 'ru' ? 'ккал' : 'kcal'}
                  </span>
                )}
              </div>
              <button
                onClick={() => onAddMeal(mealType.id)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                style={{ color: accentColor }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Meal Entries */}
            {typeMeals.length > 0 ? (
              <div className="divide-y">
                {typeMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    language={language}
                    accentColor={accentColor}
                    onDelete={() => deleteMeal(meal.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {language === 'ru' ? 'Нет записей' : 'No entries'}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ==================== Macro Summary Card ====================

function MacroSummaryCard({
  summary,
  targets,
  language,
  accentColor,
}: {
  summary: { calories: number; protein: number; fat: number; carbs: number };
  targets: { calories: number; protein: number; fat: number; carbs: number };
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const macros = [
    { key: 'calories', label: language === 'ru' ? 'Калории' : 'Calories', value: summary.calories, target: targets.calories, unit: language === 'ru' ? 'ккал' : 'kcal', color: accentColor },
    { key: 'protein', label: language === 'ru' ? 'Белки' : 'Protein', value: Math.round(summary.protein), target: targets.protein, unit: 'г', color: '#ef4444' },
    { key: 'fat', label: language === 'ru' ? 'Жиры' : 'Fat', value: Math.round(summary.fat), target: targets.fat, unit: 'г', color: '#f59e0b' },
    { key: 'carbs', label: language === 'ru' ? 'Углеводы' : 'Carbs', value: Math.round(summary.carbs), target: targets.carbs, unit: 'г', color: '#3b82f6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-4 space-y-3"
    >
      {/* Calories highlight */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {language === 'ru' ? 'Дневная сводка' : 'Daily Summary'}
        </span>
        <span className="text-lg font-bold" style={{ color: accentColor }}>
          {summary.calories}
          <span className="text-xs font-normal text-muted-foreground ml-1">
            / {targets.calories} {language === 'ru' ? 'ккал' : 'kcal'}
          </span>
        </span>
      </div>

      {/* Macro bars */}
      <div className="grid grid-cols-3 gap-3">
        {macros.slice(1).map((macro) => {
          const percentage = macro.target > 0 ? Math.min(100, (macro.value / macro.target) * 100) : 0;

          return (
            <div key={macro.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">{macro.label}</span>
                <span className="text-[10px] font-bold" style={{ color: macro.color }}>
                  {macro.value}{macro.unit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ==================== Meal Card ====================

function MealCard({
  meal,
  language,
  accentColor,
  onDelete,
}: {
  meal: MealEntry;
  language: 'en' | 'ru';
  accentColor: string;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 p-3 group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{meal.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold" style={{ color: accentColor }}>
            {meal.calories} {language === 'ru' ? 'ккал' : 'kcal'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Б:{Math.round(meal.protein)} Ж:{Math.round(meal.fat)} У:{Math.round(meal.carbs)}
          </span>
        </div>
        {meal.note && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{meal.note}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setShowDelete(!showDelete)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {showDelete && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-destructive" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Water Tab ====================

function WaterTab({
  language,
  accentColor,
}: {
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const { waterEntries, totalWater, waterGoal } = useNutritionStore();
  const addWater = useNutritionStore((s) => s.addWater);
  const deleteWater = useNutritionStore((s) => s.deleteWater);

  const percentage = waterGoal > 0 ? Math.min(100, (totalWater / waterGoal) * 100) : 0;
  const isGoalMet = totalWater >= waterGoal;

  // Circle SVG parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      key="water"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {/* Circular Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-4"
      >
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke={accentColor}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className="h-6 w-6 mb-1" style={{ color: accentColor }} />
            <span className="text-2xl font-bold" style={{ color: accentColor }}>
              {totalWater}
            </span>
            <span className="text-xs text-muted-foreground">
              / {waterGoal} {language === 'ru' ? 'мл' : 'ml'}
            </span>
          </div>
        </div>

        {isGoalMet && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium mt-3"
            style={{ color: accentColor }}
          >
            🎉 {language === 'ru' ? 'Норма воды выполнена! +15 XP' : 'Water goal met! +15 XP'}
          </motion.p>
        )}
      </motion.div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2">
        {[
          { amount: 250, label: '+250' },
          { amount: 500, label: '+500' },
          { amount: 750, label: '+750' },
        ].map((btn) => (
          <Button
            key={btn.amount}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => addWater(btn.amount)}
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <Droplets className="h-3.5 w-3.5 mr-1" />
            {btn.label} {language === 'ru' ? 'мл' : 'ml'}
          </Button>
        ))}
      </div>

      {/* Custom Water Input */}
      <CustomWaterInput language={language} accentColor={accentColor} />

      {/* Water Entries List */}
      {waterEntries.length > 0 ? (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-3 border-b">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {language === 'ru' ? 'Сегодня' : 'Today'}
            </span>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {waterEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <Droplets className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {entry.amount} {language === 'ru' ? 'мл' : 'ml'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => deleteWater(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
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
          description={
            language === 'ru'
              ? 'Добавьте воду, чтобы отслеживать потребление'
              : 'Add water to track your intake'
          }
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Custom Water Input ====================

function CustomWaterInput({
  language,
  accentColor,
}: {
  language: 'en' | 'ru';
  accentColor: string;
}) {
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
      <Button
        onClick={handleAdd}
        disabled={!customAmount || parseInt(customAmount, 10) <= 0}
        size="sm"
        style={{ backgroundColor: accentColor }}
        className="text-white"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
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
  const { meals, dailySummary, targets } = useNutritionStore();

  // Weekly data - generate from last 7 days using meals data
  const weeklyData = (() => {
    const days: { date: string; label: string; calories: number; meals: number }[] = [];
    const dayLabels = language === 'ru'
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; // Monday = 0

      // For the currently selected date, use store data
      const isToday = dateStr === useNutritionStore.getState().selectedDate;
      const dayMeals = isToday ? meals : [];

      days.push({
        date: dateStr,
        label: dayLabels[dayIndex],
        calories: isToday ? dailySummary.calories : 0,
        meals: dayMeals.length,
      });
    }
    return days;
  })();

  const maxCalories = Math.max(targets.calories, ...weeklyData.map((d) => d.calories));

  // Stats
  const totalMealsLogged = meals.length;
  const avgCalories = meals.length > 0
    ? Math.round(meals.reduce((sum, m) => sum + m.calories, 0) / meals.length)
    : 0;
  const avgProtein = meals.length > 0
    ? Math.round(meals.reduce((sum, m) => sum + m.protein, 0) / meals.length)
    : 0;
  const avgFat = meals.length > 0
    ? Math.round(meals.reduce((sum, m) => sum + m.fat, 0) / meals.length)
    : 0;
  const avgCarbs = meals.length > 0
    ? Math.round(meals.reduce((sum, m) => sum + m.carbs, 0) / meals.length)
    : 0;

  const stats = [
    {
      label: language === 'ru' ? 'Приёмов пищи' : 'Meals Logged',
      value: totalMealsLogged,
      icon: '🍽️',
    },
    {
      label: language === 'ru' ? 'Средние калории' : 'Avg Calories',
      value: avgCalories,
      icon: '🔥',
    },
    {
      label: language === 'ru' ? 'Средний белок' : 'Avg Protein',
      value: `${avgProtein}г`,
      icon: '🥩',
    },
    {
      label: language === 'ru' ? 'Средние жиры' : 'Avg Fat',
      value: `${avgFat}г`,
      icon: '🥑',
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

      {/* Weekly Calorie Chart */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language === 'ru' ? 'Калории за неделю' : 'Weekly Calories'}
        </h4>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((day, i) => {
            const height = maxCalories > 0
              ? Math.max(4, (day.calories / maxCalories) * 100)
              : 4;
            const isToday = i === weeklyData.length - 1;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground">
                  {day.calories > 0 ? day.calories : ''}
                </span>
                <motion.div
                  initial={{ height: 4 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  className="w-full rounded-t-md min-h-1"
                  style={{
                    backgroundColor: isToday ? accentColor : `${accentColor}40`,
                  }}
                />
                <span
                  className={`text-[9px] ${isToday ? 'font-bold' : 'text-muted-foreground'}`}
                  style={isToday ? { color: accentColor } : undefined}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Target line indicator */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1" style={{ backgroundColor: `${accentColor}30` }} />
          <span className="text-[9px] text-muted-foreground">
            {language === 'ru' ? 'Цель' : 'Target'}: {targets.calories} {language === 'ru' ? 'ккал' : 'kcal'}
          </span>
        </div>
      </div>

      {/* Average Macros */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language === 'ru' ? 'Средние КБЖУ за день' : 'Average Daily Macros'}
        </h4>
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
                  <span className="text-xs" style={{ color: macro.color }}>
                    {macro.value}г / {macro.target}г
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ==================== Create Meal Sheet ====================

function CreateMealSheet({
  open,
  onClose,
  language,
  accentColor,
  defaultMealType,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
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

  const mealTypes = [
    { id: 'breakfast', label: language === 'ru' ? 'Завтрак' : 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: language === 'ru' ? 'Обед' : 'Lunch', icon: '☀️' },
    { id: 'dinner', label: language === 'ru' ? 'Ужин' : 'Dinner', icon: '🌙' },
    { id: 'snack', label: language === 'ru' ? 'Перекус' : 'Snack', icon: '🍎' },
  ];

  // Update meal type when defaultMealType prop changes
  if (defaultMealType && mealType !== defaultMealType) {
    setMealType(defaultMealType);
  }

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

    // Reset form
    setName('');
    setMealType('breakfast');
    setCalories('');
    setProtein('');
    setFat('');
    setCarbs('');
    setNote('');
    setIsCreating(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Добавить приём пищи' : 'Add Meal'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Meal Type Selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Тип приёма пищи' : 'Meal Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    mealType === type.id
                      ? 'border-2 shadow-sm'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                  style={
                    mealType === type.id
                      ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }
                      : undefined
                  }
                >
                  <span>{type.icon}</span>
                  {type.label}
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
                  ? 'Напр: Овсянка с ягодами'
                  : 'e.g. Oatmeal with berries'
              }
              autoFocus
            />
          </div>

          {/* Calories */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Калории (ккал)' : 'Calories (kcal)'}
            </label>
            <Input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Белки (г)' : 'Protein (g)'}
              </label>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Жиры (г)' : 'Fat (g)'}
              </label>
              <Input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Углеводы (г)' : 'Carbs (g)'}
              </label>
              <Input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Заметка (необязательно)' : 'Note (optional)'}
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ru' ? 'Дополнительная информация' : 'Additional notes'}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Добавление...' : 'Adding...'
              : language === 'ru' ? 'Добавить' : 'Add Meal'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
