'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  frequency: string;
  steps: string | null;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  logs: RoutineLogEntry[];
}

export interface RoutineLogEntry {
  id: string;
  date: string;
  completedSteps: number | null;
  rating: number | null;
  note: string | null;
}

export interface RoutineLogWithRoutine extends RoutineLogEntry {
  routineId: string;
  createdAt: string;
  routine: {
    id: string;
    name: string;
    icon: string;
    category: string;
    frequency: string;
    steps: string | null;
  };
}

export interface ProgressPhoto {
  id: string;
  date: string;
  category: string;
  note: string | null;
  photoData: string | null;
  rating: number | null;
  createdAt: string;
}

export interface CreateRoutineData {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  frequency?: string;
  steps?: string;
  sortOrder?: number;
}

export interface CreatePhotoData {
  date: string;
  category?: string;
  note?: string;
  rating?: number;
}

// ==================== Category Colors ====================

export const CATEGORY_COLORS: Record<string, string> = {
  skincare: '#ec4899',
  grooming: '#a855f7',
  style: '#6366f1',
  fitness: '#ef4444',
  nutrition: '#22c55e',
  posture: '#14b8a6',
  other: '#f59e0b',
};

export const CATEGORY_ICONS: Record<string, string> = {
  skincare: '🧴',
  grooming: '💇',
  style: '👔',
  fitness: '💪',
  nutrition: '🥗',
  posture: '🧘',
  other: '✨',
};

// ==================== Store Interface ====================

interface LooksmaxxingState {
  routines: Routine[];
  routineLogs: RoutineLogWithRoutine[];
  photos: ProgressPhoto[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRoutines: () => Promise<void>;
  createRoutine: (data: CreateRoutineData) => Promise<void>;
  updateRoutine: (id: string, data: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleRoutineLog: (routineId: string, date?: string) => Promise<boolean>;
  loadLogs: (from: string, to: string) => Promise<void>;
  loadTodayLogs: (date: string) => Promise<void>;
  loadPhotos: () => Promise<void>;
  createPhoto: (data: CreatePhotoData) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  refreshGamification: () => Promise<void>;
}

// ==================== Store ====================

export const useLooksmaxxingStore = create<LooksmaxxingState>()((set, get) => ({
  routines: [],
  routineLogs: [],
  photos: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  loadRoutines: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/looksmaxxing/routines');
      if (!res.ok) throw new Error('Failed to load routines');
      const data = await res.json();
      set({ routines: data.routines ?? [], isLoading: false });
    } catch (error) {
      console.error('Error loading routines:', error);
      set({ error: 'Failed to load routines', isLoading: false });
    }
  },

  createRoutine: async (data: CreateRoutineData) => {
    try {
      const res = await fetch('/api/looksmaxxing/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create routine');
      const result = await res.json();
      set((state) => ({ routines: [...state.routines, result.routine] }));
    } catch (error) {
      console.error('Error creating routine:', error);
      set({ error: 'Failed to create routine' });
    }
  },

  updateRoutine: async (id: string, data: Partial<Routine>) => {
    try {
      const res = await fetch(`/api/looksmaxxing/routines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update routine');
      const result = await res.json();
      set((state) => ({
        routines: state.routines.map((r) =>
          r.id === id ? { ...r, ...result.routine, logs: r.logs } : r
        ),
      }));
    } catch (error) {
      console.error('Error updating routine:', error);
      set({ error: 'Failed to update routine' });
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      const res = await fetch(`/api/looksmaxxing/routines/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete routine');
      set((state) => ({ routines: state.routines.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Error deleting routine:', error);
      set({ error: 'Failed to delete routine' });
    }
  },

  toggleRoutineLog: async (routineId: string, date?: string) => {
    try {
      const res = await fetch('/api/looksmaxxing/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routineId, date }),
      });
      if (!res.ok) throw new Error('Failed to toggle routine log');
      const result = await res.json();
      const isCompleted = result.isCompleted;

      // Update local routine state to reflect the log
      set((state) => ({
        routines: state.routines.map((r) => {
          if (r.id !== routineId) return r;
          const logDate = date || state.selectedDate;
          if (isCompleted) {
            const newLog: RoutineLogEntry = {
              id: result.log?.id || 'temp',
              date: logDate,
              completedSteps: result.log?.completedSteps ?? null,
              rating: result.log?.rating ?? null,
              note: null,
            };
            return { ...r, logs: [...r.logs.filter((l) => l.date !== logDate), newLog] };
          } else {
            return { ...r, logs: r.logs.filter((l) => l.date !== logDate) };
          }
        }),
      }));

      if (isCompleted && result.xpEvents?.length > 0) {
        get().refreshGamification();
      }

      return isCompleted;
    } catch (error) {
      console.error('Error toggling routine log:', error);
      set({ error: 'Failed to toggle routine log' });
      return false;
    }
  },

  loadLogs: async (from: string, to: string) => {
    try {
      const res = await fetch(`/api/looksmaxxing/log?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Failed to load logs');
      const data = await res.json();
      set({ routineLogs: data.logs ?? [] });
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  },

  loadTodayLogs: async (date: string) => {
    try {
      const res = await fetch(`/api/looksmaxxing/log?date=${date}`);
      if (!res.ok) throw new Error('Failed to load today logs');
      const data = await res.json();
      set({ routineLogs: data.logs ?? [] });
    } catch (error) {
      console.error('Error loading today logs:', error);
    }
  },

  loadPhotos: async () => {
    try {
      const res = await fetch('/api/looksmaxxing/photos');
      if (!res.ok) throw new Error('Failed to load photos');
      const data = await res.json();
      set({ photos: data.photos ?? [] });
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  },

  createPhoto: async (data: CreatePhotoData) => {
    try {
      const res = await fetch('/api/looksmaxxing/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create photo');
      const result = await res.json();
      set((state) => ({ photos: [result.photo, ...state.photos] }));
      if (result.xpEvents?.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating photo:', error);
      set({ error: 'Failed to create photo' });
    }
  },

  deletePhoto: async (id: string) => {
    try {
      const res = await fetch(`/api/looksmaxxing/photos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete photo');
      set((state) => ({ photos: state.photos.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Error deleting photo:', error);
      set({ error: 'Failed to delete photo' });
    }
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
