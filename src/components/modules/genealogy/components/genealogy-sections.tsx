'use client';

import { motion } from 'framer-motion';
import { Cake, Plus, Trash2, Users } from 'lucide-react';
import { EmptyState, FAB } from '@/components/shared';
import type { FamilyEventItem, FamilyMemberItem } from '@/store/genealogy-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { EVENT_TYPES, RELATIONS, type EventFormValues, type GenealogyLanguage, type MemberFormValues } from '../constants';

export function UpcomingBirthdaysCard({ events, language }: { events: FamilyEventItem[]; language: GenealogyLanguage }) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-1.5 rounded-xl border border-amber-200 bg-amber-500/5 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-600"><Cake className="h-3.5 w-3.5" />{language === 'ru' ? 'Ближайшие дни рождения' : 'Upcoming birthdays'}</div>
      {events.map((e) => <div key={e.id} className="flex items-center gap-2 text-sm"><span>🎂</span><span>{e.title}</span><span className="text-xs text-muted-foreground">{e.date}</span></div>)}
    </div>
  );
}

export function FamilyMembersSection({
  members,
  language,
  accentColor,
  onDelete,
}: {
  members: FamilyMemberItem[];
  language: GenealogyLanguage;
  accentColor: string;
  onDelete: (id: string) => Promise<void>;
}) {
  if (members.length === 0) {
    return <EmptyState icon={Users} title={language === 'ru' ? 'Нет членов семьи' : 'No family members'} description={language === 'ru' ? 'Добавьте первого родственника' : 'Add your first family member'} accentColor={accentColor} />;
  }

  return (
    <div className="space-y-2">
      {members.map((member, i) => {
        const relation = RELATIONS.find((r) => r.value === member.relation) ?? RELATIONS[7];
        return (
          <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-lg">{relation.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{member.name}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">{language === 'ru' ? relation.labelRu : relation.labelEn}</span>
                  {member.birthDate && <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Cake className="h-2.5 w-2.5" />{member.birthDate}</span>}
                </div>
                {member.notes && <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{member.notes}</p>}
              </div>
              <button onClick={() => onDelete(member.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function FamilyEventsSection({
  events,
  members,
  language,
  onAdd,
  onDelete,
}: {
  events: FamilyEventItem[];
  members: FamilyMemberItem[];
  language: GenealogyLanguage;
  onAdd: () => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Семейные события' : 'Family Events'}</h3>
        <Button variant="outline" size="sm" onClick={onAdd} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" />{language === 'ru' ? 'Добавить' : 'Add'}</Button>
      </div>
      {events.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{language === 'ru' ? 'Нет событий' : 'No events'}</p>
      ) : events.sort((a, b) => a.date.localeCompare(b.date)).map((event, i) => {
        const eventType = EVENT_TYPES.find((e) => e.value === event.type) ?? EVENT_TYPES[4];
        const member = event.memberId ? members.find((m) => m.id === event.memberId) : null;

        return (
          <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-base" style={{ backgroundColor: `${eventType.color}15` }}>{eventType.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{event.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{event.date}</span>
                  <span className="rounded px-1 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${eventType.color}15`, color: eventType.color }}>{language === 'ru' ? eventType.labelRu : eventType.labelEn}</span>
                  {member && <span className="text-[10px] text-muted-foreground">· {member.name}</span>}
                </div>
                {event.description && <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{event.description}</p>}
              </div>
              <button onClick={() => onDelete(event.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function AddMemberSheet({
  open,
  onOpenChange,
  language,
  accentColor,
  form,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: GenealogyLanguage;
  accentColor: string;
  form: MemberFormValues;
  onChange: (patch: Partial<MemberFormValues>) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild><FAB accentColor={accentColor} onClick={() => onOpenChange(true)} /></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить родственника' : 'Add Family Member'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Имя' : 'Name'}</label><Input value={form.name} onChange={(e) => onChange({ name: e.target.value })} placeholder={language === 'ru' ? 'Имя...' : 'Name...'} autoFocus /></div>
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Родство' : 'Relation'}</label>
            <div className="mt-1 flex flex-wrap gap-2">{RELATIONS.map((r) => <button key={r.value} onClick={() => onChange({ relation: r.value })} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${form.relation === r.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{r.icon} {language === 'ru' ? r.labelRu : r.labelEn}</button>)}</div>
          </div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата рождения' : 'Birth date'}</label><Input type="date" value={form.birthDate} onChange={(e) => onChange({ birthDate: e.target.value })} /></div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Заметки' : 'Notes'}</label><Textarea value={form.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2} /></div>
          <Button onClick={onSubmit} disabled={!form.name.trim()} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AddEventSheet({
  open,
  onOpenChange,
  language,
  members,
  form,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: GenealogyLanguage;
  members: FamilyMemberItem[];
  form: EventFormValues;
  onChange: (patch: Partial<EventFormValues>) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить событие' : 'Add Event'}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Title'}</label><Input value={form.title} onChange={(e) => onChange({ title: e.target.value })} /></div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={form.date} onChange={(e) => onChange({ date: e.target.value })} /></div>
          <div>
            <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Тип' : 'Type'}</label>
            <div className="mt-1 flex flex-wrap gap-2">{EVENT_TYPES.map((t) => <button key={t.value} onClick={() => onChange({ type: t.value })} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${form.type === t.value ? 'text-white' : 'bg-muted'}`} style={form.type === t.value ? { backgroundColor: t.color } : {}}>{t.icon} {language === 'ru' ? t.labelRu : t.labelEn}</button>)}</div>
          </div>
          <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Textarea value={form.description} onChange={(e) => onChange({ description: e.target.value })} rows={2} /></div>
          {members.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Член семьи' : 'Family member'}</label>
              <select value={form.memberId} onChange={(e) => onChange({ memberId: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                <option value="">{language === 'ru' ? '— Не указан —' : '— None —'}</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <Button onClick={onSubmit} disabled={!form.title.trim() || !form.date} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
