'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { LAYOUT, ANIMATION } from '@/lib/constants';
import { Sidebar } from './sidebar';
import { MobileNavbar } from './mobile-navbar';

// Module page components (lazy-like imports)
import { FeedPage } from '@/components/modules/feed/feed-page';
import { DiaryPage } from '@/components/modules/diary/diary-page';
import { ShiftsPage } from '@/components/modules/shifts/shifts-page';
import { FinancePage } from '@/components/modules/finance/finance-page';
import { NutritionPage } from '@/components/modules/nutrition/nutrition-page';
import { TrainingPage } from '@/components/modules/training/training-page';
import { HabitsPage } from '@/components/modules/habits/habits-page';
import { CollectionsPage } from '@/components/modules/collections/collections-page';
import { GenealogyPage } from '@/components/modules/genealogy/genealogy-page';
import { HealthPage } from '@/components/modules/health/health-page';
import { CalendarPage } from '@/components/modules/calendar/calendar-page';
import { LooksmaxxingPage } from '@/components/modules/looksmaxxing/looksmaxxing-page';
import { GamificationPage } from '@/components/modules/gamification/gamification-page';
import { RemindersPage } from '@/components/modules/reminders/reminders-page';
import { SettingsPage } from '@/components/modules/settings/settings-page';
import { XPNotification } from '@/components/shared/xp-notification';
import type { ModuleId } from '@/types';

const MODULE_COMPONENTS: Record<ModuleId, React.ComponentType> = {
  feed: FeedPage,
  diary: DiaryPage,
  shifts: ShiftsPage,
  finance: FinancePage,
  nutrition: NutritionPage,
  training: TrainingPage,
  habits: HabitsPage,
  collections: CollectionsPage,
  genealogy: GenealogyPage,
  health: HealthPage,
  calendar: CalendarPage,
  looksmaxxing: LooksmaxxingPage,
  gamification: GamificationPage,
  reminders: RemindersPage,
  settings: SettingsPage,
};

export function AppShell() {
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const ActiveComponent = MODULE_COMPONENTS[activeModule];
  const moduleConfig = MODULE_REGISTRY[activeModule];

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onModuleSelect={setActiveModule}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={ANIMATION.PAGE_TRANSITION.initial}
              animate={ANIMATION.PAGE_TRANSITION.animate}
              exit={ANIMATION.PAGE_TRANSITION.exit}
              transition={{ duration: ANIMATION.DURATION_NORMAL }}
              className="min-h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navbar */}
      <MobileNavbar
        activeModule={activeModule}
        onModuleSelect={setActiveModule}
      />

      {/* XP Notification Overlay */}
      <XPNotification />
    </div>
  );
}
