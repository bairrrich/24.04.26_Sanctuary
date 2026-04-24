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

export function RemindersPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.reminders;
  const { reminders, isLoading, loadReminders, addReminder, completeReminder, updateReminder, deleteReminder } = useRemindersStore();

  const [activeTab, setActiveTab] = useState('today');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ReminderFormValues>(defaultReminderForm());
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
    const parsed = parseNaturalInput(value, new Date());
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
