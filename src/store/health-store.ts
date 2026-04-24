'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface BodyMeasurement {
  id: string;
  date: string;
  weight: number | null;
  height: number | null;
  waist: number | null;
  chest: number | null;
  hips: number | null;
  bicep: number | null;
  thigh: number | null;
  neck: number | null;
  bodyFat: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WellbeingLog {
  id: string;
  date: string;
  mood: string | null;
  energy: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  stress: number | null;
  symptoms: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HealthGoal {
  id: string;
  type: string;
  targetValue: number;
  currentValue: number | null;
  deadline: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Helper ====================

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==================== Store Interface ====================

interface HealthState {
  measurements: BodyMeasurement[];
  wellbeingLogs: WellbeingLog[];
  goals: HealthGoal[];
  selectedDate: string;
  isLoading: boolean;

  loadMeasurements: (dateFrom?: string, dateTo?: string) => Promise<void>;
  loadWellbeing: (dateFrom?: string, dateTo?: string) => Promise<void>;
  loadGoals: () => Promise<void>;
  addMeasurement: (data: Omit<BodyMeasurement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMeasurement: (id: string, data: Partial<BodyMeasurement>) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  addWellbeing: (data: Omit<WellbeingLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWellbeing: (id: string, data: Partial<WellbeingLog>) => Promise<void>;
  deleteWellbeing: (id: string) => Promise<void>;
  addGoal: (data: Omit<HealthGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<HealthGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

// ==================== Store ====================

export const useHealthStore = create<HealthState>()((set, get) => ({
  measurements: [],
  wellbeingLogs: [],
  goals: [],
  selectedDate: getTodayString(),
  isLoading: false,

  loadMeasurements: async (dateFrom?: string, dateTo?: string) => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '90');

      const res = await fetch(`/api/health/measurements?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load measurements');
      const data = await res.json();
      set({ measurements: data.measurements ?? [] });
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  },

  loadWellbeing: async (dateFrom?: string, dateTo?: string) => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '90');

      const res = await fetch(`/api/health/wellbeing?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load wellbeing');
      const data = await res.json();
      set({ wellbeingLogs: data.logs ?? [] });
    } catch (error) {
      console.error('Error loading wellbeing:', error);
    }
  },

  loadGoals: async () => {
    try {
      const res = await fetch('/api/health/goals');
      if (!res.ok) throw new Error('Failed to load goals');
      const data = await res.json();
      set({ goals: data.goals ?? [] });
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  },

  addMeasurement: async (data) => {
    try {
      const res = await fetch('/api/health/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create measurement');
      const result = await res.json();

      set((state) => ({
        measurements: [result.measurement, ...state.measurements],
      }));

      if (result.xpEvents?.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating measurement:', error);
    }
  },

  updateMeasurement: async (id, data) => {
    try {
      const res = await fetch(`/api/health/measurements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update measurement');
      const result = await res.json();

      set((state) => ({
        measurements: state.measurements.map((m) =>
          m.id === id ? { ...m, ...result.measurement } : m
        ),
      }));
    } catch (error) {
      console.error('Error updating measurement:', error);
    }
  },

  deleteMeasurement: async (id) => {
    try {
      const res = await fetch(`/api/health/measurements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete measurement');

      set((state) => ({
        measurements: state.measurements.filter((m) => m.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting measurement:', error);
    }
  },

  addWellbeing: async (data) => {
    try {
      const res = await fetch('/api/health/wellbeing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create wellbeing log');
      const result = await res.json();

      set((state) => ({
        wellbeingLogs: [result.log, ...state.wellbeingLogs],
      }));

      if (result.xpEvents?.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating wellbeing log:', error);
    }
  },

  updateWellbeing: async (id, data) => {
    try {
      const res = await fetch(`/api/health/wellbeing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update wellbeing log');
      const result = await res.json();

      set((state) => ({
        wellbeingLogs: state.wellbeingLogs.map((l) =>
          l.id === id ? { ...l, ...result.log } : l
        ),
      }));
    } catch (error) {
      console.error('Error updating wellbeing log:', error);
    }
  },

  deleteWellbeing: async (id) => {
    try {
      const res = await fetch(`/api/health/wellbeing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete wellbeing log');

      set((state) => ({
        wellbeingLogs: state.wellbeingLogs.filter((l) => l.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting wellbeing log:', error);
    }
  },

  addGoal: async (data) => {
    try {
      const res = await fetch('/api/health/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create goal');
      const result = await res.json();

      set((state) => ({
        goals: [result.goal, ...state.goals],
      }));
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  },

  updateGoal: async (id, data) => {
    try {
      const res = await fetch(`/api/health/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update goal');
      const result = await res.json();

      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, ...result.goal } : g
        ),
      }));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  },

  deleteGoal: async (id) => {
    try {
      const res = await fetch(`/api/health/goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete goal');

      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting goal:', error);
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
