'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  timeStart: string | null; // HH:mm
  timeEnd: string | null; // HH:mm
  type: string; // personal, work, health, social, finance, training, other
  location: string | null;
  isRecurring: boolean;
  recurRule: { freq: string; days: string[] } | null;
  isCompleted: boolean;
  color: string | null;
  reminderAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CalendarViewMode = 'month' | 'week' | 'day';

export type EventFormData = Omit<CalendarEvent, 'id' | 'isCompleted' | 'recurRule' | 'createdAt' | 'updatedAt'> & {
  recurRule: { freq: string; days: string[] } | null;
};

// ==================== Helpers ====================

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthRange(dateStr: string): { from: string; to: string } {
  const [year, month] = dateStr.split('-').map(Number);
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

// ==================== Store Interface ====================

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string; // YYYY-MM-DD
  viewMode: CalendarViewMode;
  isLoading: boolean;
  lastFetchKey: string;

  loadEvents: (dateFrom?: string, dateTo?: string) => Promise<void>;
  loadMonthEvents: (monthDate: string) => Promise<void>;
  addEvent: (data: Partial<CalendarEvent>) => Promise<void>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  completeEvent: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  refreshGamification: () => Promise<void>;
}

// ==================== Store ====================

export const useCalendarStore = create<CalendarState>()((set, get) => ({
  events: [],
  selectedDate: getTodayString(),
  viewMode: 'month',
  isLoading: false,
  lastFetchKey: '',

  loadEvents: async (dateFrom?: string, dateTo?: string) => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '200');

      const fetchKey = `${dateFrom ?? ''}-${dateTo ?? ''}`;
      if (fetchKey === get().lastFetchKey && get().events.length > 0) return;

      set({ isLoading: true });
      const res = await fetch(`/api/calendar/events?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      set({ events: data.events ?? [], lastFetchKey: fetchKey, isLoading: false });
    } catch (error) {
      console.error('Error loading events:', error);
      set({ isLoading: false });
    }
  },

  loadMonthEvents: async (monthDate: string) => {
    const { from, to } = getMonthRange(monthDate);
    // Expand range a bit for calendar display (previous/next month overflow days)
    const fromDate = new Date(from);
    fromDate.setDate(fromDate.getDate() - 7);
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 7);

    const expandedFrom = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
    const expandedTo = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;

    await get().loadEvents(expandedFrom, expandedTo);
  },

  addEvent: async (data) => {
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create event');
      const result = await res.json();

      set((state) => ({
        events: [...state.events, result.event],
        lastFetchKey: '', // invalidate cache
      }));

      if (result.xpEvents?.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  },

  updateEvent: async (id, data) => {
    try {
      const res = await fetch(`/api/calendar/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update event');
      const result = await res.json();

      set((state) => ({
        events: state.events.map((e) =>
          e.id === id ? { ...e, ...result.event } : e
        ),
        lastFetchKey: '',
      }));

      if (result.xpEvents?.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  },

  deleteEvent: async (id) => {
    try {
      const res = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete event');

      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  },

  completeEvent: async (id) => {
    await get().updateEvent(id, { isCompleted: true });
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  setViewMode: (mode: CalendarViewMode) => {
    set({ viewMode: mode });
  },

  refreshGamification: async () => {
    try {
      const res = await fetch('/api/gamification/character');
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined' && data.character) {
          window.dispatchEvent(
            new CustomEvent('gamification:updated', {
              detail: data.character,
            })
          );
        }
      }
    } catch {
      // Silent fail — gamification sync is non-critical
    }
  },
}));
