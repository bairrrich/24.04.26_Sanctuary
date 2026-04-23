'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface DiaryEntry {
  id: string;
  date: string;
  title: string | null;
  content: string;
  mood: string | null; // great, good, neutral, bad, terrible
  tags: string[]; // parsed from JSON
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryData {
  date?: string;
  title?: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export interface XPEventResult {
  attribute: string;
  amount: number;
  action: string;
}

// ==================== Store Interface ====================

interface DiaryState {
  entries: DiaryEntry[];
  currentEntry: DiaryEntry | null;
  isLoading: boolean;
  selectedDate: string;
  // Cache tracking
  lastFetchKey: string | null;

  // Actions
  loadEntries: (from: string, to: string) => Promise<void>;
  loadEntryByDate: (date: string) => Promise<void>;
  createEntry: (data: CreateEntryData) => Promise<XPEventResult[] | null>;
  updateEntry: (id: string, data: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setCurrentEntry: (entry: DiaryEntry | null) => void;
  setSelectedDate: (date: string) => void;
  refreshGamification: () => Promise<void>;
}

// ==================== Store ====================

export const useDiaryStore = create<DiaryState>()((set, get) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  selectedDate: new Date().getFullYear() + '-' +
    String(new Date().getMonth() + 1).padStart(2, '0') + '-' +
    String(new Date().getDate()).padStart(2, '0'),
  lastFetchKey: null,

  loadEntries: async (from: string, to: string) => {
    const key = `${from}_${to}`;
    const { lastFetchKey, entries, isLoading } = get();
    // Skip if already fetched this exact range and not currently loading
    if (lastFetchKey === key && entries.length >= 0 && !isLoading) {
      return;
    }

    set({ isLoading: true });
    try {
      const res = await fetch(`/api/diary?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Failed to load entries');
      const data = await res.json();
      set({ entries: data.entries ?? [], isLoading: false, lastFetchKey: key });
    } catch (error) {
      console.error('Error loading diary entries:', error);
      set({ isLoading: false });
    }
  },

  loadEntryByDate: async (date: string) => {
    try {
      const res = await fetch(`/api/diary?date=${date}`);
      if (!res.ok) throw new Error('Failed to load entry');
      const data = await res.json();
      const entries = data.entries ?? [];
      set({ currentEntry: entries.length > 0 ? entries[0] : null });
    } catch (error) {
      console.error('Error loading diary entry by date:', error);
    }
  },

  createEntry: async (data: CreateEntryData) => {
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create entry');
      const result = await res.json();

      // Add the new entry to the list and invalidate cache
      set((state) => ({
        entries: [result.entry, ...state.entries],
        currentEntry: result.entry,
        lastFetchKey: null, // Invalidate cache
      }));

      // Refresh gamification if XP was emitted
      if (result.xpEvents && result.xpEvents.length > 0) {
        get().refreshGamification();
      }

      return result.xpEvents ?? null;
    } catch (error) {
      console.error('Error creating diary entry:', error);
      return null;
    }
  },

  updateEntry: async (id: string, data: Partial<DiaryEntry>) => {
    try {
      const res = await fetch(`/api/diary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update entry');
      const result = await res.json();

      // Update the entry in the list
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? { ...e, ...result.entry } : e
        ),
        currentEntry: state.currentEntry?.id === id
          ? { ...state.currentEntry, ...result.entry }
          : state.currentEntry,
      }));
    } catch (error) {
      console.error('Error updating diary entry:', error);
    }
  },

  deleteEntry: async (id: string) => {
    try {
      const res = await fetch(`/api/diary/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete entry');

      // Remove the entry from the list
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
      }));
    } catch (error) {
      console.error('Error deleting diary entry:', error);
    }
  },

  setCurrentEntry: (entry: DiaryEntry | null) => {
    set({ currentEntry: entry });
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
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
