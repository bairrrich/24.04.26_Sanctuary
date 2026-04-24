'use client';

import { create } from 'zustand';

export interface ReminderItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  isCompleted: boolean;
  isRecurring: boolean;
  recurRule: string | null;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface RemindersState {
  reminders: ReminderItem[];
  isLoading: boolean;
  loadReminders: (includeCompleted?: boolean) => Promise<void>;
  addReminder: (data: Partial<ReminderItem>) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  updateReminder: (id: string, data: Partial<ReminderItem>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

export const useRemindersStore = create<RemindersState>()((set) => ({
  reminders: [],
  isLoading: false,

  loadReminders: async (includeCompleted?: boolean) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (includeCompleted) params.set('includeCompleted', 'true');
      const res = await fetch(`/api/reminders/reminders?${params}`);
      if (res.ok) {
        const data = await res.json();
        set({ reminders: data.reminders ?? [] });
      }
    } catch { /* empty */ }
    set({ isLoading: false });
  },

  addReminder: async (data) => {
    try {
      const res = await fetch('/api/reminders/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({ reminders: [d.reminder, ...s.reminders] }));
      }
    } catch { /* empty */ }
  },

  completeReminder: async (id) => {
    try {
      const res = await fetch(`/api/reminders/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });
      if (res.ok) {
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, isCompleted: true } : r)),
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  updateReminder: async (id, data) => {
    try {
      const res = await fetch(`/api/reminders/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.reminder) {
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? d.reminder : r)),
          }));
        }
      }
    } catch { /* empty */ }
  },

  deleteReminder: async (id) => {
    try {
      const res = await fetch(`/api/reminders/reminders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
      }
    } catch { /* empty */ }
  },
}));
