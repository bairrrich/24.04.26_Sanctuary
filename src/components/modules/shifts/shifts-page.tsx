'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { ModuleTabs, PageHeader } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useShiftsStore } from '@/store/shifts-store';
import { SPACING } from '@/lib/constants';
import type { TabItem } from '@/types';
import { defaultShiftForm, type ShiftFormValues } from './constants';
import { AddShiftSheet, ListSection, ScheduleSection, StatsSection } from './components/shifts-sections';

export function ShiftsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.shifts;
  const { shifts, loadShifts, addShift, completeShift, deleteShift } = useShiftsStore();

  const [activeTab, setActiveTab] = useState('schedule');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ShiftFormValues>(defaultShiftForm());

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
    setForm(defaultShiftForm());
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={language === 'ru' ? 'Смены' : 'Shifts'} icon={CalendarClock} accentColor={config.accentColor} subtitle={language === 'ru' ? 'График смен и переработок' : 'Shift schedule and overtime'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'schedule' && <ScheduleSection todayShifts={todayShifts} upcomingShifts={upcomingShifts} language={language} onComplete={completeShift} onDelete={deleteShift} />}
        {activeTab === 'list' && <ListSection shifts={shifts} language={language} accentColor={config.accentColor} onComplete={completeShift} onDelete={deleteShift} />}
        {activeTab === 'stats' && <StatsSection shifts={shifts} completedShifts={completedShifts} totalHours={totalHours} overtimeCount={overtimeCount} language={language} />}
      </div>

      <AddShiftSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        accentColor={config.accentColor}
        language={language}
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleAdd}
      />
    </div>
  );
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
}
