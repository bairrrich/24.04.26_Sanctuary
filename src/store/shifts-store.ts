'use client';

import { create } from 'zustand';

export interface ShiftItem {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  role: string | null;
  location: string | null;
  note: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShiftsState {
  shifts: ShiftItem[];
  selectedDate: string;
  isLoading: boolean;
  loadShifts: (dateFrom?: string, dateTo?: string) => Promise<void>;
  addShift: (data: Omit<ShiftItem, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => Promise<void>;
  completeShift: (id: string) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useShiftsStore = create<ShiftsState>()((set) => ({
  shifts: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,

  loadShifts: async (dateFrom?: string, dateTo?: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const res = await fetch(`/api/shifts/shifts?${params}`);
      if (res.ok) {
        const data = await res.json();
        set({ shifts: data.shifts ?? [] });
      }
    } catch { /* empty */ }
    set({ isLoading: false });
  },

  addShift: async (data) => {
    try {
      const res = await fetch('/api/shifts/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const d = await res.json();
        set((s) => ({ shifts: [d.shift, ...s.shifts] }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  completeShift: async (id) => {
    try {
      const res = await fetch(`/api/shifts/shifts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });
      if (res.ok) {
        set((s) => ({
          shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, isCompleted: true } : sh)),
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated'));
        }
      }
    } catch { /* empty */ }
  },

  deleteShift: async (id) => {
    try {
      const res = await fetch(`/api/shifts/shifts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({ shifts: s.shifts.filter((sh) => sh.id !== id) }));
      }
    } catch { /* empty */ }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
}));
