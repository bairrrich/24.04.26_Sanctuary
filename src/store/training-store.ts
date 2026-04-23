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
  workouts: Workout[];
  isLoading: boolean;
  selectedDate: string;

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
  return new Date().toISOString().split('T')[0];
}

// ==================== Store ====================

export const useTrainingStore = create<TrainingState>()((set, get) => ({
  workouts: [],
  isLoading: false,
  selectedDate: getTodayString(),

  loadWorkouts: async (date: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/training/workouts?date=${date}`);
      if (!res.ok) throw new Error('Failed to load workouts');
      const data = await res.json();
      set({ workouts: data.workouts ?? [], isLoading: false });
    } catch (error) {
      console.error('Error loading workouts:', error);
      set({ isLoading: false });
    }
  },

  loadWorkoutsRange: async (from: string, to: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/training/workouts?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Failed to load workouts');
      const data = await res.json();
      set({ workouts: data.workouts ?? [], isLoading: false });
    } catch (error) {
      console.error('Error loading workouts range:', error);
      set({ isLoading: false });
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

      // Update local state
      set((state) => ({
        workouts: [workout, ...state.workouts],
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
