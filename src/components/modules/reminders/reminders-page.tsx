'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Check, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { PageHeader, ModuleTabs, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useRemindersStore, type ReminderItem } from '@/store/reminders-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ANIMATION } from '@/lib/constants';
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

export function RemindersPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.reminders;
  const { reminders, isLoading, loadReminders, addReminder, completeReminder, deleteReminder } = useRemindersStore();
  const [activeTab, setActiveTab] = useState('today');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', priority: 'normal', category: 'general' });

  useEffect(() => { loadReminders(true); }, [loadReminders]);

  const today = new Date().toISOString().split('T')[0];
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
    await addReminder({ title: form.title.trim(), description: form.description || undefined, date: form.date, time: form.time || undefined, priority: form.priority, category: form.category });
    setIsOpen(false);
    setForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', priority: 'normal', category: 'general' });
  };

  const groupedUpcoming = (() => {
    const groups: Record<string, ReminderItem[]> = {};
    for (const r of upcomingReminders) {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    }
    return groups;
  })();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={language === 'ru' ? 'Напоминания' : 'Reminders'} icon={Bell} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Не забудьте ничего' : "Don't forget anything"} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {overdueReminders.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{language === 'ru' ? 'Просрочено' : 'Overdue'} ({overdueReminders.length})</div>
            {overdueReminders.map((r) => <ReminderCard key={r.id} reminder={r} language={language} onComplete={completeReminder} onDelete={deleteReminder} />)}
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
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Заголовок' : 'Title'}</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={language === 'ru' ? 'Что нужно сделать?' : 'What to do?'} autoFocus /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Время' : 'Time'}</label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Приоритет' : 'Priority'}</label>
              <div className="flex gap-2 mt-1">{PRIORITIES.map((p) => (
                <button key={p.value} onClick={() => setForm({ ...form, priority: p.value })} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${form.priority === p.value ? 'text-white' : 'bg-muted'}`} style={form.priority === p.value ? { backgroundColor: p.color } : {}}>{p.icon} {language === 'ru' ? p.labelRu : p.labelEn}</button>
              ))}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Категория' : 'Category'}</label>
              <div className="flex gap-2 mt-1">{CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => setForm({ ...form, category: c.value })} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{c.icon} {language === 'ru' ? c.labelRu : c.labelEn}</button>
              ))}</div>
            </div>
            <Button onClick={handleAdd} disabled={!form.title.trim()} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ReminderCard({ reminder, language, onComplete, onDelete }: { reminder: ReminderItem; language: 'en' | 'ru'; onComplete: (id: string) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
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
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" />{reminder.date}{reminder.time ? ` ${reminder.time}` : ''}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded" style={{ backgroundColor: `${prio.color}15`, color: prio.color }}>{prio.icon}</span>
            <span className="text-[10px]">{cat.icon}</span>
          </div>
        </div>
        <button onClick={() => onDelete(reminder.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
      </div>
    </motion.div>
  );
}
