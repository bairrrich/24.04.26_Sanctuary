'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Trash2, X, Camera, CheckCircle2, Circle } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION, SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import {
  useLooksmaxxingStore,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  type Routine,
  type ProgressPhoto,
  type CreateRoutineData,
} from '@/store/looksmaxxing-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

// ==================== Helpers ====================

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

const CATEGORIES = [
  { id: 'skincare', icon: '🧴', en: 'Skincare', ru: 'Уход за кожей' },
  { id: 'grooming', icon: '💇', en: 'Grooming', ru: 'Груминг' },
  { id: 'style', icon: '👔', en: 'Style', ru: 'Стиль' },
  { id: 'fitness', icon: '💪', en: 'Fitness', ru: 'Фитнес' },
  { id: 'nutrition', icon: '🥗', en: 'Nutrition', ru: 'Питание' },
  { id: 'posture', icon: '🧘', en: 'Posture', ru: 'Осанка' },
  { id: 'other', icon: '✨', en: 'Other', ru: 'Другое' },
];

const PHOTO_CATEGORIES = [
  { id: 'face', en: 'Face', ru: 'Лицо' },
  { id: 'body', en: 'Body', ru: 'Тело' },
  { id: 'style', en: 'Style', ru: 'Стиль' },
  { id: 'other', en: 'Other', ru: 'Другое' },
];

const FREQUENCIES = [
  { id: 'daily', en: 'Daily', ru: 'Ежедневно' },
  { id: 'weekly', en: 'Weekly', ru: 'Еженедельно' },
  { id: 'custom', en: 'Custom', ru: 'Другое' },
];

const ICON_OPTIONS = ['✨', '🧴', '💇', '👔', '💪', '🥗', '🧘', '🪥', '💧', '🪒', '🧹', '💆', '🦷', '👀', '🎯', '⭐'];

// ==================== Main Page ====================

export function LooksmaxxingPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.looksmaxxing;
  const { routines, photos, loadRoutines, loadPhotos } = useLooksmaxxingStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('routines');
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [showCreatePhoto, setShowCreatePhoto] = useState(false);

  useEffect(() => { loadRoutines(); loadPhotos(); }, [loadRoutines, loadPhotos]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'routines', label: t(language, 'looksmaxxing.routines') },
    { id: 'today', label: t(language, 'looksmaxxing.today') },
    { id: 'photos', label: t(language, 'looksmaxxing.photos') },
    { id: 'analytics', label: t(language, 'common.analytics') },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t(language, 'modules.looksmaxxing')} icon={Sparkles} accentColor={config.accentColor}
        subtitle={routines.length > 0 ? `${routines.length} ${t(language, 'looksmaxxing.routinesCount')}` : undefined} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />
        {activeTab === 'routines' && <RoutinesTab language={language} accentColor={config.accentColor} onAdd={() => setShowCreateRoutine(true)} />}
        {activeTab === 'today' && <TodayTab language={language} accentColor={config.accentColor} />}
        {activeTab === 'photos' && <PhotosTab language={language} accentColor={config.accentColor} onAdd={() => setShowCreatePhoto(true)} />}
        {activeTab === 'analytics' && <AnalyticsTab language={language} accentColor={config.accentColor} />}
      </div>

      <FAB accentColor={config.accentColor} onClick={() => {
        if (activeTab === 'photos') setShowCreatePhoto(true);
        else setShowCreateRoutine(true);
      }} />

      <CreateRoutineSheet open={showCreateRoutine} onClose={() => setShowCreateRoutine(false)} language={language} accentColor={config.accentColor} />
      <CreatePhotoSheet open={showCreatePhoto} onClose={() => setShowCreatePhoto(false)} language={language} accentColor={config.accentColor} />
    </div>
  );
}

// ==================== Routines Tab ====================

function RoutinesTab({ language, accentColor, onAdd }: { language: 'en' | 'ru'; accentColor: string; onAdd: () => void }) {
  const routines = useLooksmaxxingStore((s) => s.routines);
  const deleteRoutine = useLooksmaxxingStore((s) => s.deleteRoutine);
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    routines: routines.filter((r) => r.category === cat.id),
  })).filter((g) => g.routines.length > 0);

  if (routines.length === 0) {
    return <EmptyState icon={Sparkles} title={t(language, 'looksmaxxing.noRoutines')} description={t(language, 'looksmaxxing.noRoutinesDesc')} accentColor={accentColor} />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {grouped.map((group) => (
        <div key={group.id} className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b" style={{ backgroundColor: `${CATEGORY_COLORS[group.id]}10` }}>
            <span className="text-base">{group.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: CATEGORY_COLORS[group.id] }}>
              {language === 'ru' ? group.ru : group.en}
            </span>
            <Badge variant="secondary" className="text-[10px] ml-auto px-1.5 py-0">{group.routines.length}</Badge>
          </div>
          <div className="divide-y">
            {group.routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} language={language} onDelete={() => deleteRoutine(routine.id)} />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ==================== Routine Card ====================

function RoutineCard({ routine, language, onDelete }: { routine: Routine; language: 'en' | 'ru'; onDelete: () => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const catColor = CATEGORY_COLORS[routine.category] || '#f59e0b';
  const freq = FREQUENCIES.find((f) => f.id === routine.frequency);

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: `${catColor}15` }}>
        {routine.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{routine.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
            {freq ? (language === 'ru' ? freq.ru : freq.en) : routine.frequency}
          </Badge>
          {routine.description && <span className="text-[10px] text-muted-foreground truncate">{routine.description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => setShowDelete(!showDelete)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {showDelete && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={onDelete}
            className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors">
            <X className="h-3.5 w-3.5 text-destructive" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Today Tab ====================

function TodayTab({ language, accentColor }: { language: 'en' | 'ru'; accentColor: string }) {
  const { routines, selectedDate, toggleRoutineLog, setSelectedDate } = useLooksmaxxingStore();
  const today = getTodayString();
  const date = selectedDate || today;
  const dailyRoutines = routines.filter((r) => r.frequency === 'daily');
  const completedToday = dailyRoutines.filter((r) => r.logs.some((l) => l.date === date));
  const completionPct = dailyRoutines.length > 0 ? Math.round((completedToday.length / dailyRoutines.length) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  useEffect(() => { setSelectedDate(today); }, [setSelectedDate, today]);

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Completion Ring */}
      <div className="rounded-2xl border bg-card p-4 flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--muted)" strokeWidth="6" />
            <circle cx="48" cy="48" r="40" fill="none" stroke={accentColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ color: accentColor }}>{completionPct}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{t(language, 'looksmaxxing.dailyProgress')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedToday.length} / {dailyRoutines.length} {t(language, 'looksmaxxing.completed')}
          </p>
          {completionPct === 100 && dailyRoutines.length > 0 && (
            <Badge className="mt-2 text-[10px]" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
              ✨ +{dailyRoutines.length * 8} XP
            </Badge>
          )}
        </div>
      </div>

      {/* Checklist */}
      {dailyRoutines.length > 0 ? (
        <div className="rounded-2xl border bg-card divide-y">
          {dailyRoutines.map((routine) => {
            const isCompleted = routine.logs.some((l) => l.date === date);
            const catColor = CATEGORY_COLORS[routine.category] || '#f59e0b';
            return (
              <button key={routine.id} onClick={() => toggleRoutineLog(routine.id, date)}
                className="flex items-center gap-3 p-3 w-full text-left hover:bg-muted/50 transition-colors">
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" style={{ color: catColor }} />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: `${catColor}15` }}>
                  {routine.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? 'line-through opacity-60' : ''}`}>{routine.name}</p>
                </div>
                {isCompleted && <Badge className="text-[10px] px-1.5 py-0 shrink-0" style={{ backgroundColor: `${catColor}15`, color: catColor }}>+8 XP</Badge>}
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Sparkles} title={t(language, 'looksmaxxing.noRoutines')} description={t(language, 'looksmaxxing.noRoutinesDesc')} accentColor={accentColor} />
      )}
    </motion.div>
  );
}

// ==================== Photos Tab ====================

function PhotosTab({ language, accentColor, onAdd }: { language: 'en' | 'ru'; accentColor: string; onAdd: () => void }) {
  const photos = useLooksmaxxingStore((s) => s.photos);
  const deletePhoto = useLooksmaxxingStore((s) => s.deletePhoto);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (photos.length === 0) {
    return <EmptyState icon={Camera} title={t(language, 'looksmaxxing.noPhotos')} description={t(language, 'looksmaxxing.noPhotosDesc')} accentColor={accentColor} />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => {
          const catColor = CATEGORY_COLORS[photo.category] || '#f59e0b';
          const catInfo = PHOTO_CATEGORIES.find((c) => c.id === photo.category);
          return (
            <motion.div key={photo.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border bg-card overflow-hidden relative group">
              <div className="aspect-square flex flex-col items-center justify-center gap-1" style={{ backgroundColor: `${catColor}15` }}>
                <span className="text-3xl">{CATEGORY_ICONS[photo.category] || '📸'}</span>
                <span className="text-[10px] font-medium" style={{ color: catColor }}>
                  {catInfo ? (language === 'ru' ? catInfo.ru : catInfo.en) : photo.category}
                </span>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-muted-foreground">{photo.date}</p>
                {photo.rating !== null && (
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-[8px]" style={{ color: i < (photo.rating ?? 0) ? '#f59e0b' : 'var(--muted)' }}>★</span>
                    ))}
                  </div>
                )}
                {photo.note && <p className="text-[9px] text-muted-foreground truncate mt-0.5">{photo.note}</p>}
              </div>
              {deletingId === photo.id ? (
                <div className="absolute top-1 right-1 flex gap-1">
                  <button onClick={() => { deletePhoto(photo.id); setDeletingId(null); }}
                    className="p-1 rounded bg-destructive/80 text-white text-[10px]">{t(language, 'common.delete')}</button>
                  <button onClick={() => setDeletingId(null)}
                    className="p-1 rounded bg-muted text-[10px]">{t(language, 'common.cancel')}</button>
                </div>
              ) : (
                <button onClick={() => setDeletingId(photo.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ==================== Analytics Tab ====================

function AnalyticsTab({ language, accentColor }: { language: 'en' | 'ru'; accentColor: string }) {
  const routines = useLooksmaxxingStore((s) => s.routines);
  const photos = useLooksmaxxingStore((s) => s.photos);

  // Completion rate (last 7 days)
  const today = new Date();
  const dailyRoutines = routines.filter((r) => r.frequency === 'daily');
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  let totalPossible = 0, totalCompleted = 0;
  for (const date of last7) {
    totalPossible += dailyRoutines.length;
    totalCompleted += dailyRoutines.filter((r) => r.logs.some((l) => l.date === date)).length;
  }
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Streak calculation
  let streak = 0;
  for (const date of [...last7].reverse()) {
    const dayCompleted = dailyRoutines.some((r) => r.logs.some((l) => l.date === date));
    if (dayCompleted) streak++;
    else if (streak > 0) break;
  }

  // Category distribution
  const catData = CATEGORIES.map((c) => ({ name: language === 'ru' ? c.ru : c.en, value: routines.filter((r) => r.category === c.id).length, color: CATEGORY_COLORS[c.id] }))
    .filter((d) => d.value > 0);

  // Rating trend
  const ratingData = photos.filter((p) => p.rating !== null)
    .slice(0, 20).reverse().map((p) => ({ date: p.date.slice(5), rating: p.rating }));

  const stats = [
    { label: t(language, 'looksmaxxing.completionRate'), value: `${completionRate}%`, icon: '📊' },
    { label: t(language, 'looksmaxxing.streak'), value: `${streak}d`, icon: '🔥' },
    { label: t(language, 'looksmaxxing.totalRoutines'), value: routines.length, icon: '✨' },
    { label: t(language, 'looksmaxxing.totalPhotos'), value: photos.length, icon: '📸' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, ...ANIMATION.SPRING_GENTLE }}
            className="rounded-xl border bg-card p-3 text-center">
            <span className="text-xl">{stat.icon}</span>
            <p className="text-lg font-bold mt-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Pie */}
      {catData.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t(language, 'looksmaxxing.byCategory')}
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {catData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {catData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Trend */}
      {ratingData.length >= 2 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t(language, 'looksmaxxing.ratingTrend')}
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="rating" fill={accentColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {catData.length === 0 && ratingData.length < 2 && (
        <EmptyState icon={Sparkles} title={t(language, 'looksmaxxing.notEnoughData')} description={t(language, 'looksmaxxing.notEnoughDataDesc')} accentColor={accentColor} />
      )}
    </motion.div>
  );
}

// ==================== Create Routine Sheet ====================

function CreateRoutineSheet({ open, onClose, language, accentColor }: {
  open: boolean; onClose: () => void; language: 'en' | 'ru'; accentColor: string;
}) {
  const createRoutine = useLooksmaxxingStore((s) => s.createRoutine);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('skincare');
  const [icon, setIcon] = useState('✨');
  const [frequency, setFrequency] = useState('daily');
  const [steps, setSteps] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    await createRoutine({ name: name.trim(), description: description.trim() || undefined, category, icon, frequency, steps: steps.trim() || undefined });
    resetForm(); onClose();
  };

  const resetForm = () => { setName(''); setDescription(''); setCategory('skincare'); setIcon('✨'); setFrequency('daily'); setSteps(''); setIsCreating(false); };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader><SheetTitle>{t(language, 'looksmaxxing.addRoutine')}</SheetTitle></SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t(language, 'looksmaxxing.routineName')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={language === 'ru' ? 'Название рутины' : 'Routine name'} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{language === 'ru' ? 'Описание' : 'Description'}</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === 'ru' ? 'Необязательно' : 'Optional'} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{t(language, 'looksmaxxing.category')}</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors"
                  style={{ backgroundColor: category === cat.id ? `${CATEGORY_COLORS[cat.id]}20` : 'transparent', borderColor: category === cat.id ? CATEGORY_COLORS[cat.id] : 'var(--border)', color: category === cat.id ? CATEGORY_COLORS[cat.id] : 'var(--muted-foreground)' }}>
                  <span>{cat.icon}</span>{language === 'ru' ? cat.ru : cat.en}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{language === 'ru' ? 'Иконка' : 'Icon'}</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg border text-sm ${icon === ic ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{t(language, 'looksmaxxing.frequency')}</label>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button key={f.id} onClick={() => setFrequency(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${frequency === f.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                  {language === 'ru' ? f.ru : f.en}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t(language, 'looksmaxxing.steps')}</label>
            <Input value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={language === 'ru' ? 'Шаг 1, Шаг 2, ...' : 'Step 1, Step 2, ...'} />
            <p className="text-[10px] text-muted-foreground mt-0.5">{language === 'ru' ? 'Разделите шаги запятыми' : 'Separate steps with commas'}</p>
          </div>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="w-full" style={{ backgroundColor: accentColor }}>
            {isCreating ? t(language, 'looksmaxxing.creating') : t(language, 'looksmaxxing.createRoutine')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== Create Photo Sheet ====================

function CreatePhotoSheet({ open, onClose, language, accentColor }: {
  open: boolean; onClose: () => void; language: 'en' | 'ru'; accentColor: string;
}) {
  const createPhoto = useLooksmaxxingStore((s) => s.createPhoto);
  const [date, setDate] = useState(getTodayString());
  const [category, setCategory] = useState('face');
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await createPhoto({ date, category, note: note.trim() || undefined, rating });
    resetForm(); onClose();
  };

  const resetForm = () => { setDate(getTodayString()); setCategory('face'); setRating(3); setNote(''); setIsCreating(false); };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader><SheetTitle>{t(language, 'looksmaxxing.addPhoto')}</SheetTitle></SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{language === 'ru' ? 'Дата' : 'Date'}</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{t(language, 'looksmaxxing.category')}</label>
            <div className="flex flex-wrap gap-2">
              {PHOTO_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors"
                  style={{ backgroundColor: category === cat.id ? `${CATEGORY_COLORS[cat.id] || accentColor}20` : 'transparent', borderColor: category === cat.id ? (CATEGORY_COLORS[cat.id] || accentColor) : 'var(--border)', color: category === cat.id ? (CATEGORY_COLORS[cat.id] || accentColor) : 'var(--muted-foreground)' }}>
                  {CATEGORY_ICONS[cat.id] || '📸'} {language === 'ru' ? cat.ru : cat.en}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">{t(language, 'looksmaxxing.selfRating')}</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} className="text-xl transition-transform hover:scale-110"
                  style={{ color: i < rating ? '#f59e0b' : 'var(--muted)' }}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{language === 'ru' ? 'Заметка' : 'Note'}</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={language === 'ru' ? 'Необязательно' : 'Optional'} />
          </div>
          <Button onClick={handleCreate} disabled={isCreating} className="w-full" style={{ backgroundColor: accentColor }}>
            {isCreating ? t(language, 'looksmaxxing.creating') : t(language, 'looksmaxxing.addPhoto')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
