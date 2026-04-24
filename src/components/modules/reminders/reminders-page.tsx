'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Bell } from 'lucide-react';
import { ModuleTabs, PageHeader } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useRemindersStore, type ReminderItem } from '@/store/reminders-store';
import type { TabItem } from '@/types';
import { PRESETS, type ReminderFormValues } from './constants';
import { ReminderCard } from './components/reminder-card';
import { ReminderFormSheet } from './components/reminder-form-sheet';
import { defaultReminderForm, formatISODate, getQuickDate, getTodayISO, parseNaturalInput } from './utils';

const PRESETS = [
  { key: 'water', icon: '💧', titleEn: 'Drink water', titleRu: 'Выпить воду', category: 'health', priority: 'normal' },
  { key: 'training', icon: '🏋️', titleEn: 'Workout', titleRu: 'Тренировка', category: 'health', priority: 'high' },
  { key: 'bill', icon: '🧾', titleEn: 'Pay bill', titleRu: 'Оплатить счет', category: 'finance', priority: 'high' },
  { key: 'call', icon: '📞', titleEn: 'Call', titleRu: 'Позвонить', category: 'personal', priority: 'normal' },
] as const;

const WEEKDAY_MAP: Record<string, number> = {
  mon: 1, monday: 1, пн: 1, понедельник: 1,
  tue: 2, tuesday: 2, вт: 2, вторник: 2,
  wed: 3, wednesday: 3, ср: 3, среда: 3,
  thu: 4, thursday: 4, чт: 4, четверг: 4,
  fri: 5, friday: 5, пт: 5, пятница: 5,
  sat: 6, saturday: 6, сб: 6, суббота: 6,
  sun: 0, sunday: 0, вс: 0, воскресенье: 0,
};

type ReminderForm = {
  title: string;
  description: string;
  date: string;
  time: string;
  priority: string;
  category: string;
};

function formatISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

function getTodayISO() {
  return formatISODate(new Date());
}

function nextWeekday(baseDate: Date, weekday: number) {
  const date = new Date(baseDate);
  const diff = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function normalizeTime(time: string) {
  const [rawHours, rawMinutes] = time.split(':');
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseNaturalInput(value: string, now: Date) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const fullPattern = /^(today|tomorrow|сегодня|завтра|[\p{L}]+)\s+(\d{1,2}:\d{2})\s+(.+)$/iu;
  const dateOnlyPattern = /^(today|tomorrow|сегодня|завтра|[\p{L}]+)\s+(.+)$/iu;

  const full = trimmed.match(fullPattern);
  if (full) {
    const [, tokenRaw, timeRaw, titleRaw] = full;
    const token = tokenRaw.toLowerCase();
    const time = normalizeTime(timeRaw);
    if (!time) return null;
    const parsedDate = parseDateToken(token, now);
    if (!parsedDate) return null;
    return { date: formatISODate(parsedDate), time, title: titleRaw.trim() };
  }

  const dateOnly = trimmed.match(dateOnlyPattern);
  if (dateOnly) {
    const [, tokenRaw, titleRaw] = dateOnly;
    const token = tokenRaw.toLowerCase();
    const parsedDate = parseDateToken(token, now);
    if (!parsedDate) return null;
    return { date: formatISODate(parsedDate), time: '', title: titleRaw.trim() };
  }

  return null;
}

function parseDateToken(token: string, now: Date) {
  if (token === 'today' || token === 'сегодня') return new Date(now);
  if (token === 'tomorrow' || token === 'завтра') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (WEEKDAY_MAP[token] !== undefined) {
    return nextWeekday(now, WEEKDAY_MAP[token]);
  }
  return null;
}

function getWeekendDate(baseDate: Date) {
  const date = new Date(baseDate);
  const day = date.getDay();
  if (day === 6 || day === 0) return date;
  date.setDate(date.getDate() + (6 - day));
  return date;
}

function defaultForm(): ReminderForm {
  return { title: '', description: '', date: getTodayISO(), time: '', priority: 'normal', category: 'general' };
}

export function RemindersPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.reminders;
  const { reminders, isLoading, loadReminders, addReminder, completeReminder, updateReminder, deleteReminder } = useRemindersStore();

  const [activeTab, setActiveTab] = useState('today');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ReminderFormValues>(defaultReminderForm());
  const [parseHint, setParseHint] = useState('');

  useEffect(() => { loadReminders(true); }, [loadReminders]);

  const today = getTodayISODate();
  const todayReminders = reminders.filter((r) => r.date === today && !r.isCompleted);
  const upcomingReminders = reminders.filter((r) => r.date > today && !r.isCompleted).sort((a, b) => a.date.localeCompare(b.date));
  const overdueReminders = reminders.filter((r) => r.date < today && !r.isCompleted).sort((a, b) => a.date.localeCompare(b.date));
  const completedReminders = reminders.filter((r) => r.isCompleted);

  const tabs: TabItem[] = [
    { id: 'today', label: language === 'ru' ? 'Сегодня' : 'Today' },
    { id: 'upcoming', label: language === 'ru' ? 'Предстоящие' : 'Upcoming' },
    { id: 'completed', label: language === 'ru' ? 'Завершённые' : 'Completed' },
  ];

  const groupedUpcoming = upcomingReminders.reduce<Record<string, ReminderItem[]>>((acc, reminder) => {
    if (!acc[reminder.date]) acc[reminder.date] = [];
    acc[reminder.date].push(reminder);
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await addReminder({
      title: form.title.trim(),
      description: form.description || undefined,
      date: form.date,
      time: form.time || undefined,
      priority: form.priority,
      category: form.category,
    });
    setForm(defaultReminderForm());
    setParseHint('');
    setIsOpen(false);
  };

  const handleTitleChange = (value: string) => {
    const parsed = parseReminderInput(value, new Date());
    if (!parsed) {
      setParseHint('');
      setForm((prev) => ({ ...prev, title: value }));
      return;
    }

    setForm((prev) => ({ ...prev, title: parsed.title, date: parsed.date, time: parsed.time }));
    setParseHint(language === 'ru' ? `Распознано: ${parsed.date}${parsed.time ? ` ${parsed.time}` : ''}` : `Parsed: ${parsed.date}${parsed.time ? ` ${parsed.time}` : ''}`);
  };

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'weekend') => {
    const { date, defaultTime } = getQuickDate(type);
    setForm((prev) => ({ ...prev, date, time: prev.time || defaultTime }));
  };

  const handlePreset = (presetKey: string) => {
    const preset = PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      title: language === 'ru' ? preset.titleRu : preset.titleEn,
      category: preset.category,
      priority: preset.priority,
    }));
  };

  const reschedulePlusOneDay = async (reminder: ReminderItem) => {
    const nextDate = new Date(reminder.date);
    nextDate.setDate(nextDate.getDate() + 1);
    await updateReminder(reminder.id, { date: formatISODate(nextDate) });
  };

  const reschedulePlusOneDay = async (reminder: ReminderItem) => {
    const nextDate = new Date(reminder.date);
    nextDate.setDate(nextDate.getDate() + 1);
    await updateReminder(reminder.id, { date: toISODate(nextDate) });
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={language === 'ru' ? 'Напоминания' : 'Reminders'} icon={Bell} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Не забудьте ничего' : "Don't forget anything"} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {overdueReminders.length > 0 && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{language === 'ru' ? 'Просрочено' : 'Overdue'} ({overdueReminders.length})</div>
            {overdueReminders.map((r) => <ReminderCard key={r.id} reminder={r} language={language} isOverdue onComplete={completeReminder} onDelete={deleteReminder} onReschedule={reschedulePlusOneDay} />)}
          </div>
        )}

        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'today' && (
          <div className="space-y-2">
            {todayReminders.length === 0
              ? <div className="py-8 text-center"><span className="text-3xl">🎉</span><p className="mt-2 text-sm text-muted-foreground">{language === 'ru' ? 'Нет напоминаний на сегодня' : 'No reminders today'}</p></div>
              : todayReminders.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="space-y-3">
            {Object.keys(groupedUpcoming).length === 0
              ? <p className="py-4 text-center text-sm text-muted-foreground">{language === 'ru' ? 'Нет предстоящих напоминаний' : 'No upcoming reminders'}</p>
              : Object.entries(groupedUpcoming).map(([date, items]) => (
                <div key={date} className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{new Date(date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                  {items.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
                </div>
              ))}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-2">
            {completedReminders.length === 0
              ? <p className="py-4 text-center text-sm text-muted-foreground">{language === 'ru' ? 'Нет завершённых' : 'No completed reminders'}</p>
              : completedReminders.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
          </div>
        )}
      </div>

      <ReminderFormSheet
        language={language}
        accentColor={config.accentColor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        form={form}
        parseHint={parseHint}
        isLoading={isLoading}
        onTitleChange={handleTitleChange}
        onQuickDate={handleQuickDate}
        onPreset={handlePreset}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleAdd}
      />
    </div>
  );
}
