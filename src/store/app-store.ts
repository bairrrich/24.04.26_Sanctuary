import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId } from '@/types';

interface AppState {
  /** Currently active module */
  activeModule: ModuleId;
  /** Simple local usage counter for adaptive navigation */
  moduleUsage: Record<ModuleId, number>;
  /** Most recently visited modules (for quick actions) */
  recentModules: ModuleId[];
  /** First-week activation checklist */
  activationChecklist: {
    feedNote: boolean;
    firstWorkout: boolean;
    firstExpense: boolean;
  };
  /** Whether the "more" menu is open on mobile */
  moreMenuOpen: boolean;
  /** Whether sidebar is collapsed on desktop */
  sidebarCollapsed: boolean;

  // Actions
  setActiveModule: (module: ModuleId) => void;
  markChecklistDone: (item: 'feedNote' | 'firstWorkout' | 'firstExpense') => void;
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
      recentModules: ['feed'],
      activationChecklist: {
        feedNote: false,
        firstWorkout: false,
        firstExpense: false,
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
          recentModules: [module, ...state.recentModules.filter((id) => id !== module)].slice(0, 5),
        })),

      setMoreMenuOpen: (open) =>
        set({ moreMenuOpen: open }),

      markChecklistDone: (item) =>
        set((state) => ({
          activationChecklist: {
            ...state.activationChecklist,
            [item]: true,
          },
        })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'sanctuary-app-store',
      partialize: (state) => ({
        activeModule: state.activeModule,
        moduleUsage: state.moduleUsage,
        recentModules: state.recentModules,
        activationChecklist: state.activationChecklist,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
