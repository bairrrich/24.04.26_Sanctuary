import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleId } from '@/types';

interface AppState {
  /** Currently active module */
  activeModule: ModuleId;
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
      moreMenuOpen: false,
      sidebarCollapsed: false,

      setActiveModule: (module) =>
        set({ activeModule: module, moreMenuOpen: false }),

      setMoreMenuOpen: (open) =>
        set({ moreMenuOpen: open }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'sanctuary-app-store',
      partialize: (state) => ({
        activeModule: state.activeModule,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
