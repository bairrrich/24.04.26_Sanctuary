'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Circle, Sparkles, Trash2, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { t } from '@/lib/i18n';
import { ANIMATION } from '@/lib/constants';
import { CATEGORY_COLORS, CATEGORY_ICONS, type Routine } from '@/store/looksmaxxing-store';
import { useLooksmaxxingStore } from '@/store/looksmaxxing-store';
import { CATEGORIES, FREQUENCIES, getTodayString, ICON_OPTIONS, PHOTO_CATEGORIES, type LooksLanguage } from '../constants';

export function RoutinesTab({ language, accentColor }: { language: LooksLanguage; accentColor: string }) {
  const routines = useLooksmaxxingStore((s) => s.routines);
  const deleteRoutine = useLooksmaxxingStore((s) => s.deleteRoutine);
  const grouped = CATEGORIES.map((cat) => ({ ...cat, routines: routines.filter((r) => r.category === cat.id) })).filter((g) => g.routines.length > 0);

  if (routines.length === 0) return <EmptyState icon={Sparkles} title={t(language, 'looksmaxxing.noRoutines')} description={t(language, 'looksmaxxing.noRoutinesDesc')} accentColor={accentColor} />;

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {grouped.map((group) => (
        <div key={group.id} className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center gap-2 border-b p-3" style={{ backgroundColor: `${CATEGORY_COLORS[group.id]}10` }}>
            <span className="text-base">{group.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: CATEGORY_COLORS[group.id] }}>{language === 'ru' ? group.ru : group.en}</span>
            <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[10px]">{group.routines.length}</Badge>
          </div>
          <div className="divide-y">{group.routines.map((routine) => <RoutineCard key={routine.id} routine={routine} language={language} onDelete={() => deleteRoutine(routine.id)} />)}</div>
        </div>
      ))}
    </motion.div>
  );
}

function RoutineCard({ routine, language, onDelete }: { routine: Routine; language: LooksLanguage; onDelete: () => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const catColor = CATEGORY_COLORS[routine.category] || '#f59e0b';
  const freq = FREQUENCIES.find((f) => f.id === routine.frequency);

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: `${catColor}15` }}>{routine.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{routine.name}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]" style={{ backgroundColor: `${catColor}15`, color: catColor }}>{freq ? (language === 'ru' ? freq.ru : freq.en) : routine.frequency}</Badge>
          {routine.description && <span className="truncate text-[10px] text-muted-foreground">{routine.description}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => setShowDelete(!showDelete)} className="rounded-lg p-1.5 transition-colors hover:bg-muted"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        {showDelete && <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={onDelete} className="rounded-lg bg-destructive/10 p-1.5 transition-colors hover:bg-destructive/20"><X className="h-3.5 w-3.5 text-destructive" /></motion.button>}
      </div>
    </motion.div>
  );
}

export function TodayTab({ language, accentColor }: { language: LooksLanguage; accentColor: string }) {
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
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
        <div className="relative h-24 w-24 shrink-0"><svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96"><circle cx="48" cy="48" r="40" fill="none" stroke="var(--muted)" strokeWidth="6" /><circle cx="48" cy="48" r="40" fill="none" stroke={accentColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-bold" style={{ color: accentColor }}>{completionPct}%</span></div></div>
        <div className="flex-1"><p className="text-sm font-medium">{t(language, 'looksmaxxing.dailyProgress')}</p><p className="mt-0.5 text-xs text-muted-foreground">{completedToday.length} / {dailyRoutines.length} {t(language, 'looksmaxxing.completed')}</p>{completionPct === 100 && dailyRoutines.length > 0 && <Badge className="mt-2 text-[10px]" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>✨ +{dailyRoutines.length * 8} XP</Badge>}</div>
      </div>

      {dailyRoutines.length > 0 ? (
        <div className="divide-y rounded-2xl border bg-card">
          {dailyRoutines.map((routine) => {
            const isCompleted = routine.logs.some((l) => l.date === date);
            const catColor = CATEGORY_COLORS[routine.category] || '#f59e0b';
            return (
              <button key={routine.id} onClick={() => toggleRoutineLog(routine.id, date)} className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50">
                <div className="shrink-0">{isCompleted ? <CheckCircle2 className="h-5 w-5" style={{ color: catColor }} /> : <Circle className="h-5 w-5 text-muted-foreground" />}</div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: `${catColor}15` }}>{routine.icon}</div>
                <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${isCompleted ? 'line-through opacity-60' : ''}`}>{routine.name}</p></div>
                {isCompleted && <Badge className="shrink-0 px-1.5 py-0 text-[10px]" style={{ backgroundColor: `${catColor}15`, color: catColor }}>+8 XP</Badge>}
              </button>
            );
          })}
        </div>
      ) : <EmptyState icon={Sparkles} title={t(language, 'looksmaxxing.noRoutines')} description={t(language, 'looksmaxxing.noRoutinesDesc')} accentColor={accentColor} />}
    </motion.div>
  );
}

export function PhotosTab({ language, accentColor }: { language: LooksLanguage; accentColor: string }) {
  const photos = useLooksmaxxingStore((s) => s.photos);
  const deletePhoto = useLooksmaxxingStore((s) => s.deletePhoto);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (photos.length === 0) return <EmptyState icon={Camera} title={t(language, 'looksmaxxing.noPhotos')} description={t(language, 'looksmaxxing.noPhotosDesc')} accentColor={accentColor} />;

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => {
          const catColor = CATEGORY_COLORS[photo.category] || '#f59e0b';
          const catInfo = PHOTO_CATEGORIES.find((c) => c.id === photo.category);
          return (
            <motion.div key={photo.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square flex flex-col items-center justify-center gap-1" style={{ backgroundColor: `${catColor}15` }}><span className="text-3xl">{CATEGORY_ICONS[photo.category] || '📸'}</span><span className="text-[10px] font-medium" style={{ color: catColor }}>{catInfo ? (language === 'ru' ? catInfo.ru : catInfo.en) : photo.category}</span></div>
              <div className="p-2"><p className="text-[10px] text-muted-foreground">{photo.date}</p>{photo.rating !== null && <div className="mt-0.5 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-[8px]" style={{ color: i < (photo.rating ?? 0) ? '#f59e0b' : 'var(--muted)' }}>★</span>)}</div>}{photo.note && <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{photo.note}</p>}</div>
              {deletingId === photo.id ? <div className="absolute right-1 top-1 flex gap-1"><button onClick={() => { deletePhoto(photo.id); setDeletingId(null); }} className="rounded bg-destructive/80 p-1 text-[10px] text-white">{t(language, 'common.delete')}</button><button onClick={() => setDeletingId(null)} className="rounded bg-muted p-1 text-[10px]">{t(language, 'common.cancel')}</button></div> : <button onClick={() => setDeletingId(photo.id)} className="absolute right-1 top-1 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function AnalyticsTab({ language, accentColor }: { language: LooksLanguage; accentColor: string }) {
  const routines = useLooksmaxxingStore((s) => s.routines);
  const photos = useLooksmaxxingStore((s) => s.photos);

  const today = new Date();
  const dailyRoutines = routines.filter((r) => r.frequency === 'daily');
  const last7 = Array.from({ length: 7 }).map((_, i) => { const d = new Date(today); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; });
  let totalPossible = 0; let totalCompleted = 0;
  for (const date of last7) { totalPossible += dailyRoutines.length; totalCompleted += dailyRoutines.filter((r) => r.logs.some((l) => l.date === date)).length; }
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  let streak = 0;
  for (const date of [...last7].reverse()) {
    const dayCompleted = dailyRoutines.some((r) => r.logs.some((l) => l.date === date));
    if (dayCompleted) streak++; else if (streak > 0) break;
  }

  const catData = CATEGORIES.map((c) => ({ name: language === 'ru' ? c.ru : c.en, value: routines.filter((r) => r.category === c.id).length, color: CATEGORY_COLORS[c.id] })).filter((d) => d.value > 0);
  const ratingData = photos.filter((p) => p.rating !== null).slice(0, 20).reverse().map((p) => ({ date: p.date.slice(5), rating: p.rating }));

  const stats = [
    { label: t(language, 'looksmaxxing.completionRate'), value: `${completionRate}%`, icon: '📊' },
    { label: t(language, 'looksmaxxing.streak'), value: `${streak}d`, icon: '🔥' },
    { label: t(language, 'looksmaxxing.totalRoutines'), value: routines.length, icon: '✨' },
    { label: t(language, 'looksmaxxing.totalPhotos'), value: photos.length, icon: '📸' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">{stats.map((stat, i) => <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08, ...ANIMATION.SPRING_GENTLE }} className="rounded-xl border bg-card p-3 text-center"><span className="text-xl">{stat.icon}</span><p className="mt-1 text-lg font-bold">{stat.value}</p><p className="text-[10px] text-muted-foreground">{stat.label}</p></motion.div>)}</div>
      {catData.length > 0 && (
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t(language, 'looksmaxxing.byCategory')}</h4>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">{catData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="flex flex-wrap justify-center gap-3">{catData.map((entry) => <div key={entry.name} className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} /><span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value})</span></div>)}</div>
        </div>
      )}
      {ratingData.length >= 2 && (
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t(language, 'looksmaxxing.ratingTrend')}</h4>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={ratingData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" /><YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" /><Tooltip /><Bar dataKey="rating" fill={accentColor} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      )}
      {catData.length === 0 && ratingData.length < 2 && <EmptyState icon={Sparkles} title={t(language, 'looksmaxxing.notEnoughData')} description={t(language, 'looksmaxxing.notEnoughDataDesc')} accentColor={accentColor} />}
    </motion.div>
  );
}

export function CreateRoutineSheet({ open, onClose, language, accentColor }: { open: boolean; onClose: () => void; language: LooksLanguage; accentColor: string; }) {
  const createRoutine = useLooksmaxxingStore((s) => s.createRoutine);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('skincare');
  const [icon, setIcon] = useState('✨');
  const [frequency, setFrequency] = useState('daily');
  const [steps, setSteps] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => { setName(''); setDescription(''); setCategory('skincare'); setIcon('✨'); setFrequency('daily'); setSteps(''); setIsCreating(false); };
  const handleCreate = async () => { if (!name.trim()) return; setIsCreating(true); await createRoutine({ name: name.trim(), description: description.trim() || undefined, category, icon, frequency, steps: steps.trim() || undefined }); resetForm(); onClose(); };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader><SheetTitle>{t(language, 'looksmaxxing.addRoutine')}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="mb-1 block text-xs text-muted-foreground">{t(language, 'looksmaxxing.routineName')}</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={language === 'ru' ? 'Название рутины' : 'Routine name'} /></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === 'ru' ? 'Необязательно' : 'Optional'} /></div>
          <div><label className="mb-2 block text-xs text-muted-foreground">{t(language, 'looksmaxxing.category')}</label><div className="flex flex-wrap gap-2">{CATEGORIES.map((cat) => <button key={cat.id} onClick={() => setCategory(cat.id)} className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors" style={{ backgroundColor: category === cat.id ? `${CATEGORY_COLORS[cat.id]}20` : 'transparent', borderColor: category === cat.id ? CATEGORY_COLORS[cat.id] : 'var(--border)', color: category === cat.id ? CATEGORY_COLORS[cat.id] : 'var(--muted-foreground)' }}><span>{cat.icon}</span>{language === 'ru' ? cat.ru : cat.en}</button>)}</div></div>
          <div><label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Иконка' : 'Icon'}</label><div className="flex flex-wrap gap-1.5">{ICON_OPTIONS.map((ic) => <button key={ic} onClick={() => setIcon(ic)} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm ${icon === ic ? 'border-primary bg-primary/10' : 'border-border'}`}>{ic}</button>)}</div></div>
          <div><label className="mb-2 block text-xs text-muted-foreground">{t(language, 'looksmaxxing.frequency')}</label><div className="flex gap-2">{FREQUENCIES.map((f) => <button key={f.id} onClick={() => setFrequency(f.id)} className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${frequency === f.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{language === 'ru' ? f.ru : f.en}</button>)}</div></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">{t(language, 'looksmaxxing.steps')}</label><Input value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={language === 'ru' ? 'Шаг 1, Шаг 2, ...' : 'Step 1, Step 2, ...'} /><p className="mt-0.5 text-[10px] text-muted-foreground">{language === 'ru' ? 'Разделите шаги запятыми' : 'Separate steps with commas'}</p></div>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="w-full" style={{ backgroundColor: accentColor }}>{isCreating ? t(language, 'looksmaxxing.creating') : t(language, 'looksmaxxing.createRoutine')}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CreatePhotoSheet({ open, onClose, language, accentColor }: { open: boolean; onClose: () => void; language: LooksLanguage; accentColor: string; }) {
  const createPhoto = useLooksmaxxingStore((s) => s.createPhoto);
  const [date, setDate] = useState(getTodayString());
  const [category, setCategory] = useState('face');
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => { setDate(getTodayString()); setCategory('face'); setRating(3); setNote(''); setIsCreating(false); };
  const handleCreate = async () => { setIsCreating(true); await createPhoto({ date, category, note: note.trim() || undefined, rating }); resetForm(); onClose(); };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
      <SheetContent>
        <SheetHeader><SheetTitle>{t(language, 'looksmaxxing.addPhoto')}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="mb-2 block text-xs text-muted-foreground">{t(language, 'looksmaxxing.category')}</label><div className="flex flex-wrap gap-2">{PHOTO_CATEGORIES.map((cat) => <button key={cat.id} onClick={() => setCategory(cat.id)} className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors" style={{ backgroundColor: category === cat.id ? `${CATEGORY_COLORS[cat.id] || accentColor}20` : 'transparent', borderColor: category === cat.id ? (CATEGORY_COLORS[cat.id] || accentColor) : 'var(--border)', color: category === cat.id ? (CATEGORY_COLORS[cat.id] || accentColor) : 'var(--muted-foreground)' }}>{CATEGORY_ICONS[cat.id] || '📸'} {language === 'ru' ? cat.ru : cat.en}</button>)}</div></div>
          <div><label className="mb-2 block text-xs text-muted-foreground">{t(language, 'looksmaxxing.selfRating')}</label><div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <button key={i} onClick={() => setRating(i + 1)} className="text-xl transition-transform hover:scale-110" style={{ color: i < rating ? '#f59e0b' : 'var(--muted)' }}>★</button>)}</div></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Заметка' : 'Note'}</label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={language === 'ru' ? 'Необязательно' : 'Optional'} /></div>
          <Button onClick={handleCreate} disabled={isCreating} className="w-full" style={{ backgroundColor: accentColor }}>{isCreating ? t(language, 'looksmaxxing.creating') : t(language, 'looksmaxxing.addPhoto')}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
