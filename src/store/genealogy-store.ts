'use client';

import { create } from 'zustand';

export interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  birthDate: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyEventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string;
  memberId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GenealogyState {
  members: FamilyMemberItem[];
  events: FamilyEventItem[];
  isLoading: boolean;
  loadMembers: () => Promise<void>;
  loadEvents: () => Promise<void>;
  addMember: (data: Partial<FamilyMemberItem>) => Promise<void>;
  addEvent: (data: Partial<FamilyEventItem>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useGenealogyStore = create<GenealogyState>()((set) => ({
  members: [],
  events: [],
  isLoading: false,

  loadMembers: async () => {
    try {
      const res = await fetch('/api/genealogy/members');
      if (res.ok) {
        const data = await res.json();
        set({ members: data.members ?? [] });
      }
    } catch { /* empty */ }
  },

  loadEvents: async () => {
    try {
      const res = await fetch('/api/genealogy/events');
      if (res.ok) {
        const data = await res.json();
        set({ events: data.events ?? [] });
      }
    } catch { /* empty */ }
  },

  addMember: async (data) => {
    try {
      const res = await fetch('/api/genealogy/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({ members: [d.member, ...s.members] }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  addEvent: async (data) => {
    try {
      const res = await fetch('/api/genealogy/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({ events: [d.event, ...s.events] }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  deleteMember: async (id) => {
    try {
      const res = await fetch(`/api/genealogy/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({ members: s.members.filter((m) => m.id !== id) }));
      }
    } catch { /* empty */ }
  },

  deleteEvent: async (id) => {
    try {
      const res = await fetch(`/api/genealogy/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
      }
    } catch { /* empty */ }
  },
}));
