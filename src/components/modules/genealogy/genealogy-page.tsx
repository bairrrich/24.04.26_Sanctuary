'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Cake, Calendar, Heart } from 'lucide-react';
import { PageHeader, ModuleTabs, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useGenealogyStore, type FamilyMemberItem, type FamilyEventItem } from '@/store/genealogy-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ANIMATION, SPACING } from '@/lib/constants';
import type { TabItem } from '@/types';

const RELATIONS = [
  { value: 'mother', icon: '👩', labelEn: 'Mother', labelRu: 'Мать' },
  { value: 'father', icon: '👨', labelEn: 'Father', labelRu: 'Отец' },
  { value: 'sister', icon: '👧', labelEn: 'Sister', labelRu: 'Сестра' },
  { value: 'brother', icon: '👦', labelEn: 'Brother', labelRu: 'Брат' },
  { value: 'spouse', icon: '💍', labelEn: 'Spouse', labelRu: 'Супруг(а)' },
  { value: 'child', icon: '👶', labelEn: 'Child', labelRu: 'Ребёнок' },
  { value: 'grandparent', icon: '🧓', labelEn: 'Grandparent', labelRu: 'Бабушка/Дедушка' },
  { value: 'other', icon: '👤', labelEn: 'Other', labelRu: 'Другой' },
];

const EVENT_TYPES = [
  { value: 'birthday', icon: '🎂', labelEn: 'Birthday', labelRu: 'День рождения', color: '#f97316' },
  { value: 'anniversary', icon: '💕', labelEn: 'Anniversary', labelRu: 'Годовщина', color: '#ec4899' },
  { value: 'holiday', icon: '🎄', labelEn: 'Holiday', labelRu: 'Праздник', color: '#22c55e' },
  { value: 'reunion', icon: '🤝', labelEn: 'Reunion', labelRu: 'Встреча', color: '#6366f1' },
  { value: 'other', icon: '📅', labelEn: 'Other', labelRu: 'Другое', color: '#94a3b8' },
];

export function GenealogyPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.genealogy;
  const { members, events, isLoading, loadMembers, loadEvents, addMember, addEvent, deleteMember, deleteEvent } = useGenealogyStore();
  const [activeTab, setActiveTab] = useState('family');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', relation: 'other', birthDate: '', notes: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', type: 'birthday', memberId: '' });

  useEffect(() => { loadMembers(); loadEvents(); }, [loadMembers, loadEvents]);

  const tabs: TabItem[] = [
    { id: 'family', label: language === 'ru' ? 'Семья' : 'Family' },
    { id: 'events', label: language === 'ru' ? 'События' : 'Events' },
  ];

  const handleAddMember = async () => {
    if (!memberForm.name.trim()) return;
    await addMember({ name: memberForm.name.trim(), relation: memberForm.relation, birthDate: memberForm.birthDate || undefined, notes: memberForm.notes || undefined });
    setIsAddMemberOpen(false);
    setMemberForm({ name: '', relation: 'other', birthDate: '', notes: '' });
  };

  const handleAddEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.date) return;
    await addEvent({ title: eventForm.title.trim(), description: eventForm.description || undefined, date: eventForm.date, type: eventForm.type, memberId: eventForm.memberId || undefined });
    setIsAddEventOpen(false);
    setEventForm({ title: '', description: '', date: '', type: 'birthday', memberId: '' });
  };

  const upcomingBirthdays = events
    .filter((e) => e.type === 'birthday')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={language === 'ru' ? 'Родословная' : 'Genealogy'} icon={Users} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Семья и родственники' : 'Family and relatives'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {/* Upcoming birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-500/5 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600"><Cake className="h-3.5 w-3.5" />{language === 'ru' ? 'Ближайшие дни рождения' : 'Upcoming birthdays'}</div>
            {upcomingBirthdays.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-sm"><span>🎂</span><span>{e.title}</span><span className="text-xs text-muted-foreground">{e.date}</span></div>
            ))}
          </div>
        )}

        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'family' && (
          <div className="space-y-2">
            {members.length === 0 ? (
              <EmptyState icon={Users} title={language === 'ru' ? 'Нет членов семьи' : 'No family members'} description={language === 'ru' ? 'Добавьте первого родственника' : 'Add your first family member'} accentColor={config.accentColor} />
            ) : members.map((member, i) => {
              const rel = RELATIONS.find((r) => r.value === member.relation) ?? RELATIONS[7];
              return (
                <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-lg">{rel.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{member.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted">{language === 'ru' ? rel.labelRu : rel.labelEn}</span>
                        {member.birthDate && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Cake className="h-2.5 w-2.5" />{member.birthDate}</span>}
                      </div>
                      {member.notes && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{member.notes}</p>}
                    </div>
                    <button onClick={() => deleteMember(member.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language === 'ru' ? 'Семейные события' : 'Family Events'}</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddEventOpen(true)} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />{language === 'ru' ? 'Добавить' : 'Add'}</Button>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{language === 'ru' ? 'Нет событий' : 'No events'}</p>
            ) : events.sort((a, b) => a.date.localeCompare(b.date)).map((event, i) => {
              const et = EVENT_TYPES.find((e) => e.value === event.type) ?? EVENT_TYPES[4];
              const member = event.memberId ? members.find((m) => m.id === event.memberId) : null;
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl text-base" style={{ backgroundColor: `${et.color}15` }}>{et.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{event.date}</span>
                        <span className="text-[9px] font-medium px-1 py-0.5 rounded" style={{ backgroundColor: `${et.color}15`, color: et.color }}>{language === 'ru' ? et.labelRu : et.labelEn}</span>
                        {member && <span className="text-[10px] text-muted-foreground">· {member.name}</span>}
                      </div>
                      {event.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{event.description}</p>}
                    </div>
                    <button onClick={() => deleteEvent(event.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-muted-foreground" /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Sheet */}
      <Sheet open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <SheetTrigger asChild><FAB accentColor={config.accentColor} onClick={() => setIsAddMemberOpen(true)} /></SheetTrigger>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить родственника' : 'Add Family Member'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Имя' : 'Name'}</label><Input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder={language === 'ru' ? 'Имя...' : 'Name...'} autoFocus /></div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Родство' : 'Relation'}</label>
              <div className="flex flex-wrap gap-2 mt-1">{RELATIONS.map((r) => (
                <button key={r.value} onClick={() => setMemberForm({ ...memberForm, relation: r.value })} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${memberForm.relation === r.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{r.icon} {language === 'ru' ? r.labelRu : r.labelEn}</button>
              ))}</div>
            </div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата рождения' : 'Birth date'}</label><Input type="date" value={memberForm.birthDate} onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Заметки' : 'Notes'}</label><Textarea value={memberForm.notes} onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleAddMember} disabled={!memberForm.name.trim()} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Event Sheet */}
      <Sheet open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>{language === 'ru' ? 'Добавить событие' : 'Add Event'}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Название' : 'Title'}</label><Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Дата' : 'Date'}</label><Input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></div>
            <div>
              <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Тип' : 'Type'}</label>
              <div className="flex flex-wrap gap-2 mt-1">{EVENT_TYPES.map((t) => (
                <button key={t.value} onClick={() => setEventForm({ ...eventForm, type: t.value })} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${eventForm.type === t.value ? 'text-white' : 'bg-muted'}`} style={eventForm.type === t.value ? { backgroundColor: t.color } : {}}>{t.icon} {language === 'ru' ? t.labelRu : t.labelEn}</button>
              ))}</div>
            </div>
            <div><label className="text-xs text-muted-foreground">{language === 'ru' ? 'Описание' : 'Description'}</label><Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={2} /></div>
            {members.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground">{language === 'ru' ? 'Член семьи' : 'Family member'}</label>
                <select value={eventForm.memberId} onChange={(e) => setEventForm({ ...eventForm, memberId: e.target.value })} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-1">
                  <option value="">{language === 'ru' ? '— Не указан —' : '— None —'}</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            <Button onClick={handleAddEvent} disabled={!eventForm.title.trim() || !eventForm.date} className="w-full">{language === 'ru' ? 'Добавить' : 'Add'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
