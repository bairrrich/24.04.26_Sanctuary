'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Trash2, X, Check, RotateCcw } from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import {
  useCalendarStore,
  type CalendarEvent,
} from '@/store/calendar-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { TabItem } from '@/types';

// ==================== Constants ====================

export const EVENT_TYPES = [
  { id: 'personal', emoji: '👤', labelEn: 'Personal', labelRu: 'Личное', color: '#6366f1' },
  { id: 'work', emoji: '💼', labelEn: 'Work', labelRu: 'Работа', color: '#f97316' },
  { id: 'health', emoji: '❤️', labelEn: 'Health', labelRu: 'Здоровье', color: '#22c55e' },
  { id: 'social', emoji: '🎉', labelEn: 'Social', labelRu: 'Встреча', color: '#ec4899' },
  { id: 'finance', emoji: '💰', labelEn: 'Finance', labelRu: 'Финансы', color: '#14b8a6' },
  { id: 'training', emoji: '💪', labelEn: 'Training', labelRu: 'Тренировка', color: '#ef4444' },
  { id: 'other', emoji: '📌', labelEn: 'Other', labelRu: 'Другое', color: '#94a3b8' },
];

export const COLOR_PRESETS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444',
];

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAYS_FULL_RU = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const WEEKDAYS_FULL_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FREQ_OPTIONS = [
  { id: 'daily', labelEn: 'Daily', labelRu: 'Ежедневно' },
  { id: 'weekly', labelEn: 'Weekly', labelRu: 'Еженедельно' },
  { id: 'monthly', labelEn: 'Monthly', labelRu: 'Ежемесячно' },
];

const RECUR_DAYS = [
  { id: 'mon', labelEn: 'Mon', labelRu: 'Пн' },
  { id: 'tue', labelEn: 'Tue', labelRu: 'Вт' },
  { id: 'wed', labelEn: 'Wed', labelRu: 'Ср' },
  { id: 'thu', labelEn: 'Thu', labelRu: 'Чт' },
  { id: 'fri', labelEn: 'Fri', labelRu: 'Пт' },
  { id: 'sat', labelEn: 'Sat', labelRu: 'Сб' },
  { id: 'sun', labelEn: 'Sun', labelRu: 'Вс' },
];

// ==================== Helpers ====================

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function addMonths(dateStr: string, months: number): string {
  const [y, m] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthName(dateStr: string, language: 'en' | 'ru'): string {
  const [, m] = dateStr.split('-').map(Number);
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  return language === 'ru' ? monthsRu[m - 1] : monthsEn[m - 1];
}

function getCalendarDays(dateStr: string): Array<{ date: string; day: number; isCurrentMonth: boolean }> {
  const [year, month] = dateStr.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

  // Previous month overflow
  const prevMonthLast = new Date(year, month - 1, 0);
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthLast.getDate() - i;
    const pm = month - 1 < 1 ? 12 : month - 1;
    const py = month - 1 < 1 ? year - 1 : year;
    days.push({
      date: `${py}-${String(pm).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: true,
    });
  }

  // Next month overflow (fill to 42 cells = 6 rows)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nm = month + 1 > 12 ? 1 : month + 1;
    const ny = month + 1 > 12 ? year + 1 : year;
    days.push({
      date: `${ny}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: false,
    });
  }

  return days;
}

function getEventTypeConfig(type: string) {
  return EVENT_TYPES.find((t) => t.id === type) ?? EVENT_TYPES[EVENT_TYPES.length - 1];
}

// ==================== Main Page ====================

export function CalendarPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.calendar;
  const loadMonthEvents = useCalendarStore((s) => s.loadMonthEvents);
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);
  const events = useCalendarStore((s) => s.events);

  const [activeTab, setActiveTab] = useState('calendar');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMonth, setViewMonth] = useState(getTodayString().slice(0, 7) + '-01');

  useEffect(() => {
    loadMonthEvents(viewMonth);
  }, [viewMonth, loadMonthEvents]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'calendar', label: language === 'ru' ? 'Календарь' : 'Calendar' },
    { id: 'events', label: language === 'ru' ? 'События' : 'Events' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setShowCreateSheet(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowCreateSheet(true);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Календарь' : 'Calendar'}
        icon={Calendar}
        accentColor={config.accentColor}
        subtitle={
          events.length > 0
            ? `${events.length} ${language === 'ru' ? 'событий' : 'events'}`
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

        {activeTab === 'calendar' && (
          <CalendarTab
            language={language}
            accentColor={config.accentColor}
            viewMonth={viewMonth}
            onViewMonthChange={setViewMonth}
            onEditEvent={handleEditEvent}
          />
        )}
        {activeTab === 'events' && (
          <EventsTab
            language={language}
            accentColor={config.accentColor}
            onEditEvent={handleEditEvent}
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
        onClick={handleOpenCreate}
      />

      <CreateEventSheet
        open={showCreateSheet}
        onClose={() => { setShowCreateSheet(false); setEditingEvent(null); }}
        language={language}
        accentColor={config.accentColor}
        editEvent={editingEvent}
      />
    </div>
  );
}

// ==================== Calendar Tab ====================

function CalendarTab({
  language,
  accentColor,
  viewMonth,
  onViewMonthChange,
  onEditEvent,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  viewMonth: string;
  onViewMonthChange: (m: string) => void;
  onEditEvent: (e: CalendarEvent) => void;
}) {
  const events = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const completeEvent = useCalendarStore((s) => s.completeEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);

  const today = getTodayString();
  const weekdays = language === 'ru' ? WEEKDAYS_RU : WEEKDAYS_EN;
  const calendarDays = useMemo(() => getCalendarDays(viewMonth), [viewMonth]);
  const monthYear = `${getMonthName(viewMonth, language)} ${viewMonth.slice(0, 4)}`;

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  const selectedDayEvents = eventsByDate[selectedDate] ?? [];

  const handlePrevMonth = () => onViewMonthChange(addMonths(viewMonth, -1));
  const handleNextMonth = () => onViewMonthChange(addMonths(viewMonth, 1));
  const handleToday = () => {
    const todayStr = getTodayString();
    onViewMonthChange(todayStr.slice(0, 7) + '-01');
    setSelectedDate(todayStr);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Month Navigation */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h3 className="text-sm font-semibold">{monthYear}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              onClick={handleToday}
              style={{ color: accentColor }}
            >
              {language === 'ru' ? 'Сегодня' : 'Today'}
            </Button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {weekdays.map((wd) => (
            <div key={wd} className="text-center text-[10px] text-muted-foreground font-medium py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day) => {
            const dayEvents = eventsByDate[day.date] ?? [];
            const isToday = day.date === today;
            const isSelected = day.date === selectedDate;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  relative flex flex-col items-center py-1.5 rounded-lg transition-colors
                  ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'}
                  ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                `}
              >
                <span
                  className={`
                    text-sm leading-none font-medium
                    ${isToday && !isSelected ? 'rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    ${isToday && isSelected ? 'rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}
                  style={isToday && isSelected ? { backgroundColor: accentColor, color: 'white' } : isToday ? { outline: `2px solid ${accentColor}`, outlineOffset: '1px', borderRadius: '9999px' } : undefined}
                >
                  {day.day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((e, i) => {
                      const typeConfig = getEventTypeConfig(e.type);
                      return (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: e.isCompleted
                              ? '#94a3b8'
                              : e.color ?? typeConfig.color,
                          }}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] text-muted-foreground ml-0.5">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {selectedDate === today
              ? language === 'ru' ? 'Сегодня' : 'Today'
              : selectedDate}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {selectedDayEvents.length} {language === 'ru' ? 'событий' : 'events'}
          </Badge>
        </div>
        {selectedDayEvents.length > 0 ? (
          <div className="divide-y">
            {selectedDayEvents
              .sort((a, b) => (a.timeStart ?? '').localeCompare(b.timeStart ?? ''))
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  language={language}
                  accentColor={accentColor}
                  onEdit={onEditEvent}
                  onComplete={() => completeEvent(event.id)}
                  onDelete={() => deleteEvent(event.id)}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title={language === 'ru' ? 'Нет событий' : 'No events'}
            description={language === 'ru' ? 'Нажмите + чтобы добавить событие' : 'Tap + to add an event'}
            accentColor={accentColor}
          />
        )}
      </div>
    </motion.div>
  );
}

// ==================== Events Tab ====================

function EventsTab({
  language,
  accentColor,
  onEditEvent,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  onEditEvent: (e: CalendarEvent) => void;
}) {
  const events = useCalendarStore((s) => s.events);
  const completeEvent = useCalendarStore((s) => s.completeEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);

  const today = getTodayString();
  const todayPlus7 = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const upcoming = events
    .filter((e) => !e.isCompleted && e.date >= today && e.date <= todayPlus7)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.timeStart ?? '').localeCompare(b.timeStart ?? ''));

  const later = events
    .filter((e) => !e.isCompleted && e.date > todayPlus7)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.timeStart ?? '').localeCompare(b.timeStart ?? ''));

  const completed = events
    .filter((e) => e.isCompleted)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const sections = [
    { key: 'upcoming', title: language === 'ru' ? 'Ближайшие' : 'Upcoming', events: upcoming, icon: '⏰' },
    { key: 'later', title: language === 'ru' ? 'Позже' : 'Later', events: later, icon: '📅' },
    { key: 'completed', title: language === 'ru' ? 'Завершённые' : 'Completed', events: completed, icon: '✅' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {sections.map((section) =>
        section.events.length > 0 ? (
          <div key={section.key} className="rounded-2xl border bg-card overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b">
              <span className="text-sm">{section.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </span>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {section.events.length}
              </Badge>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {section.events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  language={language}
                  accentColor={accentColor}
                  onEdit={onEditEvent}
                  onComplete={() => completeEvent(event.id)}
                  onDelete={() => deleteEvent(event.id)}
                />
              ))}
            </div>
          </div>
        ) : null
      )}

      {upcoming.length === 0 && later.length === 0 && completed.length === 0 && (
        <EmptyState
          icon={Calendar}
          title={language === 'ru' ? 'Нет событий' : 'No events'}
          description={language === 'ru' ? 'Создайте первое событие!' : 'Create your first event!'}
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Event Card ====================

function EventCard({
  event,
  language,
  accentColor,
  onEdit,
  onComplete,
  onDelete,
}: {
  event: CalendarEvent;
  language: 'en' | 'ru';
  accentColor: string;
  onEdit: (event: CalendarEvent) => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const typeConfig = getEventTypeConfig(event.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 ${event.isCompleted ? 'opacity-50' : ''}`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${typeConfig.color}20` }}
      >
        <span className="text-base">{typeConfig.emoji}</span>
      </div>
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit(event)}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${event.isCompleted ? 'line-through' : ''}`}>
            {event.title}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-0.5 items-center">
          {(event.timeStart || event.timeEnd) && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              {event.timeStart ?? '?'}{event.timeEnd ? `–${event.timeEnd}` : ''}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0"
            style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
          >
            {language === 'ru' ? typeConfig.labelRu : typeConfig.labelEn}
          </Badge>
          {event.location && (
            <span className="text-[10px] text-muted-foreground truncate">
              <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
              {event.location}
            </span>
          )}
          {event.isRecurring && (
            <span className="text-[10px] text-muted-foreground">
              <RotateCcw className="h-2.5 w-2.5 inline" />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!event.isCompleted && (
          <button
            onClick={onComplete}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title={language === 'ru' ? 'Завершить' : 'Complete'}
          >
            <Check className="h-4 w-4" style={{ color: accentColor }} />
          </button>
        )}
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {showActions && (
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

// ==================== Analytics Tab ====================

function AnalyticsTab({
  language,
  accentColor,
}: {
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const events = useCalendarStore((s) => s.events);
  const today = getTodayString();
  const currentMonth = today.slice(0, 7);

  // Events this month
  const thisMonthEvents = events.filter((e) => e.date.startsWith(currentMonth));
  const completedEvents = events.filter((e) => e.isCompleted);
  const attendanceRate = events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0;

  // Events by type
  const typeCount: Record<string, number> = {};
  for (const e of events) {
    typeCount[e.type] = (typeCount[e.type] || 0) + 1;
  }
  const typeChartData = EVENT_TYPES
    .map((t) => ({
      name: language === 'ru' ? t.labelRu : t.labelEn,
      count: typeCount[t.id] || 0,
      fill: t.color,
    }))
    .filter((d) => d.count > 0);

  // Most active day of week
  const dayCount: Record<number, number> = {};
  for (const e of events) {
    const d = new Date(e.date + 'T00:00:00');
    const dow = d.getDay();
    dayCount[dow] = (dayCount[dow] || 0) + 1;
  }
  const mostActiveDay = Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0];
  const mostActiveDayName = mostActiveDay
    ? (language === 'ru' ? WEEKDAYS_FULL_RU : WEEKDAYS_FULL_EN)[mostActiveDay[0] === '0' ? 6 : Number(mostActiveDay[0]) - 1]
    : '—';

  // Streak of daily events
  const uniqueDates = [...new Set(events.filter((e) => !e.isCompleted || e.date >= today).map((e) => e.date))].sort().reverse();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const checkDate = new Date(today + 'T00:00:00');
    for (const dateStr of uniqueDates) {
      const expected = checkDate.toISOString().split('T')[0];
      if (dateStr === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr < expected) {
        break;
      }
    }
  }

  const stats = [
    { label: language === 'ru' ? 'В этом месяце' : 'This Month', value: thisMonthEvents.length, icon: '📅' },
    { label: language === 'ru' ? 'Посещаемость' : 'Attendance', value: `${attendanceRate}%`, icon: '✅' },
    { label: language === 'ru' ? 'Самый активный день' : 'Most Active Day', value: mostActiveDayName, icon: '🔥' },
    { label: language === 'ru' ? 'Серия дней' : 'Day Streak', value: streak, icon: '⚡' },
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
            <p className="text-lg font-bold mt-1" style={{ color: accentColor }}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Events by Type Chart */}
      {typeChartData.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'События по типу' : 'Events by Type'}
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={70} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {typeChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <EmptyState
          icon={Calendar}
          title={language === 'ru' ? 'Недостаточно данных' : 'Not enough data'}
          description={language === 'ru' ? 'Добавляйте события для аналитики' : 'Add events for analytics'}
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Create/Edit Event Sheet ====================

function CreateEventSheet({
  open,
  onClose,
  language,
  accentColor,
  editEvent,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
  editEvent: CalendarEvent | null;
}) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  // Use key-based approach to reset form when open/editEvent changes
  const formKey = editEvent?.id ?? 'new';

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editEvent
              ? language === 'ru' ? 'Редактировать событие' : 'Edit Event'
              : language === 'ru' ? 'Новое событие' : 'New Event'}
          </SheetTitle>
        </SheetHeader>
        <EventForm
          key={formKey}
          editEvent={editEvent}
          selectedDate={selectedDate}
          language={language}
          accentColor={accentColor}
          onSave={() => onClose()}
        />
      </SheetContent>
    </Sheet>
  );
}

// ==================== Event Form ====================

function EventForm({
  editEvent,
  selectedDate,
  language,
  accentColor,
  onSave,
}: {
  editEvent: CalendarEvent | null;
  selectedDate: string;
  language: 'en' | 'ru';
  accentColor: string;
  onSave: () => void;
}) {
  const addEvent = useCalendarStore((s) => s.addEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);

  const [title, setTitle] = useState(editEvent?.title ?? '');
  const [description, setDescription] = useState(editEvent?.description ?? '');
  const [date, setDate] = useState(editEvent?.date ?? selectedDate);
  const [timeStart, setTimeStart] = useState(editEvent?.timeStart ?? '');
  const [timeEnd, setTimeEnd] = useState(editEvent?.timeEnd ?? '');
  const [type, setType] = useState(editEvent?.type ?? 'personal');
  const [location, setLocation] = useState(editEvent?.location ?? '');
  const [isRecurring, setIsRecurring] = useState(editEvent?.isRecurring ?? false);
  const [recurFreq, setRecurFreq] = useState(editEvent?.recurRule?.freq ?? 'weekly');
  const [recurDays, setRecurDays] = useState<string[]>(editEvent?.recurRule?.days ?? []);
  const [color, setColor] = useState<string | null>(editEvent?.color ?? null);
  const [isCreating, setIsCreating] = useState(false);

  const toggleRecurDay = (day: string) => {
    setRecurDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsCreating(true);

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      date,
      timeStart: timeStart || null,
      timeEnd: timeEnd || null,
      type,
      location: location.trim() || null,
      isRecurring,
      recurRule: isRecurring ? { freq: recurFreq, days: recurDays } : null,
      color,
    };

    if (editEvent) {
      await updateEvent(editEvent.id, data);
    } else {
      await addEvent(data);
    }

    onSave();
  };

  return (
    <div className="space-y-4 mt-4 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Название' : 'Title'} *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ru' ? 'Название события' : 'Event title'}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Описание' : 'Description'}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ru' ? 'Необязательно' : 'Optional'}
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Date */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Дата' : 'Date'}
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                {language === 'ru' ? 'Начало' : 'Start'}
              </Label>
              <Input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {language === 'ru' ? 'Конец' : 'End'}
              </Label>
              <Input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {language === 'ru' ? 'Тип' : 'Type'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    type === t.id
                      ? 'border-transparent shadow-sm'
                      : 'border-border bg-background'
                  }`}
                  style={type === t.id ? { backgroundColor: `${t.color}20`, color: t.color } : undefined}
                >
                  <span>{t.emoji}</span>
                  {language === 'ru' ? t.labelRu : t.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Место' : 'Location'}
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={language === 'ru' ? 'Необязательно' : 'Optional'}
              className="mt-1"
            />
          </div>

          {/* Color Picker */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {language === 'ru' ? 'Цвет' : 'Color'}
            </Label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? null : c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Повторяющееся' : 'Recurring'}
            </Label>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              {/* Frequency */}
              <div className="flex gap-2">
                {FREQ_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRecurFreq(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      recurFreq === f.id
                        ? 'border-transparent shadow-sm'
                        : 'border-border bg-background'
                    }`}
                    style={recurFreq === f.id ? { backgroundColor: `${accentColor}15`, color: accentColor } : undefined}
                  >
                    {language === 'ru' ? f.labelRu : f.labelEn}
                  </button>
                ))}
              </div>

              {/* Weekly days */}
              {recurFreq === 'weekly' && (
                <div className="flex gap-1.5">
                  {RECUR_DAYS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleRecurDay(d.id)}
                      className={`h-7 w-7 rounded-lg text-[10px] font-medium transition-all border flex items-center justify-center ${
                        recurDays.includes(d.id)
                          ? 'border-transparent'
                          : 'border-border bg-background'
                      }`}
                      style={recurDays.includes(d.id) ? { backgroundColor: `${accentColor}15`, color: accentColor } : undefined}
                    >
                      {language === 'ru' ? d.labelRu : d.labelEn}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Сохранение...' : 'Saving...'
              : editEvent
                ? language === 'ru' ? 'Сохранить' : 'Save'
                : language === 'ru' ? 'Создать' : 'Create'}
          </Button>
        </div>
  );
}
