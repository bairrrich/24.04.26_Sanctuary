'use client';

import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Flame,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION, SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useDiaryStore, type DiaryEntry } from '@/store/diary-store';
import { useGamificationStore } from '@/store/gamification-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { TabItem } from '@/types';

const MOOD_OPTIONS = [
  { value: 'great', emoji: '😊', labelEn: 'Great', labelRu: 'Отлично' },
  { value: 'good', emoji: '🙂', labelEn: 'Good', labelRu: 'Хорошо' },
  { value: 'neutral', emoji: '😐', labelEn: 'Neutral', labelRu: 'Нормально' },
  { value: 'bad', emoji: '😔', labelEn: 'Bad', labelRu: 'Плохо' },
  { value: 'terrible', emoji: '😢', labelEn: 'Terrible', labelRu: 'Ужасно' },
] as const;

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string, language: 'en' | 'ru'): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = getTodayString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  if (dateStr === today) return language === 'ru' ? 'Сегодня' : 'Today';
  if (dateStr === yesterday) return language === 'ru' ? 'Вчера' : 'Yesterday';

  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getMoodEmoji(mood: string | null): string {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? '📝';
}

function getMoodLabel(mood: string | null, language: 'en' | 'ru'): string {
  if (!mood) return language === 'ru' ? 'Без настроения' : 'No mood';
  const option = MOOD_OPTIONS.find((m) => m.value === mood);
  if (!option) return mood;
  return language === 'ru' ? option.labelRu : option.labelEn;
}

function getMonthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return days;
}

function readingMinutes(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 220));
}

const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function DiaryPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.diary;
  const { entries, isLoading, loadEntries, selectedDate, setSelectedDate, createEntry, updateEntry, deleteEntry } = useDiaryStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('entries');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DiaryEntry | null>(null);

  const today = getTodayString();
  const currentMonthStart = `${today.substring(0, 8)}01`;
  const currentMonthEnd = (() => {
    const d = new Date(parseInt(today.substring(0, 4)), parseInt(today.substring(5, 7)), 0);
    return `${today.substring(0, 8)}${String(d.getDate()).padStart(2, '0')}`;
  })();

  useEffect(() => {
    loadEntries(currentMonthStart, currentMonthEnd);
  }, [loadEntries, currentMonthStart, currentMonthEnd]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'entries', label: language === 'ru' ? 'Записи' : 'Entries' },
    { id: 'calendar', label: language === 'ru' ? 'Календарь' : 'Calendar' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  const hasTodayEntry = entries.some((e) => e.date === today);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={language === 'ru' ? 'Дневник' : 'Diary'}
        icon={BookOpen}
        accentColor={config.accentColor}
        subtitle={entries.length > 0 ? `${entries.length} ${language === 'ru' ? 'записей' : 'entries'}` : language === 'ru' ? 'Ваши мысли и записи' : 'Your thoughts and entries'}
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {!isLoading && entries.length === 0 && activeTab === 'entries' ? (
          <EmptyState
            icon={BookOpen}
            title={language === 'ru' ? 'Нет записей' : 'No entries yet'}
            description={language === 'ru' ? 'Начните писать дневник, чтобы отслеживать мысли, эмоции и события.' : 'Start journaling to track thoughts, feelings, and key moments.'}
            accentColor={config.accentColor}
            actionLabel={language === 'ru' ? 'Создать запись' : 'Create entry'}
            onAction={() => setCreateOpen(true)}
          />
        ) : null}

        {activeTab === 'entries' && (
          <EntriesTab
            entries={entries}
            isLoading={isLoading}
            hasTodayEntry={hasTodayEntry}
            language={language}
            accentColor={config.accentColor}
            onCreate={() => setCreateOpen(true)}
            onView={setViewingEntry}
            onEdit={setEditingEntry}
            onDelete={setDeletingEntry}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            entries={entries}
            language={language}
            accentColor={config.accentColor}
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(date)}
            onOpenEntry={setViewingEntry}
            onCreate={(date) => {
              setSelectedDate(date);
              setCreateOpen(true);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab entries={entries} language={language} accentColor={config.accentColor} />
        )}
      </div>

      <FAB accentColor={config.accentColor} onClick={() => setCreateOpen(true)} />

      <EntryFormDialog
        key={`create-${selectedDate}-${createOpen ? 'open' : 'closed'}`}
        open={createOpen}
        mode="create"
        language={language}
        accentColor={config.accentColor}
        defaultDate={selectedDate || today}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          const xp = await createEntry(payload);
          const total = xp?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
          toast({
            title: language === 'ru' ? 'Запись создана' : 'Entry created',
            description: total > 0 ? `+${total} XP` : undefined,
          });
        }}
      />

      <EntryFormDialog
        key={`edit-${editingEntry?.id ?? 'none'}-${editingEntry?.updatedAt ?? ''}`}
        open={!!editingEntry}
        mode="edit"
        language={language}
        accentColor={config.accentColor}
        entry={editingEntry ?? undefined}
        onClose={() => setEditingEntry(null)}
        onSubmit={async (payload) => {
          if (!editingEntry) return;
          await updateEntry(editingEntry.id, payload);
          toast({ title: language === 'ru' ? 'Изменения сохранены' : 'Changes saved' });
          setViewingEntry((current) => (current?.id === editingEntry.id ? { ...current, ...payload } as DiaryEntry : current));
        }}
      />

      <ViewEntryDialog
        open={!!viewingEntry}
        entry={viewingEntry}
        language={language}
        accentColor={config.accentColor}
        onClose={() => setViewingEntry(null)}
        onEdit={() => {
          if (viewingEntry) setEditingEntry(viewingEntry);
        }}
      />

      <AlertDialog open={!!deletingEntry} onOpenChange={(v) => !v && setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'ru' ? 'Удалить запись?' : 'Delete this entry?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ru' ? 'Действие нельзя отменить. Запись будет удалена навсегда.' : 'This action cannot be undone. The entry will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ru' ? 'Отмена' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingEntry) return;
                await deleteEntry(deletingEntry.id);
                toast({ title: language === 'ru' ? 'Запись удалена' : 'Entry deleted' });
                setViewingEntry((current) => (current?.id === deletingEntry.id ? null : current));
                setDeletingEntry(null);
              }}
            >
              {language === 'ru' ? 'Удалить' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EntriesTab({
  entries,
  isLoading,
  hasTodayEntry,
  language,
  accentColor,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: {
  entries: DiaryEntry[];
  isLoading: boolean;
  hasTodayEntry: boolean;
  language: 'en' | 'ru';
  accentColor: string;
  onCreate: () => void;
  onView: (entry: DiaryEntry) => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entry: DiaryEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest'>('newest');

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = entries.filter((entry) => {
      const moodOk = moodFilter === 'all' ? true : entry.mood === moodFilter;
      const textOk = !term
        ? true
        : `${entry.title ?? ''} ${entry.content} ${(entry.tags ?? []).join(' ')}`.toLowerCase().includes(term);
      return moodOk && textOk;
    });

    if (sortBy === 'newest') return list.sort((a, b) => b.date.localeCompare(a.date));
    if (sortBy === 'oldest') return list.sort((a, b) => a.date.localeCompare(b.date));
    return list.sort((a, b) => b.content.length - a.content.length);
  }, [entries, moodFilter, search, sortBy]);

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {!hasTodayEntry && (
        <div className="rounded-2xl border-2 border-dashed p-5 text-center" style={{ borderColor: `${accentColor}45` }}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accentColor}15` }}>
            <PenLine className="h-6 w-6" style={{ color: accentColor }} />
          </div>
          <p className="text-sm font-semibold">{language === 'ru' ? 'Как прошёл ваш день?' : 'How was your day?'}</p>
          <p className="mb-3 text-xs text-muted-foreground">{language === 'ru' ? 'Создайте запись и зафиксируйте главное.' : 'Capture today with a meaningful reflection.'}</p>
          <Button onClick={onCreate} style={{ backgroundColor: accentColor }}>
            <Plus className="mr-2 h-4 w-4" />
            {language === 'ru' ? 'Написать сейчас' : 'Write now'}
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder={language === 'ru' ? 'Поиск по тексту, заголовку и тегам' : 'Search text, title, and tags'}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">{language === 'ru' ? 'Все настроения' : 'All moods'}</option>
            {MOOD_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.emoji} {language === 'ru' ? m.labelRu : m.labelEn}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'longest')} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="newest">{language === 'ru' ? 'Сначала новые' : 'Newest first'}</option>
            <option value="oldest">{language === 'ru' ? 'Сначала старые' : 'Oldest first'}</option>
            <option value="longest">{language === 'ru' ? 'Сначала длинные' : 'Longest first'}</option>
          </select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {language === 'ru' ? 'По выбранным фильтрам записи не найдены.' : 'No entries found for selected filters.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${accentColor}15` }}>
                  {getMoodEmoji(entry.mood)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: accentColor }}>{formatDate(entry.date, language)}</span>
                    <span className="text-xs text-muted-foreground">• {readingMinutes(entry.content)} {language === 'ru' ? 'мин' : 'min'}</span>
                  </div>
                  <p className="truncate text-sm font-semibold">{entry.title || (language === 'ru' ? 'Без заголовка' : 'Untitled')}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{entry.content}</p>
                </div>
              </div>

              {entry.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${accentColor}14`, color: accentColor }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs" onClick={() => onView(entry)}>
                  <Eye className="h-3.5 w-3.5" />
                  {language === 'ru' ? 'Просмотр' : 'View'}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs" onClick={() => onEdit(entry)}>
                  <Edit3 className="h-3.5 w-3.5" />
                  {language === 'ru' ? 'Редактировать' : 'Edit'}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(entry)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  {language === 'ru' ? 'Удалить' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CalendarTab({
  entries,
  language,
  accentColor,
  selectedDate,
  onDateSelect,
  onOpenEntry,
  onCreate,
}: {
  entries: DiaryEntry[];
  language: 'en' | 'ru';
  accentColor: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onOpenEntry: (entry: DiaryEntry) => void;
  onCreate: (date: string) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const loadEntries = useDiaryStore((s) => s.loadEntries);

  useEffect(() => {
    const monthStart = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthEnd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    loadEntries(monthStart, monthEnd);
  }, [loadEntries, viewYear, viewMonth]);

  const entryDates = new Set(entries.map((e) => e.date));
  const days = getMonthDays(viewYear, viewMonth);
  const monthName = language === 'ru' ? MONTH_NAMES_RU[viewMonth] : MONTH_NAMES_EN[viewMonth];
  const dayNames = language === 'ru' ? DAY_NAMES_RU : DAY_NAMES_EN;

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const today = getTodayString();

  const selectedEntries = entries.filter((e) => e.date === selectedDate);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => (viewMonth === 0 ? (setViewMonth(11), setViewYear(viewYear - 1)) : setViewMonth(viewMonth - 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-semibold">{monthName} {viewYear}</p>
        <Button variant="ghost" size="icon" onClick={() => (viewMonth === 11 ? (setViewMonth(0), setViewYear(viewYear + 1)) : setViewMonth(viewMonth + 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div key={name} className="py-1 text-center text-[10px] font-medium text-muted-foreground">{name}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
        {days.map((dateStr) => {
          const hasEntry = entryDates.has(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const oneEntry = entries.find((e) => e.date === dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className="relative aspect-square rounded-lg text-sm"
              style={{ backgroundColor: hasEntry ? `${accentColor}15` : isSelected ? `${accentColor}0F` : 'transparent' }}
            >
              <span className={isToday ? 'font-bold' : ''} style={isToday ? { color: accentColor } : undefined}>{dateStr.substring(8)}</span>
              {hasEntry && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px]">{getMoodEmoji(oneEntry?.mood ?? null)}</span>}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{formatDate(selectedDate, language)}</p>
        {selectedEntries.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{language === 'ru' ? 'На этот день записи нет.' : 'No entry for this day.'}</p>
            <Button onClick={() => onCreate(selectedDate)} style={{ backgroundColor: accentColor }}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'ru' ? 'Создать запись' : 'Create entry'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedEntries.map((entry) => (
              <button key={entry.id} onClick={() => onOpenEntry(entry)} className="w-full rounded-lg border bg-background p-3 text-left">
                <p className="truncate text-sm font-medium">{entry.title || (language === 'ru' ? 'Без заголовка' : 'Untitled')}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{entry.content}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AnalyticsTab({ entries, language, accentColor }: { entries: DiaryEntry[]; language: 'en' | 'ru'; accentColor: string }) {
  const totalEntries = entries.length;
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const entriesThisMonth = entries.filter((e) => e.date.startsWith(currentMonth)).length;
  const avgLength = totalEntries ? Math.round(entries.reduce((acc, e) => acc + e.content.length, 0) / totalEntries) : 0;
  const streak = calculateStreak(entries);

  const moodCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    if (entry.mood) moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: language === 'ru' ? 'Всего' : 'Total', value: totalEntries, icon: '📝' },
          { label: language === 'ru' ? 'В месяце' : 'This month', value: entriesThisMonth, icon: '📅' },
          { label: language === 'ru' ? 'Ср. длина' : 'Avg length', value: avgLength, icon: '📏' },
          { label: language === 'ru' ? 'Серия' : 'Streak', value: streak, icon: '🔥' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-3 text-center">
            <span className="text-xl">{item.icon}</span>
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {mostCommonMood && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Доминирующее настроение' : 'Dominant mood'}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl">{getMoodEmoji(mostCommonMood)}</span>
            <div>
              <p className="text-sm font-semibold">{getMoodLabel(mostCommonMood, language)}</p>
              <p className="text-xs text-muted-foreground">{moodCounts[mostCommonMood]} {language === 'ru' ? 'записей' : 'entries'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Баланс настроения' : 'Mood balance'}</p>
        <div className="space-y-2">
          {MOOD_OPTIONS.map((mood) => {
            const count = moodCounts[mood.value] || 0;
            const pct = totalEntries > 0 ? Math.max(6, Math.round((count / totalEntries) * 100)) : 0;
            return (
              <div key={mood.value} className="flex items-center gap-2">
                <span className="w-6 text-center">{mood.emoji}</span>
                <div className="h-4 flex-1 rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accentColor }} />
                </div>
                <span className="w-7 text-right text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {streak > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">{language === 'ru' ? 'Вы в ритме' : 'You are consistent'}</p>
              <p className="text-xs text-muted-foreground">{streak} {language === 'ru' ? 'дней подряд' : 'days in a row'}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function calculateStreak(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;
  const uniqueDates = [...new Set(entries.map((entry) => entry.date))].sort((a, b) => b.localeCompare(a));
  const today = getTodayString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(`${uniqueDates[i - 1]}T00:00:00`);
    const curr = new Date(`${uniqueDates[i]}T00:00:00`);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak += 1;
    else break;
  }
  return streak;
}

function EntryFormDialog({
  open,
  mode,
  language,
  accentColor,
  defaultDate,
  entry,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  language: 'en' | 'ru';
  accentColor: string;
  defaultDate?: string;
  entry?: DiaryEntry;
  onClose: () => void;
  onSubmit: (payload: { date: string; title: string | null; content: string; mood: string | null; tags: string[] }) => Promise<void>;
}) {
  const initialDate = mode === 'edit' && entry ? entry.date : (defaultDate ?? getTodayString());
  const initialTitle = mode === 'edit' && entry ? (entry.title ?? '') : '';
  const initialContent = mode === 'edit' && entry ? entry.content : '';
  const initialMood = mode === 'edit' && entry ? entry.mood : null;
  const initialTags = mode === 'edit' && entry ? (entry.tags ?? []).join(', ') : '';

  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<string | null>(initialMood);
  const [tagsInput, setTagsInput] = useState(initialTags);
  const [isSaving, setIsSaving] = useState(false);


  const tags = tagsInput.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const submit = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    await onSubmit({ date, title: title.trim() || null, content: content.trim(), mood, tags });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? (language === 'ru' ? 'Новая запись' : 'New journal entry') : (language === 'ru' ? 'Редактирование записи' : 'Edit entry')}</DialogTitle>
          <DialogDescription>
            {language === 'ru' ? 'Ctrl/Cmd + Enter — быстро сохранить.' : 'Ctrl/Cmd + Enter to save quickly.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Заголовок' : 'Title'}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={language === 'ru' ? 'Ключевая мысль дня' : 'Main thought of the day'} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-muted-foreground">{language === 'ru' ? 'Настроение' : 'Mood'}</label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  className={`rounded-xl border p-2 text-center ${mood === item.value ? 'ring-2' : ''}`}
                  style={mood === item.value ? ({ '--tw-ring-color': accentColor } as CSSProperties) : undefined}
                  onClick={() => setMood(mood === item.value ? null : item.value)}
                >
                  <span className="block text-xl">{item.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{language === 'ru' ? item.labelRu : item.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Текст записи' : 'Entry text'}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[180px] resize-y"
              placeholder={language === 'ru' ? 'Опишите события, эмоции, выводы и благодарности за день...' : 'Describe events, emotions, lessons, and gratitude from your day...'}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{wordCount} {language === 'ru' ? 'слов' : 'words'} • {readingMinutes(content)} {language === 'ru' ? 'мин чтения' : 'min read'}</span>
              {content.length >= 500 && <span style={{ color: accentColor }}><Sparkles className="mr-1 inline h-3 w-3" />+12 XP</span>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{language === 'ru' ? 'Теги (через запятую)' : 'Tags (comma-separated)'}</label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={language === 'ru' ? 'работа, спорт, семья' : 'work, gym, family'} />
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]">
                    <Tag className="h-3 w-3" />#{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button onClick={submit} disabled={isSaving || !content.trim()} className="w-full" style={{ backgroundColor: accentColor }}>
            {isSaving ? (language === 'ru' ? 'Сохранение...' : 'Saving...') : (mode === 'create' ? (language === 'ru' ? 'Создать запись' : 'Create entry') : (language === 'ru' ? 'Сохранить изменения' : 'Save changes'))}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewEntryDialog({
  open,
  entry,
  language,
  accentColor,
  onClose,
  onEdit,
}: {
  open: boolean;
  entry: DiaryEntry | null;
  language: 'en' | 'ru';
  accentColor: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        {!entry ? null : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{getMoodEmoji(entry.mood)}</span>
                <span>{entry.title || (language === 'ru' ? 'Без заголовка' : 'Untitled')}</span>
              </DialogTitle>
              <DialogDescription>
                <CalendarDays className="mr-1 inline h-4 w-4" />{formatDate(entry.date, language)} • {getMoodLabel(entry.mood, language)}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/25 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.content}</p>
            </div>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${accentColor}14`, color: accentColor }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onEdit} className="flex-1" style={{ backgroundColor: accentColor }}>
                <Edit3 className="mr-2 h-4 w-4" />
                {language === 'ru' ? 'Редактировать' : 'Edit'}
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
