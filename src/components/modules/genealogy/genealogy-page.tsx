'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { ModuleTabs, PageHeader } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useGenealogyStore } from '@/store/genealogy-store';
import type { TabItem } from '@/types';
import { AddEventSheet, AddMemberSheet, FamilyEventsSection, FamilyMembersSection, UpcomingBirthdaysCard } from './components/genealogy-sections';
import type { EventFormValues, MemberFormValues } from './constants';

function defaultMemberForm(): MemberFormValues {
  return { name: '', relation: 'other', birthDate: '', notes: '' };
}

function defaultEventForm(): EventFormValues {
  return { title: '', description: '', date: '', type: 'birthday', memberId: '' };
}

export function GenealogyPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.genealogy;
  const { members, events, loadMembers, loadEvents, addMember, addEvent, deleteMember, deleteEvent } = useGenealogyStore();

  const [activeTab, setActiveTab] = useState('family');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormValues>(defaultMemberForm());
  const [eventForm, setEventForm] = useState<EventFormValues>(defaultEventForm());

  useEffect(() => { loadMembers(); loadEvents(); }, [loadMembers, loadEvents]);

  const tabs: TabItem[] = [
    { id: 'family', label: language === 'ru' ? 'Семья' : 'Family' },
    { id: 'events', label: language === 'ru' ? 'События' : 'Events' },
  ];

  const upcomingBirthdays = events.filter((e) => e.type === 'birthday').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const handleAddMember = async () => {
    if (!memberForm.name.trim()) return;
    await addMember({ name: memberForm.name.trim(), relation: memberForm.relation, birthDate: memberForm.birthDate || undefined, notes: memberForm.notes || undefined });
    setMemberForm(defaultMemberForm());
    setIsAddMemberOpen(false);
  };

  const handleAddEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.date) return;
    await addEvent({ title: eventForm.title.trim(), description: eventForm.description || undefined, date: eventForm.date, type: eventForm.type, memberId: eventForm.memberId || undefined });
    setEventForm(defaultEventForm());
    setIsAddEventOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={language === 'ru' ? 'Родословная' : 'Genealogy'} icon={Users} accentColor={config.accentColor} subtitle={language === 'ru' ? 'Семья и родственники' : 'Family and relatives'} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <UpcomingBirthdaysCard events={upcomingBirthdays} language={language} />
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

        {activeTab === 'family' && <FamilyMembersSection members={members} language={language} accentColor={config.accentColor} onDelete={deleteMember} />}
        {activeTab === 'events' && <FamilyEventsSection events={events} members={members} language={language} onAdd={() => setIsAddEventOpen(true)} onDelete={deleteEvent} />}
      </div>

      <AddMemberSheet
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        language={language}
        accentColor={config.accentColor}
        form={memberForm}
        onChange={(patch) => setMemberForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleAddMember}
      />

      <AddEventSheet
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        language={language}
        members={members}
        form={eventForm}
        onChange={(patch) => setEventForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleAddEvent}
      />
    </div>
  );
}
