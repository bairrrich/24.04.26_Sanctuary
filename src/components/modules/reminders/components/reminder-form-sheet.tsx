'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { FAB } from '@/components/shared';
import { CATEGORIES, PRESETS, PRIORITIES, type ReminderFormValues, type ReminderLanguage } from '../constants';

interface ReminderFormSheetProps {
  language: ReminderLanguage;
  accentColor: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: ReminderFormValues;
  parseHint: string;
  isLoading: boolean;
  onTitleChange: (value: string) => void;
  onQuickDate: (type: 'today' | 'tomorrow' | 'weekend') => void;
  onPreset: (presetKey: string) => void;
  onChange: (patch: Partial<ReminderFormValues>) => void;
  onSubmit: () => Promise<void>;
}

export function ReminderFormSheet({
  language,
  accentColor,
  isOpen,
  onOpenChange,
  form,
  parseHint,
  isLoading,
  onTitleChange,
  onQuickDate,
  onPreset,
  onChange,
  onSubmit,
}: ReminderFormSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild><FAB accentColor={accentColor} onClick={() => onOpenChange(true)} /></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Новое напоминание' : 'New Reminder'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Заголовок' : 'Title'}</label>
            <Input
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={language === 'ru' ? 'Пример: завтра 19:00 тренировка' : 'Example: tomorrow 19:00 workout'}
              autoFocus
            />
            {!!parseHint && <p className="mt-1 text-[11px] text-emerald-600">{parseHint}</p>}
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Быстрые даты' : 'Quick dates'}</label>
            <div className="mt-1 flex gap-2">
              <button onClick={() => onQuickDate('today')} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">{language === 'ru' ? 'Сегодня' : 'Today'}</button>
              <button onClick={() => onQuickDate('tomorrow')} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">{language === 'ru' ? 'Завтра' : 'Tomorrow'}</button>
              <button onClick={() => onQuickDate('weekend')} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">{language === 'ru' ? 'Выходные' : 'This weekend'}</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Шаблоны' : 'Presets'}</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button key={preset.key} onClick={() => onPreset(preset.key)} className="rounded-lg border px-2 py-1.5 text-left text-xs">
                  {preset.icon} {language === 'ru' ? preset.titleRu : preset.titleEn}
                </button>
              ))}
            </div>
          </div>

          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Textarea value={form.description} onChange={(e) => onChange({ description: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={form.date} onChange={(e) => onChange({ date: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Время' : 'Time'}</label><Input type="time" value={form.time} onChange={(e) => onChange({ time: e.target.value })} /></div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Приоритет' : 'Priority'}</label>
            <div className="mt-1 flex flex-wrap gap-2">{PRIORITIES.map((p) => (
              <button key={p.value} onClick={() => onChange({ priority: p.value })} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${form.priority === p.value ? 'text-white' : 'bg-muted'}`} style={form.priority === p.value ? { backgroundColor: p.color } : {}}>{p.icon} {language === 'ru' ? p.labelRu : p.labelEn}</button>
            ))}</div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Категория' : 'Category'}</label>
            <div className="mt-1 flex flex-wrap gap-2">{CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => onChange({ category: c.value })} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${form.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{c.icon} {language === 'ru' ? c.labelRu : c.labelEn}</button>
            ))}</div>
          </div>
          <Button onClick={onSubmit} disabled={!form.title.trim() || isLoading} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
