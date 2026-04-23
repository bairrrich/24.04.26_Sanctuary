import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, ThemeMode, AppLanguage, WaterUnit, WeightUnit, DistanceUnit, CurrencyCode, FirstDayOfWeek } from '@/types';

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setWaterUnit: (unit: WaterUnit) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  setDistanceUnit: (unit: DistanceUnit) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setFirstDayOfWeek: (day: FirstDayOfWeek) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'ru',
  waterUnit: 'ml',
  weightUnit: 'kg',
  distanceUnit: 'km',
  currency: 'RUB',
  firstDayOfWeek: 'monday',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setWaterUnit: (waterUnit) => set({ waterUnit }),
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setDistanceUnit: (distanceUnit) => set({ distanceUnit }),
      setCurrency: (currency) => set({ currency }),
      setFirstDayOfWeek: (firstDayOfWeek) => set({ firstDayOfWeek }),
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'sanctuary-settings',
    }
  )
);
