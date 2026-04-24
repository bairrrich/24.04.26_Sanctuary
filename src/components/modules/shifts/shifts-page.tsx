'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Plus, Check, Clock, MapPin, Trash2 } from 'lucide-react';
import { PageHeader, ModuleTabs, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useShiftsStore } from '@/store/shifts-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ANIMATION, SPACING } from '@/lib/constants';
import type { TabItem } from '@/types';

const SHIFT_TYPES = [
  { value: 'regular', labelEn: 'Regular', labelRu: 'Обычная', color: '#3b82f6', icon: '💼' },
  { value: 'overtime', labelEn: 'Overtime', labelRu: 'Переработка', color: '#f97316', icon: '⏰' },
  { value: 'holiday', labelEn: 'Holiday', labelRu: 'Праздничная', color: '#22c55e', icon: '🎉' },
  { value: 'sick', labelEn: 'Sick leave', labelRu: 'Больничный', color: '#ef4444', icon: '🤒' },
  { value: 'vacation', labelEn: 'Vacation', labelRu: 'Отпуск', color: '#a855f7', icon: '🏖️' },
];

export function ShiftsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.shifts;
  const { shifts, isLoading, loadShifts, addShift, completeShift, deleteShift } = useShiftsStore();
  const [activeTab, setActiveTab] = useState('schedule');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], timeStart: '09:00', timeEnd: '17:00', type: 'regular', role: '', location: '', note: '' });

  useEffect(() => { loadShifts(); }, [loadShifts]);

  const today = new Date().toISOString().split('T')[0];
  const todayShifts = shifts.filter((s) => s.date === today);
  const upcomingShifts = shifts.filter((s) => s.date > today).sort((a, b) => a.date.localeCompare(b.date));
  const completedShifts = shifts.filter((s) => s.isCompleted);
  const totalHours = completedShifts.reduce((acc, s) => acc + calcHours(s.timeStart, s.timeEnd), 0);
  const overtimeCount = completedShifts.filter((s) => s.type === 'overtime').length;

  const tabs: TabItem[] = [
    { id: 'schedule', label: language === 'ru' ? 'Расписание' : 'Schedule' },
    { id: 'list', label: language === 'ru' ? 'Список' : 'List' },
    { id: 'stats', label: language === 'ru' ? 'Статистика' : 'Stats' },
  ];

  const handleAdd = async () => {
    await addShift({ date: form.date, timeStart: form.timeStart, timeEnd: form.timeEnd, type: form.type, role: form.role || null, location: form.location || null, note: form.note || null });
    setIsOpen(false);
    setForm({ date: new Date().toISOString().split('T')[0], timeStart: '09:00', timeEnd: '17:00', type: 'regular', role: '', location: '', note: '' });
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={language === 'ru' ? 'Смены' : 'Shifts'} icon={CalendarClock} accentColor={config.accentColor} subtitle={language === 'ru' ? 'График смен и переработок' : 'Shift schedule and overtime'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Сегодня' : 'Today'}</h3>
            {todayShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{language === 'ru' ? 'Нет смен на сегодня' : 'No shifts today'}</p>
            ) : todayShifts.map((shift, i) => <ShiftCard key={shift.id} shift={shift} language={language} onComplete={completeShift} onDelete={deleteShift} index={i} />)}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4">{language === 'ru' ? 'Предстоящие' : 'Upcoming'}</h3>
            {upcomingShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{language === 'ru' ? 'Нет предстоящих смен' : 'No upcoming shifts'}</p>
            ) : upcomingShifts.slice(0, 7).map((shift, i) => <ShiftCard key={shift.id} shift={shift} language={language} onComplete={completeShift} onDelete={deleteShift} index={i} />)}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-2">
            {shifts.length === 0 ? (
              <EmptyState icon={CalendarClock} title={language === 'ru' ? 'Нет смен' : 'No shifts'} description={language === 'ru' ? 'Добавьте первую смену' : 'Add your first shift'} accentColor={config.accentColor} />
            ) : shifts.map((shift, i) => <ShiftCard key={shift.id} shift={shift} language={language} onComplete={completeShift} onDelete={deleteShift} index={i} />)}
          </div>
        )}

        {activeTab === 'stats' && (
          <motion.div initial={ANIMATION.PAGE_TRANSITION.initial} animate={ANIMATION.PAGE_TRANSITION.animate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: language === 'ru' ? 'Всего смен' : 'Total shifts', value: shifts.length, icon: '📋' },
                { label: language === 'ru' ? 'Завершено' : 'Completed', value: completedShifts.length, icon: '✅' },
                { label: language === 'ru' ? 'Часов отработано' : 'Hours worked', value: Math.round(totalHours), icon: '⏱️' },
                { label: language === 'ru' ? 'Переработок' : 'Overtime', value: overtimeCount, icon: '⏰' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-4 text-center">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <FAB accentColor={config.accentColor} onClick={() => setIsOpen(true)} />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить смену' : 'Add Shift'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Начало' : 'Start'}</label><Input type="time" value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Конец' : 'End'}</label><Input type="time" value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Тип' : 'Type'}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SHIFT_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setForm({ ...form, type: t.value })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === t.value ? 'text-white' : 'bg-muted'}`} style={form.type === t.value ? { backgroundColor: t.color } : {}}>
                    <span>{t.icon}</span>{language === 'ru' ? t.labelRu : t.labelEn}
                  </button>
                ))}
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Роль' : 'Role'}</label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder={language === 'ru' ? 'Должность...' : 'Job title...'} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Место' : 'Location'}</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={language === 'ru' ? 'Офис, удалённо...' : 'Office, remote...'} /></div>
            <Button onClick={handleAdd} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ShiftCard({ shift, language, onComplete, onDelete, index }: { shift: { id: string; date: string; timeStart: string; timeEnd: string; type: string; role: string | null; location: string | null; isCompleted: boolean }; language: 'en' | 'ru'; onComplete: (id: string) => Promise<void>; onDelete: (id: string) => Promise<void>; index: number }) {
  const typeInfo = SHIFT_TYPES.find((t) => t.value === shift.type) ?? SHIFT_TYPES[0];
  const hours = calcHours(shift.timeStart, shift.timeEnd);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`rounded-xl border bg-card p-3.5 ${shift.isCompleted ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${typeInfo.color}15` }}>{typeInfo.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{language === 'ru' ? typeInfo.labelRu : typeInfo.labelEn}</span>
            {shift.role && <span className="text-[10px] text-muted-foreground">{shift.role}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{shift.timeStart}–{shift.timeEnd} ({hours}h)
            {shift.location && <><MapPin className="h-3 w-3 ml-1" />{shift.location}</>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!shift.isCompleted && (
            <button onClick={() => onComplete(shift.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-green-500/10 transition-colors"><Check className="h-4 w-4 text-green-600" /></button>
          )}
          <button onClick={() => onDelete(shift.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-muted-foreground">{shift.date}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>{language === 'ru' ? typeInfo.labelRu : typeInfo.labelEn}</span>
      </div>
    </motion.div>
  );
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
}
