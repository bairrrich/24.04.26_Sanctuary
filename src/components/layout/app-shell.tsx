'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION } from '@/lib/constants';
import { Sidebar } from './sidebar';
import { MobileNavbar } from './mobile-navbar';
import { XPNotification } from '@/components/shared/xp-notification';
import { AuthPage } from '@/components/auth/auth-page';
import type { ModuleId } from '@/types';

// Lazy-load all module pages to reduce initial bundle size and memory usage
const FeedPage = dynamic(() => import('@/components/modules/feed/feed-page').then(m => ({ default: m.FeedPage })), { ssr: false });
const DiaryPage = dynamic(() => import('@/components/modules/diary/diary-page').then(m => ({ default: m.DiaryPage })), { ssr: false });
const ShiftsPage = dynamic(() => import('@/components/modules/shifts/shifts-page').then(m => ({ default: m.ShiftsPage })), { ssr: false });
const FinancePage = dynamic(() => import('@/components/modules/finance/finance-page').then(m => ({ default: m.FinancePage })), { ssr: false });
const NutritionPage = dynamic(() => import('@/components/modules/nutrition/nutrition-page').then(m => ({ default: m.NutritionPage })), { ssr: false });
const TrainingPage = dynamic(() => import('@/components/modules/training/training-page').then(m => ({ default: m.TrainingPage })), { ssr: false });
const HabitsPage = dynamic(() => import('@/components/modules/habits/habits-page').then(m => ({ default: m.HabitsPage })), { ssr: false });
const CollectionsPage = dynamic(() => import('@/components/modules/collections/collections-page').then(m => ({ default: m.CollectionsPage })), { ssr: false });
const GenealogyPage = dynamic(() => import('@/components/modules/genealogy/genealogy-page').then(m => ({ default: m.GenealogyPage })), { ssr: false });
const HealthPage = dynamic(() => import('@/components/modules/health/health-page').then(m => ({ default: m.HealthPage })), { ssr: false });
const CalendarPage = dynamic(() => import('@/components/modules/calendar/calendar-page').then(m => ({ default: m.CalendarPage })), { ssr: false });
const LooksmaxxingPage = dynamic(() => import('@/components/modules/looksmaxxing/looksmaxxing-page').then(m => ({ default: m.LooksmaxxingPage })), { ssr: false });
const GamificationPage = dynamic(() => import('@/components/modules/gamification/gamification-page').then(m => ({ default: m.GamificationPage })), { ssr: false });
const RemindersPage = dynamic(() => import('@/components/modules/reminders/reminders-page').then(m => ({ default: m.RemindersPage })), { ssr: false });
const SettingsPage = dynamic(() => import('@/components/modules/settings/settings-page').then(m => ({ default: m.SettingsPage })), { ssr: false });

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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Show auth page if not authenticated and not guest
  // Only show auth after initialization to avoid flash
  if (isInitialized && !isAuthenticated && !isGuest) {
    return <AuthPage />;
  }

  const ActiveComponent = MODULE_COMPONENTS[activeModule];

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
          <motion.div
            key={activeModule}
            initial={ANIMATION.PAGE_TRANSITION.initial}
            animate={ANIMATION.PAGE_TRANSITION.animate}
            transition={{ duration: ANIMATION.DURATION_NORMAL }}
            className="min-h-full"
          >
            <ActiveComponent />
          </motion.div>
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
