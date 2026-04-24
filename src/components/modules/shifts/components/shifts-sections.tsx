'use client';

import { motion } from 'framer-motion';
import { CalendarClock, Check, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { EmptyState, FAB } from '@/components/shared';
import type { ShiftItem } from '@/store/shifts-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SHIFT_TYPES, type ShiftFormValues, type ShiftsLanguage } from '../constants';

export function ShiftCard({
  shift,
  language,
  onComplete,
  onDelete,
  index,
}: {
  shift: ShiftItem;
  language: ShiftsLanguage;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  index: number;
}) {
  const typeInfo = SHIFT_TYPES.find((t) => t.value === shift.type) ?? SHIFT_TYPES[0];
  const hours = calcHours(shift.timeStart, shift.timeEnd);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`rounded-xl border bg-card p-3.5 ${shift.isCompleted ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${typeInfo.color}15` }}>{typeInfo.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{language === 'ru' ? typeInfo.labelRu : typeInfo.labelEn}</span>
            {shift.role && <span className="text-[10px] text-muted-foreground">{shift.role}</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{shift.timeStart}–{shift.timeEnd} ({hours}h)
            {shift.location && <><MapPin className="ml-1 h-3 w-3" />{shift.location}</>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!shift.isCompleted && <button onClick={() => onComplete(shift.id)} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-green-500/10"><Check className="h-4 w-4 text-green-600" /></button>}
          <button onClick={() => onDelete(shift.id)} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">{shift.date}</span>
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>{language === 'ru' ? typeInfo.labelRu : typeInfo.labelEn}</span>
      </div>
    </motion.div>
  );
}

export function ScheduleSection({
  todayShifts,
  upcomingShifts,
  language,
  onComplete,
  onDelete,
}: {
  todayShifts: ShiftItem[];
  upcomingShifts: ShiftItem[];
  language: ShiftsLanguage;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Сегодня' : 'Today'}</h3>
      {todayShifts.length === 0
        ? <p className="py-4 text-center text-sm text-muted-foreground">{language === 'ru' ? 'Нет смен на сегодня' : 'No shifts today'}</p>
        : todayShifts.map((shift, i) => <ShiftCard key={shift.id} shift={shift} language={language} onComplete={onComplete} onDelete={onDelete} index={i} />)}

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Предстоящие' : 'Upcoming'}</h3>
      {upcomingShifts.length === 0
        ? <p className="py-4 text-center text-sm text-muted-foreground">{language === 'ru' ? 'Нет предстоящих смен' : 'No upcoming shifts'}</p>
        : upcomingShifts.slice(0, 7).map((shift, i) => <ShiftCard key={shift.id} shift={shift} language={language} onComplete={onComplete} onDelete={onDelete} index={i} />)}
    </div>
  );
}

export function ListSection({ shifts, language, accentColor, onComplete, onDelete }: { shifts: ShiftItem[]; language: ShiftsLanguage; accentColor: string; onComplete: (id: string) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
  if (shifts.length === 0) {
    return <EmptyState icon={CalendarClock} title={language === 'ru' ? 'Нет смен' : 'No shifts'} description={language === 'ru' ? 'Добавьте первую смену' : 'Add your first shift'} accentColor={accentColor} />;
  }

  return <div className="space-y-2">{shifts.map((shift, i) => <ShiftCard key={shift.id} shift={shift} language={language} onComplete={onComplete} onDelete={onDelete} index={i} />)}</div>;
}

export function StatsSection({
  shifts,
  completedShifts,
  totalHours,
  overtimeCount,
  language,
}: {
  shifts: ShiftItem[];
  completedShifts: ShiftItem[];
  totalHours: number;
  overtimeCount: number;
  language: ShiftsLanguage;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: language === 'ru' ? 'Всего смен' : 'Total shifts', value: shifts.length, icon: '📋' },
          { label: language === 'ru' ? 'Завершено' : 'Completed', value: completedShifts.length, icon: '✅' },
          { label: language === 'ru' ? 'Часов отработано' : 'Hours worked', value: Math.round(totalHours), icon: '⏱️' },
          { label: language === 'ru' ? 'Переработок' : 'Overtime', value: overtimeCount, icon: '⏰' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-4 text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className="mt-1 text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AddShiftSheet({
  open,
  onOpenChange,
  accentColor,
  language,
  form,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accentColor: string;
  language: ShiftsLanguage;
  form: ShiftFormValues;
  onChange: (patch: Partial<ShiftFormValues>) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild><FAB accentColor={accentColor} onClick={() => onOpenChange(true)} /></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить смену' : 'Add Shift'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={form.date} onChange={(e) => onChange({ date: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Начало' : 'Start'}</label><Input type="time" value={form.timeStart} onChange={(e) => onChange({ timeStart: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Конец' : 'End'}</label><Input type="time" value={form.timeEnd} onChange={(e) => onChange({ timeEnd: e.target.value })} /></div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Тип' : 'Type'}</label>
            <div className="mt-1 flex flex-wrap gap-2">{SHIFT_TYPES.map((t) => <button key={t.value} onClick={() => onChange({ type: t.value })} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.type === t.value ? 'text-white' : 'bg-muted'}`} style={form.type === t.value ? { backgroundColor: t.color } : {}}><span>{t.icon}</span>{language === 'ru' ? t.labelRu : t.labelEn}</button>)}</div>
          </div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Роль' : 'Role'}</label><Input value={form.role} onChange={(e) => onChange({ role: e.target.value })} placeholder={language === 'ru' ? 'Должность...' : 'Job title...'} /></div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Место' : 'Location'}</label><Input value={form.location} onChange={(e) => onChange({ location: e.target.value })} placeholder={language === 'ru' ? 'Офис, удалённо...' : 'Office, remote...'} /></div>
          <Button onClick={onSubmit} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
}
