'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import { EmptyState, FAB, ModuleTabs, PageHeader } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useHabitsStore } from '@/store/habits-store';
import { useGamificationStore } from '@/store/gamification-store';
import type { TabItem } from '@/types';
import { AllTab, AnalyticsTab, CreateHabitSheet, ProgressSummary, TodayTab } from './components/habits-sections';

export function HabitsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.habits;
  const { habits, isLoading, loadHabits } = useHabitsStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('today');
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const positiveHabits = habits.filter((h) => h.type === 'positive');
  const negativeHabits = habits.filter((h) => h.type === 'negative');
  const completedCount = positiveHabits.filter((h) => h.todayLog !== null).length;
  const totalCount = positiveHabits.length;

  const tabs: TabItem[] = [
    { id: 'today', label: language === 'ru' ? 'Сегодня' : 'Today' },
    { id: 'all', label: language === 'ru' ? 'Все' : 'All' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={language === 'ru' ? 'Привычки' : 'Habits'}
        icon={Target}
        accentColor={config.accentColor}
        subtitle={totalCount > 0 ? `${completedCount}/${totalCount} ${language === 'ru' ? 'выполнено' : 'done'}` : undefined}
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={Target}
            title={language === 'ru' ? 'Нет привычек' : 'No habits yet'}
            description={language === 'ru' ? 'Добавьте первую привычку, чтобы начать отслеживание' : 'Add your first habit to start tracking'}
            accentColor={config.accentColor}
            actionLabel={language === 'ru' ? 'Добавить привычку' : 'Add habit'}
            onAction={() => setShowCreateSheet(true)}
          />
        ) : (
          <>
            {totalCount > 0 && <ProgressSummary completed={completedCount} total={totalCount} accentColor={config.accentColor} language={language} />}

            <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

            <AnimatePresence mode="wait">
              {activeTab === 'today' && <TodayTab positiveHabits={positiveHabits} negativeHabits={negativeHabits} language={language} />}
              {activeTab === 'all' && <AllTab habits={habits} language={language} />}
              {activeTab === 'analytics' && <AnalyticsTab habits={habits} language={language} />}
            </AnimatePresence>
          </>
        )}
      </div>

      <FAB accentColor={config.accentColor} onClick={() => setShowCreateSheet(true)} />

      <CreateHabitSheet open={showCreateSheet} onClose={() => setShowCreateSheet(false)} language={language} accentColor={config.accentColor} />
    </div>
  );
}
