'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface MealEntry {
  id: string;
  date: string;
  mealType: string; // breakfast, lunch, dinner, snack
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaterEntry {
  id: string;
  date: string;
  amount: number;
  createdAt: string;
}

export interface CreateMealData {
  date: string;
  mealType: string;
  name: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  note?: string;
}

export interface DailySummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface XPEventResult {
  module: string;
  action: string;
  amount: number;
  attribute: string;
}

// ==================== Store Interface ====================

interface NutritionState {
  meals: MealEntry[];
  waterEntries: WaterEntry[];
  totalWater: number;
  waterGoal: number;
  dailySummary: DailySummary;
  targets: NutritionTargets;
  isLoading: boolean;
  selectedDate: string; // YYYY-MM-DD

  // Actions
  loadDay: (date: string) => Promise<void>;
  addMeal: (data: CreateMealData) => Promise<void>;
  updateMeal: (id: string, data: Partial<MealEntry>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  addWater: (amount?: number) => Promise<void>;
  deleteWater: (id: string) => Promise<void>;
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

export const useNutritionStore = create<NutritionState>()((set, get) => ({
  meals: [],
  waterEntries: [],
  totalWater: 0,
  waterGoal: 2000,
  dailySummary: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  targets: { calories: 2000, protein: 150, fat: 65, carbs: 250 },
  isLoading: false,
  selectedDate: getTodayString(),

  loadDay: async (date: string) => {
    set({ isLoading: true, selectedDate: date });
    try {
      // Load meals and water in parallel
      const [mealsRes, waterRes] = await Promise.all([
        fetch(`/api/nutrition/meals?date=${date}`),
        fetch(`/api/nutrition/water?date=${date}`),
      ]);

      if (!mealsRes.ok || !waterRes.ok) {
        throw new Error('Failed to load nutrition data');
      }

      const mealsData = await mealsRes.json();
      const waterData = await waterRes.json();

      set({
        meals: mealsData.meals ?? [],
        dailySummary: mealsData.summary ?? { calories: 0, protein: 0, fat: 0, carbs: 0 },
        targets: mealsData.targets ?? { calories: 2000, protein: 150, fat: 65, carbs: 250 },
        waterEntries: waterData.entries ?? [],
        totalWater: waterData.totalAmount ?? 0,
        waterGoal: waterData.goal ?? 2000,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      set({ isLoading: false });
    }
  },

  addMeal: async (data: CreateMealData) => {
    try {
      const res = await fetch('/api/nutrition/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create meal');
      const result = await res.json();

      // Add the new meal to the list
      set((state) => ({
        meals: [...state.meals, result.meal],
        dailySummary: {
          calories: state.dailySummary.calories + result.meal.calories,
          protein: state.dailySummary.protein + result.meal.protein,
          fat: state.dailySummary.fat + result.meal.fat,
          carbs: state.dailySummary.carbs + result.meal.carbs,
        },
      }));

      // Refresh gamification if XP was emitted
      if (result.xpEvents && result.xpEvents.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating meal:', error);
    }
  },

  updateMeal: async (id: string, data: Partial<MealEntry>) => {
    try {
      const res = await fetch(`/api/nutrition/meals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update meal');
      const result = await res.json();

      // Update the meal in the list and recalculate summary
      set((state) => {
        const oldMeal = state.meals.find((m) => m.id === id);
        const newMeals = state.meals.map((m) =>
          m.id === id ? { ...m, ...result.meal } : m
        );

        // Recalculate summary from all meals
        const summary = newMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            fat: acc.fat + m.fat,
            carbs: acc.carbs + m.carbs,
          }),
          { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        return { meals: newMeals, dailySummary: summary };
      });
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  },

  deleteMeal: async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition/meals/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete meal');

      // Remove the meal from the list and recalculate summary
      set((state) => {
        const newMeals = state.meals.filter((m) => m.id !== id);
        const summary = newMeals.reduce(
          (acc, m) => ({
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            fat: acc.fat + m.fat,
            carbs: acc.carbs + m.carbs,
          }),
          { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );
        return { meals: newMeals, dailySummary: summary };
      });
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  },

  addWater: async (amount?: number) => {
    const { selectedDate } = get();
    try {
      const res = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, amount: amount ?? 250 }),
      });
      if (!res.ok) throw new Error('Failed to add water');
      const result = await res.json();

      set({
        waterEntries: [result.entry, ...get().waterEntries],
        totalWater: result.totalAmount,
        waterGoal: result.goal,
      });

      // Refresh gamification if XP was emitted
      if (result.xpEvents && result.xpEvents.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error adding water:', error);
    }
  },

  deleteWater: async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition/water/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete water entry');

      set((state) => {
        const newEntries = state.waterEntries.filter((e) => e.id !== id);
        const totalWater = newEntries.reduce((sum, e) => sum + e.amount, 0);
        return { waterEntries: newEntries, totalWater };
      });
    } catch (error) {
      console.error('Error deleting water entry:', error);
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().loadDay(date);
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
