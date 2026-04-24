'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Flame,
  CalendarDays,
  PenLine,
} from 'lucide-react';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION, SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useDiaryStore, type DiaryEntry } from '@/store/diary-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

// ==================== Constants ====================

const MOOD_OPTIONS = [
  { value: 'great', emoji: '😊', labelEn: 'Great', labelRu: 'Отлично' },
  { value: 'good', emoji: '🙂', labelEn: 'Good', labelRu: 'Хорошо' },
  { value: 'neutral', emoji: '😐', labelEn: 'Neutral', labelRu: 'Нормально' },
  { value: 'bad', emoji: '😔', labelEn: 'Bad', labelRu: 'Плохо' },
  { value: 'terrible', emoji: '😢', labelEn: 'Terrible', labelRu: 'Ужасно' },
] as const;

const ACCENT_COLOR = MODULE_REGISTRY.diary.accentColor;

// ==================== Helpers ====================

function getTodayString(): string {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function formatDate(dateStr: string, language: 'en' | 'ru'): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = getTodayString();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();

  if (dateStr === today) return language === 'ru' ? 'Сегодня' : 'Today';
  if (dateStr === yesterday) return language === 'ru' ? 'Вчера' : 'Yesterday';

  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function getMoodEmoji(mood: string | null): string {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji ?? '📝';
}

function getMoodLabel(mood: string | null, language: 'en' | 'ru'): string {
  if (!mood) return language === 'ru' ? 'Без настроения' : 'No mood';
  const opt = MOOD_OPTIONS.find((m) => m.value === mood);
  if (!opt) return mood;
  return language === 'ru' ? opt.labelRu : opt.labelEn;
}

function getMonthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'));
  }
  return days;
}

const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// ==================== Inline Spinner ====================

function InlineSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

// ==================== Main Component ====================

export function DiaryPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.diary;
  const { entries, isLoading, loadEntries, selectedDate, setSelectedDate } = useDiaryStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('entries');
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  // Load entries for the current month on mount
  const today = getTodayString();
  const currentMonthStart = today.substring(0, 8) + '01';
  const currentMonthEnd = (() => {
    const d = new Date(parseInt(today.substring(0, 4)), parseInt(today.substring(5, 7)), 0);
    return today.substring(0, 8) + String(d.getDate()).padStart(2, '0');
  })();

  useEffect(() => {
    loadEntries(currentMonthStart, currentMonthEnd);
  }, [loadEntries, currentMonthStart, currentMonthEnd]);

  // Listen for gamification updates from other modules
  useEffect(() => {
    const handler = () => {
      loadCharacter();
    };
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
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Дневник' : 'Diary'}
        icon={BookOpen}
        accentColor={config.accentColor}
        subtitle={
          entries.length > 0
            ? `${entries.length} ${language === 'ru' ? 'записей' : 'entries'}`
            : language === 'ru' ? 'Ваши мысли и записи' : 'Your thoughts and entries'
        }
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {/* Show empty state only on first load with no entries and on entries tab */}
        {!isLoading && entries.length === 0 && activeTab === 'entries' ? (
          <>
            <ModuleTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={config.accentColor}
            />
            <EmptyState
              icon={BookOpen}
              title={language === 'ru' ? 'Нет записей' : 'No entries yet'}
              description={
                language === 'ru'
                  ? 'Начните писать дневник, чтобы отслеживать свои мысли'
                  : 'Start journaling to track your thoughts and reflections'
              }
              accentColor={config.accentColor}
              actionLabel={language === 'ru' ? 'Написать запись' : 'Write entry'}
              onAction={() => setShowCreateSheet(true)}
            />
          </>
        ) : (
          <>
            {/* Always show tabs — never hide them during loading */}
            <ModuleTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={config.accentColor}
            />

            {/* Tab content — instant switching, no AnimatePresence mode="wait" */}
            {activeTab === 'entries' && (
              <EntriesTab
                entries={entries}
                isLoading={isLoading}
                language={language}
                accentColor={config.accentColor}
                onEditEntry={(entry) => {
                  setSelectedDate(entry.date);
                }}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarTab
                entries={entries}
                language={language}
                accentColor={config.accentColor}
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setActiveTab('entries');
                }}
                onNewEntry={(date) => {
                  setSelectedDate(date);
                  setShowCreateSheet(true);
                }}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                entries={entries}
                language={language}
                accentColor={config.accentColor}
              />
            )}
          </>
        )}
      </div>

      <FAB
        accentColor={config.accentColor}
        onClick={() => setShowCreateSheet(true)}
      />

      <CreateEntrySheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        language={language}
        accentColor={config.accentColor}
        defaultDate={selectedDate}
      />
    </div>
  );
}

// ==================== Entries Tab ====================

function EntriesTab({
  entries,
  isLoading,
  language,
  accentColor,
  onEditEntry,
}: {
  entries: DiaryEntry[];
  isLoading: boolean;
  language: 'en' | 'ru';
  accentColor: string;
  onEditEntry: (entry: DiaryEntry) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const deleteEntry = useDiaryStore((s) => s.deleteEntry);
  const today = getTodayString();
  const hasTodayEntry = entries.some((e) => e.date === today);

  if (isLoading && entries.length === 0) {
    return <InlineSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Today's prompt */}
      {!hasTodayEntry && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-dashed p-5 text-center space-y-3"
          style={{ borderColor: `${accentColor}40` }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl mx-auto"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <PenLine className="h-6 w-6" style={{ color: accentColor }} />
          </div>
          <p className="text-sm font-medium">
            {language === 'ru' ? 'Как прошёл ваш день?' : 'How was your day?'}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === 'ru'
              ? 'Запишите свои мысли и получите XP за рефлексию'
              : 'Write down your thoughts and earn XP for reflection'}
          </p>
        </motion.div>
      )}

      {/* Entries list */}
      {entries.map((entry, i) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          language={language}
          accentColor={accentColor}
          isExpanded={expandedId === entry.id}
          onToggleExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          onEdit={() => setEditingEntry(entry)}
          onDelete={() => deleteEntry(entry.id)}
          index={i}
        />
      ))}

      {/* Edit Sheet */}
      <Sheet open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{language === 'ru' ? 'Редактировать запись' : 'Edit Entry'}</SheetTitle>
          </SheetHeader>
          {editingEntry && (
            <EditEntryForm
              entry={editingEntry}
              onClose={() => setEditingEntry(null)}
              language={language}
              accentColor={accentColor}
            />
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

// ==================== Entry Card ====================

function EntryCard({
  entry,
  language,
  accentColor,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  index,
}: {
  entry: DiaryEntry;
  language: 'en' | 'ru';
  accentColor: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }}
    >
      <button
        onClick={onToggleExpand}
        className="w-full text-left rounded-xl border bg-card p-4 transition-all hover:bg-muted/30 active:scale-[0.99]"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: `${accentColor}12` }}
          >
            {getMoodEmoji(entry.mood)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: accentColor }}>
                {formatDate(entry.date, language)}
              </span>
              {entry.mood && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  {getMoodLabel(entry.mood, language)}
                </span>
              )}
            </div>
            {entry.title ? (
              <p className="text-sm font-semibold mt-0.5 truncate">{entry.title}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {entry.content.substring(0, 120)}{entry.content.length > 120 ? '...' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="overflow-hidden">
            <div className="mt-3 pt-3 border-t space-y-3">
              {entry.title && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {entry.content}
                </p>
              )}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Edit3 className="h-3 w-3" />
                  {language === 'ru' ? 'Редактировать' : 'Edit'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  {language === 'ru' ? 'Удалить' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </button>
    </motion.div>
  );
}

// ==================== Calendar Tab ====================

function CalendarTab({
  entries,
  language,
  accentColor,
  selectedDate,
  onDateSelect,
  onNewEntry,
}: {
  entries: DiaryEntry[];
  language: 'en' | 'ru';
  accentColor: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onNewEntry: (date: string) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const entryDates = new Set(entries.map((e) => e.date));
  const days = getMonthDays(viewYear, viewMonth);
  const monthName = language === 'ru' ? MONTH_NAMES_RU[viewMonth] : MONTH_NAMES_EN[viewMonth];
  const dayNames = language === 'ru' ? DAY_NAMES_RU : DAY_NAMES_EN;

  // Calculate day of week for the 1st of the month (0=Sun, 1=Mon, ...)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // Convert to Monday-first: Mon=0, Tue=1, ..., Sun=6
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const today = getTodayString();

  // Load entries for the viewed month when it changes
  const loadEntries = useDiaryStore((s) => s.loadEntries);
  useEffect(() => {
    const monthStart = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-01';
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthEnd = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(daysInMonth).padStart(2, '0');
    loadEntries(monthStart, monthEnd);
  }, [viewYear, viewMonth, loadEntries]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {monthName} {viewYear}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map((dateStr) => {
          const day = parseInt(dateStr.substring(8));
          const hasEntry = entryDates.has(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          // Find mood for this day's entry
          const dayEntry = entries.find((e) => e.date === dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => {
                onDateSelect(dateStr);
                if (!hasEntry) {
                  onNewEntry(dateStr);
                }
              }}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative
                ${isToday ? 'font-bold' : ''}
                ${hasEntry ? 'cursor-pointer' : 'cursor-pointer opacity-60 hover:opacity-100'}
                ${isSelected ? 'ring-2' : ''}
              `}
              style={{
                backgroundColor: hasEntry ? `${accentColor}15` : isSelected ? `${accentColor}08` : 'transparent',
                ...(isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
              }}
            >
              <span className={isToday ? '' : ''} style={isToday ? { color: accentColor } : undefined}>
                {day}
              </span>
              {hasEntry && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  {dayEntry?.mood && (
                    <span className="text-[8px] leading-none">
                      {getMoodEmoji(dayEntry.mood)}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      {selectedDate && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {formatDate(selectedDate, language)}
          </p>
          {entries.filter((e) => e.date === selectedDate).map((entry) => (
            <div key={entry.id} className="flex items-start gap-2">
              <span className="text-base">{getMoodEmoji(entry.mood)}</span>
              <div className="flex-1 min-w-0">
                {entry.title && (
                  <p className="text-sm font-medium truncate">{entry.title}</p>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
              </div>
            </div>
          ))}
          {!entries.some((e) => e.date === selectedDate) && (
            <p className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Нет записи на этот день' : 'No entry for this day'}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ==================== Analytics Tab ====================

function AnalyticsTab({
  entries,
  language,
  accentColor,
}: {
  entries: DiaryEntry[];
  language: 'en' | 'ru';
  accentColor: string;
}) {
  // Stats
  const totalEntries = entries.length;

  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const entriesThisMonth = entries.filter((e) => e.date.startsWith(currentMonth)).length;

  const avgLength = totalEntries > 0
    ? Math.round(entries.reduce((sum, e) => sum + e.content.length, 0) / totalEntries)
    : 0;

  // Most common mood
  const moodCounts: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  }
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Writing streak
  const streak = calculateStreak(entries);

  // Mood distribution
  const moodDist = MOOD_OPTIONS.map((opt) => ({
    ...opt,
    count: moodCounts[opt.value] || 0,
  }));
  const maxMoodCount = Math.max(...moodDist.map((m) => m.count), 1);

  const stats = [
    {
      label: language === 'ru' ? 'Всего записей' : 'Total Entries',
      value: totalEntries,
      icon: '📝',
    },
    {
      label: language === 'ru' ? 'В этом месяце' : 'This Month',
      value: entriesThisMonth,
      icon: '📅',
    },
    {
      label: language === 'ru' ? 'Средняя длина' : 'Avg Length',
      value: avgLength > 0 ? `${avgLength}` : '0',
      icon: '📏',
    },
    {
      label: language === 'ru' ? 'Серия дней' : 'Writing Streak',
      value: streak,
      icon: '🔥',
    },
  ];

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

      {/* Most Common Mood */}
      {mostCommonMood && (
        <div className="rounded-xl border bg-card p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Преобладающее настроение' : 'Most Common Mood'}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl">{getMoodEmoji(mostCommonMood)}</span>
            <div>
              <p className="text-sm font-medium">{getMoodLabel(mostCommonMood, language)}</p>
              <p className="text-xs text-muted-foreground">
                {moodCounts[mostCommonMood]} {language === 'ru' ? 'записей' : 'entries'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language === 'ru' ? 'Распределение настроений' : 'Mood Distribution'}
        </h4>
        {moodDist.map((mood) => (
          <div key={mood.value} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">{mood.emoji}</span>
            <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: mood.count > 0 ? `${Math.max(8, (mood.count / maxMoodCount) * 100)}%` : '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <span className="text-xs font-medium w-6 text-right">{mood.count}</span>
          </div>
        ))}
      </div>

      {/* Streak info */}
      {streak > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {language === 'ru' ? 'Серия написания' : 'Writing Streak'}
              </p>
              <p className="text-xs text-muted-foreground">
                {streak} {language === 'ru'
                  ? streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'
                  : streak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ==================== Streak Calculator ====================

function calculateStreak(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0;

  // Get unique dates sorted descending
  const uniqueDates = [...new Set(entries.map((e) => e.date))].sort((a, b) => b.localeCompare(a));

  const today = getTodayString();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();

  // Streak must start from today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
    const curr = new Date(uniqueDates[i] + 'T00:00:00');
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ==================== Create Entry Sheet ====================

function CreateEntrySheet({
  open,
  onClose,
  language,
  accentColor,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
  defaultDate: string;
}) {
  const createEntry = useDiaryStore((s) => s.createEntry);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [xpResult, setXpResult] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreate = async () => {
    if (!content.trim()) return;
    setIsCreating(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const result = await createEntry({
      date: defaultDate,
      title: title.trim() || undefined,
      content: content.trim(),
      mood: mood || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    // Show XP notification
    if (result && result.length > 0) {
      const totalXP = result.reduce((sum, e) => sum + e.amount, 0);
      setXpResult(
        language === 'ru'
          ? `+${totalXP} XP (Харизма)!`
          : `+${totalXP} XP (Charisma)!`
      );
      setTimeout(() => setXpResult(null), 3000);
    }

    setTitle('');
    setContent('');
    setMood(null);
    setTagsInput('');
    setIsCreating(false);
    onClose();
  };

  // Auto-resize textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Новая запись' : 'New Entry'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-3 overflow-y-auto flex-1 pb-1">
          {/* Date indicator */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(defaultDate, language)}
            </span>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Настроение' : 'Mood'}
            </label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMood(mood === opt.value ? null : opt.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    mood === opt.value
                      ? 'ring-2 scale-110'
                      : 'hover:bg-muted/50'
                  }`}
                  style={mood === opt.value ? { '--tw-ring-color': accentColor, backgroundColor: `${accentColor}12` } as React.CSSProperties : undefined}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-[9px] font-medium text-muted-foreground">
                    {language === 'ru' ? opt.labelRu : opt.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Заголовок (необязательно)' : 'Title (optional)'}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ru' ? 'О чём эта запись?' : 'What is this entry about?'}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Содержание' : 'Content'}
            </label>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder={
                language === 'ru'
                  ? 'Расскажите, как прошёл день...'
                  : 'Tell me about your day...'
              }
              className="min-h-[120px] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">
                {content.length} / 500
              </span>
              {content.length >= 500 && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-medium"
                  style={{ color: accentColor }}
                >
                  +12 XP {language === 'ru' ? 'за длинную запись!' : 'for long entry!'}
                </motion.span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Теги (через запятую)' : 'Tags (comma separated)'}
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={language === 'ru' ? 'личное, работа, здоровье' : 'personal, work, health'}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!content.trim() || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Сохранение...' : 'Saving...'
              : language === 'ru' ? 'Сохранить запись' : 'Save Entry'}
          </Button>

          {/* XP notification */}
          {xpResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center py-2 rounded-xl font-bold text-sm"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {xpResult}
            </motion.div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ==================== Edit Entry Form ====================

function EditEntryForm({
  entry,
  onClose,
  language,
  accentColor,
}: {
  entry: DiaryEntry;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const updateEntry = useDiaryStore((s) => s.updateEntry);
  const [title, setTitle] = useState(entry.title || '');
  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState<string | null>(entry.mood);
  const [tagsInput, setTagsInput] = useState(entry.tags?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    await updateEntry(entry.id, {
      title: title.trim() || null,
      content: content.trim(),
      mood: mood || null,
      tags,
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="space-y-5 mt-3 overflow-y-auto flex-1 pb-1">
      {/* Mood Selector */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          {language === 'ru' ? 'Настроение' : 'Mood'}
        </label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                mood === opt.value
                  ? 'ring-2 scale-110'
                  : 'hover:bg-muted/50'
              }`}
              style={mood === opt.value ? { '--tw-ring-color': accentColor, backgroundColor: `${accentColor}12` } as React.CSSProperties : undefined}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-[9px] font-medium text-muted-foreground">
                {language === 'ru' ? opt.labelRu : opt.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          {language === 'ru' ? 'Заголовок' : 'Title'}
        </label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Content */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          {language === 'ru' ? 'Содержание' : 'Content'}
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">
            {content.length} / 500
          </span>
          {content.length >= 500 && (
            <span className="text-[10px] font-medium" style={{ color: accentColor }}>
              +12 XP
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          {language === 'ru' ? 'Теги' : 'Tags'}
        </label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!content.trim() || isSaving}
        className="w-full"
        style={{ backgroundColor: accentColor }}
      >
        {isSaving
          ? language === 'ru' ? 'Сохранение...' : 'Saving...'
          : language === 'ru' ? 'Сохранить' : 'Save'}
      </Button>
    </div>
  );
}
