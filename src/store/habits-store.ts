'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  type: 'positive' | 'negative';
  frequency: string;
  targetCount: number;
  sortOrder: number;
  isArchived: boolean;
  todayLog: { count: number } | null;
  currentStreak: number;
}

export interface CreateHabitData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: 'positive' | 'negative';
  frequency?: string;
  targetCount?: number;
  sortOrder?: number;
}

export interface HabitLogEntry {
  id: string;
  habitId: string;
  date: string;
  count: number;
  note: string | null;
  createdAt: string;
  habit: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
}

export interface XPEventResult {
  module: string;
  action: string;
  amount: number;
  attribute: string;
}

interface ToggleResult {
  log: { id: string; habitId: string; date: string; count: number } | null;
  isCompleted: boolean;
  currentStreak: number;
  xpEvents: XPEventResult[];
}

// ==================== Store Interface ====================

interface HabitsState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHabits: () => Promise<void>;
  createHabit: (data: CreateHabitData) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<ToggleResult | null>;
  getLogs: (from: string, to: string) => Promise<HabitLogEntry[]>;
  refreshGamification: () => Promise<void>;
}

// ==================== Store ====================

export const useHabitsStore = create<HabitsState>()((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  loadHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed to load habits');
      const data = await res.json();
      set({ habits: data.habits ?? [], isLoading: false });
    } catch (error) {
      console.error('Error loading habits:', error);
      set({ error: 'Failed to load habits', isLoading: false });
    }
  },

  createHabit: async (data: CreateHabitData) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create habit');
      const result = await res.json();

      // Add the new habit to the list
      set((state) => ({
        habits: [...state.habits, result.habit],
      }));
    } catch (error) {
      console.error('Error creating habit:', error);
      set({ error: 'Failed to create habit' });
    }
  },

  updateHabit: async (id: string, data: Partial<Habit>) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update habit');
      const result = await res.json();

      // Update the habit in the list
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                ...result.habit,
                todayLog: h.todayLog, // Preserve client-side todayLog
                currentStreak: h.currentStreak, // Preserve client-side streak
              }
            : h
        ),
      }));
    } catch (error) {
      console.error('Error updating habit:', error);
      set({ error: 'Failed to update habit' });
    }
  },

  deleteHabit: async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete habit');

      // Remove the habit from the list
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting habit:', error);
      set({ error: 'Failed to delete habit' });
    }
  },

  toggleHabit: async (habitId: string) => {
    try {
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId }),
      });
      if (!res.ok) throw new Error('Failed to toggle habit');
      const result: ToggleResult = await res.json();

      // Update the habit in the local state
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                todayLog: result.isCompleted ? { count: 1 } : null,
                currentStreak: result.currentStreak,
              }
            : h
        ),
      }));

      // Refresh gamification state since XP was emitted server-side
      if (result.xpEvents && result.xpEvents.length > 0) {
        // Trigger gamification refresh by calling the character API
        // We use a fire-and-forget approach to not block the UI
        get().refreshGamification();
      }

      return result;
    } catch (error) {
      console.error('Error toggling habit:', error);
      set({ error: 'Failed to toggle habit' });
      return null;
    }
  },

  getLogs: async (from: string, to: string) => {
    try {
      const res = await fetch(`/api/habits/log?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Failed to get logs');
      const data = await res.json();
      return data.logs ?? [];
    } catch (error) {
      console.error('Error getting habit logs:', error);
      return [];
    }
  },

  refreshGamification: async () => {
    try {
      // Fetch the updated character data to keep gamification store in sync
      // This is a fire-and-forget call — the gamification store will be updated
      // by whatever component is listening to it
      const res = await fetch('/api/gamification/character');
      if (res.ok) {
        const data = await res.json();
        // Update the gamification store indirectly by dispatching a custom event
        // This avoids direct store imports and keeps modules decoupled
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
