'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Plus,
  Ruler,
  Moon,
  Target,
  TrendingUp,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import {
  useHealthStore,
  type BodyMeasurement,
  type WellbeingLog,
  type HealthGoal,
} from '@/store/health-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

// ==================== Helpers ====================

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MOODS = [
  { id: 'great', emoji: '😄', labelEn: 'Great', labelRu: 'Отлично' },
  { id: 'good', emoji: '🙂', labelEn: 'Good', labelRu: 'Хорошо' },
  { id: 'neutral', emoji: '😐', labelEn: 'Neutral', labelRu: 'Нормально' },
  { id: 'bad', emoji: '😟', labelEn: 'Bad', labelRu: 'Плохо' },
  { id: 'terrible', emoji: '😢', labelEn: 'Terrible', labelRu: 'Ужасно' },
];

const SYMPTOMS_EN = ['Headache', 'Fatigue', 'Sore throat', 'Cough', 'Fever', 'Nausea', 'Dizziness', 'Back pain', 'Stomach ache', 'Insomnia'];
const SYMPTOMS_RU = ['Головная боль', 'Усталость', 'Боль в горле', 'Кашель', 'Температура', 'Тошнота', 'Головокружение', 'Боль в спине', 'Боль в животе', 'Бессонница'];

const GOAL_TYPES = [
  { id: 'weight', labelEn: 'Weight (kg)', labelRu: 'Вес (кг)', icon: '⚖️' },
  { id: 'body_fat', labelEn: 'Body Fat (%)', labelRu: 'Жир (%)', icon: '📊' },
  { id: 'waist', labelEn: 'Waist (cm)', labelRu: 'Талия (см)', icon: '📏' },
  { id: 'sleep', labelEn: 'Sleep (hours)', labelRu: 'Сон (часы)', icon: '😴' },
  { id: 'energy', labelEn: 'Energy (1-10)', labelRu: 'Энергия (1-10)', icon: '⚡' },
  { id: 'stress', labelEn: 'Stress (1-10)', labelRu: 'Стресс (1-10)', icon: '🧘' },
];

const MOOD_COLORS: Record<string, string> = {
  great: '#22c55e',
  good: '#84cc16',
  neutral: '#eab308',
  bad: '#f97316',
  terrible: '#ef4444',
};

// ==================== Main Page ====================

export function HealthPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.health;
  const { selectedDate, loadMeasurements, loadWellbeing, loadGoals } = useHealthStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);
  const measurements = useHealthStore((s) => s.measurements);
  const wellbeingLogs = useHealthStore((s) => s.wellbeingLogs);

  const [activeTab, setActiveTab] = useState('measurements');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [sheetType, setSheetType] = useState<'measurement' | 'wellbeing' | 'goal'>('measurement');

  useEffect(() => {
    const dateFrom = getDateDaysAgo(90);
    const dateTo = getTodayString();
    loadMeasurements(dateFrom, dateTo);
    loadWellbeing(dateFrom, dateTo);
    loadGoals();
  }, [loadMeasurements, loadWellbeing, loadGoals]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const openSheet = (type: 'measurement' | 'wellbeing' | 'goal') => {
    setSheetType(type);
    setShowCreateSheet(true);
  };

  const tabs: TabItem[] = [
    { id: 'measurements', label: language === 'ru' ? 'Замеры' : 'Measurements' },
    { id: 'wellbeing', label: language === 'ru' ? 'Самочувствие' : 'Wellbeing' },
    { id: 'goals', label: language === 'ru' ? 'Цели' : 'Goals' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  const totalLogs = measurements.length + wellbeingLogs.length;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Здоровье' : 'Health'}
        icon={Heart}
        accentColor={config.accentColor}
        subtitle={
          totalLogs > 0
            ? `${totalLogs} ${language === 'ru' ? 'записей' : 'entries logged'}`
            : undefined
        }
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <ModuleTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor={config.accentColor}
        />

        {activeTab === 'measurements' && (
          <MeasurementsTab
            language={language}
            accentColor={config.accentColor}
            onAdd={() => openSheet('measurement')}
          />
        )}
        {activeTab === 'wellbeing' && (
          <WellbeingTab
            language={language}
            accentColor={config.accentColor}
            onAdd={() => openSheet('wellbeing')}
          />
        )}
        {activeTab === 'goals' && (
          <GoalsTab
            language={language}
            accentColor={config.accentColor}
            onAdd={() => openSheet('goal')}
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
        onClick={() => {
          if (activeTab === 'wellbeing') openSheet('wellbeing');
          else if (activeTab === 'goals') openSheet('goal');
          else openSheet('measurement');
        }}
      />

      <CreateSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        type={sheetType}
        language={language}
        accentColor={config.accentColor}
      />
    </div>
  );
}

// ==================== Measurements Tab ====================

function MeasurementsTab({
  language,
  accentColor,
  onAdd,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  onAdd: () => void;
}) {
  const measurements = useHealthStore((s) => s.measurements);
  const deleteMeasurement = useHealthStore((s) => s.deleteMeasurement);

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  // Weight trend data (last 30 days)
  const weightData = measurements
    .filter((m) => m.weight !== null)
    .slice(0, 30)
    .reverse()
    .map((m) => ({ date: m.date.slice(5), weight: m.weight }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Today's Quick Stats */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {language === 'ru' ? 'Последние замеры' : 'Latest Measurements'}
          </span>
          <button
            onClick={onAdd}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            style={{ color: accentColor }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {latestMeasurement ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: language === 'ru' ? 'Вес' : 'Weight', value: latestMeasurement.weight, unit: 'кг' },
              { label: language === 'ru' ? 'Талия' : 'Waist', value: latestMeasurement.waist, unit: 'см' },
              { label: language === 'ru' ? 'Жир' : 'Body Fat', value: latestMeasurement.bodyFat, unit: '%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>
                  {stat.value ?? '—'}
                </p>
                {stat.value !== null && (
                  <p className="text-[10px] text-muted-foreground">{stat.unit}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === 'ru' ? 'Нет замеров. Добавьте первый!' : 'No measurements yet. Add your first!'}
          </p>
        )}
      </div>

      {/* Weight Trend Mini Chart */}
      {weightData.length >= 2 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Тренд веса' : 'Weight Trend'}
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={accentColor}
                  strokeWidth={2}
                  dot={{ fill: accentColor, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Measurements List */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-3 border-b">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Последние замеры' : 'Recent Measurements'}
          </span>
        </div>
        {measurements.length > 0 ? (
          <div className="divide-y max-h-96 overflow-y-auto">
            {measurements.slice(0, 20).map((m) => (
              <MeasurementCard
                key={m.id}
                measurement={m}
                language={language}
                accentColor={accentColor}
                onDelete={() => deleteMeasurement(m.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Ruler}
            title={language === 'ru' ? 'Нет замеров' : 'No measurements'}
            description={language === 'ru' ? 'Добавьте замеры тела для отслеживания' : 'Add body measurements to track progress'}
            accentColor={accentColor}
          />
        )}
      </div>
    </motion.div>
  );
}

// ==================== Measurement Card ====================

function MeasurementCard({
  measurement,
  language,
  accentColor,
  onDelete,
}: {
  measurement: BodyMeasurement;
  language: 'en' | 'ru';
  accentColor: string;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  const fields: string[] = [];
  if (measurement.weight !== null) fields.push(`${measurement.weight} ${language === 'ru' ? 'кг' : 'kg'}`);
  if (measurement.waist !== null) fields.push(`${measurement.waist} см`);
  if (measurement.bodyFat !== null) fields.push(`${measurement.bodyFat}%`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <Ruler className="h-4 w-4" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{measurement.date}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {fields.map((f) => (
            <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0">
              {f}
            </Badge>
          ))}
          {measurement.note && (
            <span className="text-[10px] text-muted-foreground truncate">{measurement.note}</span>
          )}
        </div>
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

// ==================== Wellbeing Tab ====================

function WellbeingTab({
  language,
  accentColor,
  onAdd,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  onAdd: () => void;
}) {
  const wellbeingLogs = useHealthStore((s) => s.wellbeingLogs);
  const deleteWellbeing = useHealthStore((s) => s.deleteWellbeing);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Quick Log Button */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {language === 'ru' ? 'Как вы себя чувствуете?' : 'How are you feeling?'}
          </span>
        </div>
        {/* Mood Quick Select */}
        <div className="flex justify-between">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={onAdd}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[9px] text-muted-foreground">
                {language === 'ru' ? mood.labelRu : mood.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Wellbeing Logs */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-3 border-b">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Последние записи' : 'Recent Logs'}
          </span>
        </div>
        {wellbeingLogs.length > 0 ? (
          <div className="divide-y max-h-96 overflow-y-auto">
            {wellbeingLogs.slice(0, 20).map((log) => (
              <WellbeingCard
                key={log.id}
                log={log}
                language={language}
                accentColor={accentColor}
                onDelete={() => deleteWellbeing(log.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Moon}
            title={language === 'ru' ? 'Нет записей' : 'No wellbeing logs'}
            description={language === 'ru' ? 'Отслеживайте настроение и самочувствие' : 'Track your mood and wellbeing'}
            accentColor={accentColor}
          />
        )}
      </div>
    </motion.div>
  );
}

// ==================== Wellbeing Card ====================

function WellbeingCard({
  log,
  language,
  accentColor,
  onDelete,
}: {
  log: WellbeingLog;
  language: 'en' | 'ru';
  accentColor: string;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const moodInfo = MOODS.find((m) => m.id === log.mood);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        {moodInfo?.emoji ?? '📝'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{log.date}</span>
          {log.mood && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{ backgroundColor: `${MOOD_COLORS[log.mood]}20`, color: MOOD_COLORS[log.mood] }}
            >
              {language === 'ru' ? MOODS.find((m) => m.id === log.mood)?.labelRu : MOODS.find((m) => m.id === log.mood)?.labelEn}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {log.energy !== null && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              ⚡ {log.energy}/10
            </Badge>
          )}
          {log.sleepHours !== null && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              😴 {log.sleepHours}ч
            </Badge>
          )}
          {log.stress !== null && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              🧘 {log.stress}/10
            </Badge>
          )}
        </div>
        {log.note && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{log.note}</p>
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

// ==================== Goals Tab ====================

function GoalsTab({
  language,
  accentColor,
  onAdd,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  onAdd: () => void;
}) {
  const goals = useHealthStore((s) => s.goals);
  const updateGoal = useHealthStore((s) => s.updateGoal);
  const deleteGoal = useHealthStore((s) => s.deleteGoal);

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Active Goals */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Активные цели' : 'Active Goals'}
          </span>
          <button
            onClick={onAdd}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            style={{ color: accentColor }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {activeGoals.length > 0 ? (
          <div className="divide-y">
            {activeGoals.map((goal) => {
              const goalType = GOAL_TYPES.find((gt) => gt.id === goal.type);
              const progress = goal.currentValue !== null
                ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
                : 0;

              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  goalType={goalType}
                  progress={progress}
                  language={language}
                  accentColor={accentColor}
                  onComplete={() => updateGoal(goal.id, { isCompleted: true, currentValue: goal.targetValue })}
                  onDelete={() => deleteGoal(goal.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon={Target}
              title={language === 'ru' ? 'Нет активных целей' : 'No active goals'}
              description={language === 'ru' ? 'Поставьте цель для отслеживания прогресса' : 'Set a goal to track your progress'}
              accentColor={accentColor}
            />
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-3 border-b">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {language === 'ru' ? 'Достигнутые цели' : 'Completed Goals'} ✅
            </span>
          </div>
          <div className="divide-y">
            {completedGoals.map((goal) => {
              const goalType = GOAL_TYPES.find((gt) => gt.id === goal.type);
              return (
                <div key={goal.id} className="flex items-center gap-3 p-3 opacity-60">
                  <span className="text-lg">{goalType?.icon ?? '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-through">
                      {goalType ? (language === 'ru' ? goalType.labelRu : goalType.labelEn) : goal.type}: {goal.targetValue}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ==================== Goal Card ====================

function GoalCard({
  goal,
  goalType,
  progress,
  language,
  accentColor,
  onComplete,
  onDelete,
}: {
  goal: HealthGoal;
  goalType: typeof GOAL_TYPES[number] | undefined;
  progress: number;
  language: 'en' | 'ru';
  accentColor: string;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{goalType?.icon ?? '🎯'}</span>
          <div>
            <p className="text-sm font-medium">
              {goalType ? (language === 'ru' ? goalType.labelRu : goalType.labelEn) : goal.type}
            </p>
            {goal.deadline && (
              <p className="text-[10px] text-muted-foreground">
                {language === 'ru' ? 'Дедлайн' : 'Deadline'}: {goal.deadline}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: accentColor }}>
            {goal.currentValue ?? 0}/{goal.targetValue}
          </span>
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </button>
          {showDelete && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={onDelete}
              className="p-1 rounded-lg bg-destructive/10"
            >
              <X className="h-3 w-3 text-destructive" />
            </motion.button>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      {progress >= 100 && (
        <Button
          size="sm"
          className="w-full text-xs"
          style={{ backgroundColor: accentColor }}
          onClick={onComplete}
        >
          {language === 'ru' ? 'Отметить выполненной' : 'Mark Complete'} ✅
        </Button>
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
  const measurements = useHealthStore((s) => s.measurements);
  const wellbeingLogs = useHealthStore((s) => s.wellbeingLogs);

  // Weight chart (last 90 days)
  const weightChartData = measurements
    .filter((m) => m.weight !== null)
    .slice(0, 90)
    .reverse()
    .map((m) => ({ date: m.date.slice(5), weight: m.weight }));

  // Mood distribution
  const moodCounts: Record<string, number> = {};
  for (const log of wellbeingLogs) {
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
  }
  const moodChartData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: language === 'ru' ? MOODS.find((m) => m.id === mood)?.labelRu ?? mood : mood,
    value: count,
    color: MOOD_COLORS[mood] || '#888',
  }));

  // Sleep average
  const sleepLogs = wellbeingLogs.filter((l) => l.sleepHours !== null);
  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((sum, l) => sum + (l.sleepHours ?? 0), 0) / sleepLogs.length
    : 0;

  // Energy trend
  const energyData = wellbeingLogs
    .filter((l) => l.energy !== null)
    .slice(0, 30)
    .reverse()
    .map((l) => ({ date: l.date.slice(5), energy: l.energy }));

  // Stats
  const stats = [
    {
      label: language === 'ru' ? 'Замеров' : 'Measurements',
      value: measurements.length,
      icon: '📏',
    },
    {
      label: language === 'ru' ? 'Средний сон' : 'Avg Sleep',
      value: avgSleep > 0 ? `${avgSleep.toFixed(1)}ч` : '—',
      icon: '😴',
    },
    {
      label: language === 'ru' ? 'Записей настроения' : 'Mood Logs',
      value: wellbeingLogs.filter((l) => l.mood).length,
      icon: '😊',
    },
    {
      label: language === 'ru' ? 'Средняя энергия' : 'Avg Energy',
      value: wellbeingLogs.filter((l) => l.energy !== null).length > 0
        ? (wellbeingLogs.filter((l) => l.energy !== null).reduce((s, l) => s + (l.energy ?? 0), 0) / wellbeingLogs.filter((l) => l.energy !== null).length).toFixed(1)
        : '—',
      icon: '⚡',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
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

      {/* Weight Chart */}
      {weightChartData.length >= 2 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Тренд веса (90 дней)' : 'Weight Trend (90 days)'}
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={accentColor}
                  strokeWidth={2}
                  dot={{ fill: accentColor, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      {moodChartData.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Распределение настроения' : 'Mood Distribution'}
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {moodChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {moodChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Trend */}
      {energyData.length >= 2 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Тренд энергии' : 'Energy Trend'}
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="energy" fill={accentColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {weightChartData.length < 2 && moodChartData.length === 0 && energyData.length < 2 && (
        <EmptyState
          icon={TrendingUp}
          title={language === 'ru' ? 'Недостаточно данных' : 'Not enough data'}
          description={language === 'ru' ? 'Добавляйте замеры и записи самочувствия для аналитики' : 'Add measurements and wellbeing logs for analytics'}
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Create Sheet ====================

function CreateSheet({
  open,
  onClose,
  type,
  language,
  accentColor,
}: {
  open: boolean;
  type: 'measurement' | 'wellbeing' | 'goal';
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  if (type === 'measurement') {
    return <CreateMeasurementSheet open={open} onClose={onClose} language={language} accentColor={accentColor} />;
  }
  if (type === 'wellbeing') {
    return <CreateWellbeingSheet open={open} onClose={onClose} language={language} accentColor={accentColor} />;
  }
  return <CreateGoalSheet open={open} onClose={onClose} language={language} accentColor={accentColor} />;
}

// ==================== Create Measurement Sheet ====================

function CreateMeasurementSheet({
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
  const addMeasurement = useHealthStore((s) => s.addMeasurement);
  const selectedDate = useHealthStore((s) => s.selectedDate);
  const [date, setDate] = useState(getTodayString());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [hips, setHips] = useState('');
  const [bicep, setBicep] = useState('');
  const [thigh, setThigh] = useState('');
  const [neck, setNeck] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [note, setNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await addMeasurement({
      date,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      waist: waist ? parseFloat(waist) : null,
      chest: chest ? parseFloat(chest) : null,
      hips: hips ? parseFloat(hips) : null,
      bicep: bicep ? parseFloat(bicep) : null,
      thigh: thigh ? parseFloat(thigh) : null,
      neck: neck ? parseFloat(neck) : null,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      note: note.trim() || null,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setWeight(''); setHeight(''); setWaist(''); setChest('');
    setHips(''); setBicep(''); setThigh(''); setNeck('');
    setBodyFat(''); setNote(''); setIsCreating(false);
  };

  const fields = [
    { key: 'weight', label: language === 'ru' ? 'Вес (кг)' : 'Weight (kg)', value: weight, set: setWeight },
    { key: 'height', label: language === 'ru' ? 'Рост (см)' : 'Height (cm)', value: height, set: setHeight },
    { key: 'waist', label: language === 'ru' ? 'Талия (см)' : 'Waist (cm)', value: waist, set: setWaist },
    { key: 'chest', label: language === 'ru' ? 'Грудь (см)' : 'Chest (cm)', value: chest, set: setChest },
    { key: 'hips', label: language === 'ru' ? 'Бёдра (см)' : 'Hips (cm)', value: hips, set: setHips },
    { key: 'bicep', label: language === 'ru' ? 'Бицепс (см)' : 'Bicep (cm)', value: bicep, set: setBicep },
    { key: 'thigh', label: language === 'ru' ? 'Бедро (см)' : 'Thigh (cm)', value: thigh, set: setThigh },
    { key: 'neck', label: language === 'ru' ? 'Шея (см)' : 'Neck (cm)', value: neck, set: setNeck },
    { key: 'bodyFat', label: language === 'ru' ? 'Жир (%)' : 'Body Fat (%)', value: bodyFat, set: setBodyFat },
  ];

  const hasData = fields.some((f) => f.value !== '');

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Добавить замеры' : 'Add Measurements'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4 overflow-y-auto max-h-[70vh]">
          {/* Date */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Дата' : 'Date'}
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Measurement Fields Grid */}
          <div className="grid grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder="—"
                  min={0}
                  step={0.1}
                />
              </div>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Заметка' : 'Note'}
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ru' ? 'Необязательно' : 'Optional'}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!hasData || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Сохранение...' : 'Saving...'
              : language === 'ru' ? 'Сохранить замеры' : 'Save Measurements'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== Create Wellbeing Sheet ====================

function CreateWellbeingSheet({
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
  const addWellbeing = useHealthStore((s) => s.addWellbeing);
  const [date, setDate] = useState(getTodayString());
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(5);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [stress, setStress] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const symptoms = language === 'ru' ? SYMPTOMS_RU : SYMPTOMS_EN;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await addWellbeing({
      date,
      mood,
      energy,
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      sleepQuality,
      stress,
      symptoms: selectedSymptoms.length > 0 ? JSON.stringify(selectedSymptoms) : null,
      note: note.trim() || null,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setMood(null); setEnergy(5); setSleepHours('');
    setSleepQuality(3); setStress(5); setSelectedSymptoms([]);
    setNote(''); setIsCreating(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Записать самочувствие' : 'Log Wellbeing'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4 overflow-y-auto max-h-[70vh]">
          {/* Date */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Дата' : 'Date'}
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Настроение' : 'Mood'}
            </label>
            <div className="flex justify-between">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    mood === m.id
                      ? 'border-2 shadow-sm scale-105'
                      : 'border-2 border-transparent hover:bg-muted'
                  }`}
                  style={
                    mood === m.id
                      ? { backgroundColor: `${MOOD_COLORS[m.id]}15`, color: MOOD_COLORS[m.id], borderColor: `${MOOD_COLORS[m.id]}40` }
                      : undefined
                  }
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[9px] font-medium">
                    {language === 'ru' ? m.labelRu : m.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">
                {language === 'ru' ? 'Энергия' : 'Energy'}
              </label>
              <span className="text-sm font-bold" style={{ color: accentColor }}>{energy}/10</span>
            </div>
            <Slider
              value={[energy]}
              onValueChange={(v) => setEnergy(v[0])}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Sleep */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Сон (часы)' : 'Sleep (hours)'}
              </label>
              <Input
                type="number"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="7.5"
                min={0}
                max={24}
                step={0.5}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Качество сна' : 'Sleep Quality'}
              </label>
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSleepQuality(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-5 w-5 transition-colors ${
                        star <= sleepQuality ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stress Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">
                {language === 'ru' ? 'Стресс' : 'Stress'}
              </label>
              <span className="text-sm font-bold" style={{ color: stress > 6 ? '#ef4444' : stress > 3 ? '#eab308' : '#22c55e' }}>{stress}/10</span>
            </div>
            <Slider
              value={[stress]}
              onValueChange={(v) => setStress(v[0])}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Симптомы' : 'Symptoms'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? 'text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={
                    selectedSymptoms.includes(symptom)
                      ? { backgroundColor: accentColor }
                      : undefined
                  }
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Заметка' : 'Note'}
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ru' ? 'Как прошёл день?' : 'How was your day?'}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Сохранение...' : 'Saving...'
              : language === 'ru' ? 'Записать самочувствие' : 'Log Wellbeing'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== Create Goal Sheet ====================

function CreateGoalSheet({
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
  const addGoal = useHealthStore((s) => s.addGoal);
  const [goalType, setGoalType] = useState('weight');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!targetValue) return;
    setIsCreating(true);
    await addGoal({
      type: goalType,
      targetValue: parseFloat(targetValue),
      currentValue: currentValue ? parseFloat(currentValue) : null,
      deadline: deadline || null,
      isCompleted: false,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setGoalType('weight'); setTargetValue(''); setCurrentValue('');
    setDeadline(''); setIsCreating(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Добавить цель' : 'Add Goal'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Goal Type */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Тип цели' : 'Goal Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map((gt) => (
                <button
                  key={gt.id}
                  onClick={() => setGoalType(gt.id)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    goalType === gt.id
                      ? 'border-2 shadow-sm'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                  style={
                    goalType === gt.id
                      ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }
                      : undefined
                  }
                >
                  <span>{gt.icon}</span>
                  {language === 'ru' ? gt.labelRu : gt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Целевое значение' : 'Target Value'}
            </label>
            <Input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="0"
              min={0}
              step={0.1}
              autoFocus
            />
          </div>

          {/* Current Value */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Текущее значение (необязательно)' : 'Current Value (optional)'}
            </label>
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0"
              min={0}
              step={0.1}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Дедлайн (необязательно)' : 'Deadline (optional)'}
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!targetValue || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Создание...' : 'Creating...'
              : language === 'ru' ? 'Создать цель' : 'Create Goal'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
