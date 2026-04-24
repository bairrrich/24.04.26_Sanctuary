import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId } from '@/types';

interface AppState {
  /** Currently active module */
  activeModule: ModuleId;
  /** Simple local usage counter for adaptive navigation */
  moduleUsage: Record<ModuleId, number>;
  /** Whether the "more" menu is open on mobile */
  moreMenuOpen: boolean;
  /** Whether sidebar is collapsed on desktop */
  sidebarCollapsed: boolean;

  // Actions
  setActiveModule: (module: ModuleId) => void;
  setMoreMenuOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeModule: 'feed',
      moduleUsage: {
        feed: 1,
        diary: 0,
        shifts: 0,
        finance: 0,
        nutrition: 0,
        training: 0,
        habits: 0,
        collections: 0,
        genealogy: 0,
        health: 0,
        calendar: 0,
        looksmaxxing: 0,
        gamification: 0,
        reminders: 0,
        settings: 0,
      },
      moreMenuOpen: false,
      sidebarCollapsed: false,

      setActiveModule: (module) =>
        set((state) => ({
          activeModule: module,
          moreMenuOpen: false,
          moduleUsage: {
            ...state.moduleUsage,
            [module]: (state.moduleUsage[module] ?? 0) + 1,
          },
        })),

      setMoreMenuOpen: (open) =>
        set({ moreMenuOpen: open }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'sanctuary-app-store',
      partialize: (state) => ({
        activeModule: state.activeModule,
        moduleUsage: state.moduleUsage,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
