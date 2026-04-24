'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number;
  isPR: boolean;
  note: string | null;
  sortOrder: number;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  duration: number;
  type: string; // strength, cardio, flexibility, other
  note: string | null;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExerciseData {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  isPR?: boolean;
  note?: string;
}

export interface CreateWorkoutData {
  date?: string;
  name: string;
  duration?: number;
  type?: string;
  note?: string;
  exercises?: CreateExerciseData[];
}

export interface XPEventResult {
  module: string;
  action: string;
  amount: number;
  attribute: string;
}

// ==================== Store Interface ====================

interface TrainingState {
  // Daily workouts (for Workouts tab - single date)
  dailyWorkouts: Workout[];
  // Range workouts (for History/Analytics tabs - date range)
  rangeWorkouts: Workout[];
  // Loading states — separate for daily vs range
  isDailyLoading: boolean;
  isRangeLoading: boolean;
  // Legacy compat
  workouts: Workout[];
  isLoading: boolean;
  selectedDate: string;
  // Cache tracking to avoid redundant fetches
  lastDailyFetchDate: string | null;
  lastRangeFetchKey: string | null;

  loadWorkouts: (date: string) => Promise<void>;
  loadWorkoutsRange: (from: string, to: string) => Promise<void>;
  createWorkout: (data: CreateWorkoutData) => Promise<Workout | null>;
  updateWorkout: (id: string, data: Partial<Workout> & { exercises?: CreateExerciseData[] }) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  refreshGamification: () => Promise<void>;
}

// ==================== Helper ====================

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==================== Store ====================

export const useTrainingStore = create<TrainingState>()((set, get) => ({
  dailyWorkouts: [],
  rangeWorkouts: [],
  isDailyLoading: false,
  isRangeLoading: false,
  // Legacy compat
  workouts: [],
  isLoading: false,
  selectedDate: getTodayString(),
  lastDailyFetchDate: null,
  lastRangeFetchKey: null,

  loadWorkouts: async (date: string) => {
    const { lastDailyFetchDate, dailyWorkouts } = get();
    // Skip if already fetched this exact date and we have data
    if (lastDailyFetchDate === date && dailyWorkouts.length >= 0 && !get().isDailyLoading) {
      // Already have this date's data — just set legacy compat
      set({ workouts: dailyWorkouts, isLoading: false });
      return;
    }

    set({ isDailyLoading: true, isLoading: true });
    try {
      const res = await fetch(`/api/training/workouts?date=${date}`);
      if (!res.ok) throw new Error('Failed to load workouts');
      const data = await res.json();
      const fetched = data.workouts ?? [];
      set({
        dailyWorkouts: fetched,
        workouts: fetched,
        isDailyLoading: false,
        isLoading: false,
        lastDailyFetchDate: date,
      });
    } catch (error) {
      console.error('Error loading workouts:', error);
      set({ isDailyLoading: false, isLoading: false });
    }
  },

  loadWorkoutsRange: async (from: string, to: string) => {
    const key = `${from}_${to}`;
    const { lastRangeFetchKey } = get();
    // Skip if already fetched this exact range
    if (lastRangeFetchKey === key && !get().isRangeLoading) {
      set({ workouts: get().rangeWorkouts });
      return;
    }

    set({ isRangeLoading: true });
    try {
      const res = await fetch(`/api/training/workouts?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Failed to load workouts');
      const data = await res.json();
      const fetched = data.workouts ?? [];
      set({
        rangeWorkouts: fetched,
        isRangeLoading: false,
        lastRangeFetchKey: key,
      });
    } catch (error) {
      console.error('Error loading workouts range:', error);
      set({ isRangeLoading: false });
    }
  },

  createWorkout: async (data: CreateWorkoutData) => {
    try {
      const res = await fetch('/api/training/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create workout');
      const result = await res.json();

      const workout: Workout = result.workout;

      // Invalidate caches so next fetch will get fresh data
      set((state) => ({
        dailyWorkouts: [workout, ...state.dailyWorkouts],
        workouts: [workout, ...state.workouts],
        rangeWorkouts: [workout, ...state.rangeWorkouts],
        lastDailyFetchDate: null,
        lastRangeFetchKey: null,
      }));

      // Refresh gamification since XP was emitted server-side
      if (result.xpEvents && result.xpEvents.length > 0) {
        get().refreshGamification();
      }

      return workout;
    } catch (error) {
      console.error('Error creating workout:', error);
      return null;
    }
  },

  updateWorkout: async (id: string, data: Partial<Workout> & { exercises?: CreateExerciseData[] }) => {
    try {
      const res = await fetch(`/api/training/workouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update workout');
      const result = await res.json();

      set((state) => ({
        dailyWorkouts: state.dailyWorkouts.map((w) =>
          w.id === id ? result.workout : w
        ),
        rangeWorkouts: state.rangeWorkouts.map((w) =>
          w.id === id ? result.workout : w
        ),
        workouts: state.workouts.map((w) =>
          w.id === id ? result.workout : w
        ),
      }));
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  },

  deleteWorkout: async (id: string) => {
    try {
      const res = await fetch(`/api/training/workouts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete workout');

      set((state) => ({
        dailyWorkouts: state.dailyWorkouts.filter((w) => w.id !== id),
        rangeWorkouts: state.rangeWorkouts.filter((w) => w.id !== id),
        workouts: state.workouts.filter((w) => w.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting workout:', error);
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
