'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { PageHeader, ModuleTabs, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useRemindersStore, type ReminderItem } from '@/store/reminders-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SPACING } from '@/lib/constants';
import type { TabItem } from '@/types';

const PRIORITIES = [
  { value: 'low', labelEn: 'Low', labelRu: 'Низкий', color: '#94a3b8', icon: '🟢' },
  { value: 'normal', labelEn: 'Normal', labelRu: 'Обычный', color: '#3b82f6', icon: '🔵' },
  { value: 'high', labelEn: 'High', labelRu: 'Высокий', color: '#f97316', icon: '🟠' },
  { value: 'urgent', labelEn: 'Urgent', labelRu: 'Срочный', color: '#ef4444', icon: '🔴' },
];

const CATEGORIES = [
  { value: 'general', icon: '📌', labelEn: 'General', labelRu: 'Общее' },
  { value: 'health', icon: '❤️', labelEn: 'Health', labelRu: 'Здоровье' },
  { value: 'finance', icon: '💰', labelEn: 'Finance', labelRu: 'Финансы' },
  { value: 'work', icon: '💼', labelEn: 'Work', labelRu: 'Работа' },
  { value: 'personal', icon: '👤', labelEn: 'Personal', labelRu: 'Личное' },
];

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
  const [form, setForm] = useState<ReminderForm>(defaultForm());
  const [parseHint, setParseHint] = useState('');

  useEffect(() => { loadReminders(true); }, [loadReminders]);

  const today = getTodayISO();
  const todayReminders = reminders.filter((r) => r.date === today && !r.isCompleted);
  const upcomingReminders = reminders.filter((r) => r.date > today && !r.isCompleted).sort((a, b) => a.date.localeCompare(b.date));
  const overdueReminders = reminders.filter((r) => r.date < today && !r.isCompleted).sort((a, b) => a.date.localeCompare(b.date));
  const completedReminders = reminders.filter((r) => r.isCompleted);

  const tabs: TabItem[] = [
    { id: 'today', label: language === 'ru' ? 'Сегодня' : 'Today' },
    { id: 'upcoming', label: language === 'ru' ? 'Предстоящие' : 'Upcoming' },
    { id: 'completed', label: language === 'ru' ? 'Завершённые' : 'Completed' },
  ];

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
    setIsOpen(false);
    setForm(defaultForm());
    setParseHint('');
  };

  const handleTitleChange = (value: string) => {
    const parsed = parseNaturalInput(value, new Date());
    if (!parsed) {
      setParseHint('');
      setForm((prev) => ({ ...prev, title: value }));
      return;
    }

    setForm((prev) => ({ ...prev, title: parsed.title, date: parsed.date, time: parsed.time }));
    setParseHint(language === 'ru' ? `Распознано: ${parsed.date}${parsed.time ? ` ${parsed.time}` : ''}` : `Parsed: ${parsed.date}${parsed.time ? ` ${parsed.time}` : ''}`);
  };

  const applyQuickDate = (type: 'today' | 'tomorrow' | 'weekend') => {
    const now = new Date();
    const target = type === 'today'
      ? now
      : type === 'tomorrow'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        : getWeekendDate(now);
    const defaultTime = type === 'today' ? '18:00' : type === 'tomorrow' ? '09:00' : '10:00';
    setForm((prev) => ({ ...prev, date: formatISODate(target), time: prev.time || defaultTime }));
  };

  const groupedUpcoming = (() => {
    const groups: Record<string, ReminderItem[]> = {};
    for (const r of upcomingReminders) {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    }
    return groups;
  })();

  const reschedulePlusOneDay = async (reminder: ReminderItem) => {
    const nextDate = new Date(reminder.date);
    nextDate.setDate(nextDate.getDate() + 1);
    await updateReminder(reminder.id, { date: formatISODate(nextDate) });
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={language === 'ru' ? 'Напоминания' : 'Reminders'} icon={Bell} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Не забудьте ничего' : "Don't forget anything"} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {overdueReminders.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{language === 'ru' ? 'Просрочено' : 'Overdue'} ({overdueReminders.length})</div>
            {overdueReminders.map((r) => (
              <ReminderCard key={r.id} reminder={r} language={language} isOverdue onComplete={completeReminder} onDelete={deleteReminder} onReschedule={reschedulePlusOneDay} />
            ))}
          </div>
        )}

        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'today' && (
          <div className="space-y-2">
            {todayReminders.length === 0 ? (
              <div className="py-8 text-center"><span className="text-3xl">🎉</span><p className="text-sm text-muted-foreground mt-2">{language === 'ru' ? 'Нет напоминаний на сегодня' : 'No reminders today'}</p></div>
            ) : todayReminders.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="space-y-3">
            {Object.keys(groupedUpcoming).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{language === 'ru' ? 'Нет предстоящих напоминаний' : 'No upcoming reminders'}</p>
            ) : Object.entries(groupedUpcoming).map(([date, items]) => (
              <div key={date} className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{new Date(date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                {items.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-2">
            {completedReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{language === 'ru' ? 'Нет завершённых' : 'No completed reminders'}</p>
            ) : completedReminders.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
          </div>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild><FAB accentColor={config.accentColor} onClick={() => setIsOpen(true)} /></SheetTrigger>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Новое напоминание' : 'New Reminder'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Заголовок' : 'Title'}</label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={language === 'ru' ? 'Пример: завтра 19:00 тренировка' : 'Example: tomorrow 19:00 workout'}
                autoFocus
              />
              {!!parseHint && <p className="mt-1 text-[11px] text-emerald-600">{parseHint}</p>}
            </div>

            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Быстрые даты' : 'Quick dates'}</label>
              <div className="mt-1 flex gap-2">
                <button onClick={() => applyQuickDate('today')} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">{language === 'ru' ? 'Сегодня' : 'Today'}</button>
                <button onClick={() => applyQuickDate('tomorrow')} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">{language === 'ru' ? 'Завтра' : 'Tomorrow'}</button>
                <button onClick={() => applyQuickDate('weekend')} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">{language === 'ru' ? 'Выходные' : 'This weekend'}</button>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Шаблоны' : 'Presets'}</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setForm((prev) => ({ ...prev, title: language === 'ru' ? preset.titleRu : preset.titleEn, category: preset.category, priority: preset.priority }))}
                    className="rounded-lg border px-2 py-1.5 text-left text-xs"
                  >
                    {preset.icon} {language === 'ru' ? preset.titleRu : preset.titleEn}
                  </button>
                ))}
              </div>
            </div>

            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Время' : 'Time'}</label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Приоритет' : 'Priority'}</label>
              <div className="flex gap-2 mt-1 flex-wrap">{PRIORITIES.map((p) => (
                <button key={p.value} onClick={() => setForm({ ...form, priority: p.value })} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${form.priority === p.value ? 'text-white' : 'bg-muted'}`} style={form.priority === p.value ? { backgroundColor: p.color } : {}}>{p.icon} {language === 'ru' ? p.labelRu : p.labelEn}</button>
              ))}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Категория' : 'Category'}</label>
              <div className="flex gap-2 mt-1 flex-wrap">{CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => setForm({ ...form, category: c.value })} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{c.icon} {language === 'ru' ? c.labelRu : c.labelEn}</button>
              ))}</div>
            </div>
            <Button onClick={handleAdd} disabled={!form.title.trim() || isLoading} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ReminderCard({
  reminder,
  language,
  onComplete,
  onDelete,
  isOverdue,
  onReschedule,
}: {
  reminder: ReminderItem;
  language: 'en' | 'ru';
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isOverdue?: boolean;
  onReschedule?: (reminder: ReminderItem) => Promise<void>;
}) {
  const prio = PRIORITIES.find((p) => p.value === reminder.priority) ?? PRIORITIES[1];
  const cat = CATEGORIES.find((c) => c.value === reminder.category) ?? CATEGORIES[0];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border bg-card p-3 ${reminder.isCompleted ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <button onClick={() => !reminder.isCompleted && onComplete(reminder.id)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${reminder.isCompleted ? 'border-green-500 bg-green-500/15' : 'border-muted-foreground/30 hover:border-primary/50'}`}>
          {reminder.isCompleted && <Check className="h-3.5 w-3.5 text-green-600" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${reminder.isCompleted ? 'line-through' : ''}`}>{reminder.title}</p>
          {reminder.description && <p className="text-[10px] text-muted-foreground line-clamp-1">{reminder.description}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{reminder.date}{reminder.time ? ` ${reminder.time}` : ''}</span>
            <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${prio.color}15`, color: prio.color }}>{prio.icon}</span>
            <span className="text-[10px]">{cat.icon}</span>
            {isOverdue && onReschedule && (
              <button
                onClick={() => onReschedule(reminder)}
                className="rounded-md border border-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-50"
              >
                {language === 'ru' ? '+1 день' : 'Reschedule +1 day'}
              </button>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(reminder.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
      </div>
    </motion.div>
  );
}
