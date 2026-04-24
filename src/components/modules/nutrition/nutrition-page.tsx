'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Apple } from 'lucide-react';
import { FAB, ModuleTabs, PageHeader } from '@/components/shared';
import { SPACING } from '@/lib/constants';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useGamificationStore } from '@/store/gamification-store';
import { useNutritionStore } from '@/store/nutrition-store';
import { useSettingsStore } from '@/store/settings-store';
import type { TabItem } from '@/types';
import { NUTRITION_TABS } from './constants';
import { AnalyticsTab, CreateMealSheet, DateNavigator, DiaryTab, WaterTab } from './components/nutrition-sections';

export function NutritionPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.nutrition;
  const { isLoading, meals, selectedDate, loadDay } = useNutritionStore();
  const setSelectedDate = useNutritionStore((s) => s.setSelectedDate);
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('diary');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadDay(selectedDate);
  }, [loadDay, selectedDate]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'diary', label: NUTRITION_TABS.diary[language] },
    { id: 'water', label: NUTRITION_TABS.water[language] },
    { id: 'analytics', label: NUTRITION_TABS.analytics[language] },
  ];

  const openCreateSheet = (mealType?: string) => {
    setDefaultMealType(mealType);
    setShowCreateSheet(true);
  };

  const totalMeals = meals.length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={language === 'ru' ? 'Питание' : 'Nutrition'}
        icon={Apple}
        accentColor={config.accentColor}
        subtitle={totalMeals > 0 ? `${totalMeals} ${language === 'ru' ? 'приёмов пищи' : 'meals logged'}` : undefined}
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} language={language} />
            <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />

            <AnimatePresence mode="wait">
              {activeTab === 'diary' && <DiaryTab language={language} accentColor={config.accentColor} onAddMeal={openCreateSheet} />}
              {activeTab === 'water' && <WaterTab language={language} accentColor={config.accentColor} />}
              {activeTab === 'analytics' && <AnalyticsTab language={language} accentColor={config.accentColor} />}
            </AnimatePresence>
          </>
        )}
      </div>

      <FAB accentColor={config.accentColor} onClick={() => openCreateSheet()} />

      <CreateMealSheet
        key={`${defaultMealType ?? 'none'}-${showCreateSheet ? 'open' : 'closed'}`}
        open={showCreateSheet}
        onClose={() => {
          setShowCreateSheet(false);
          setDefaultMealType(undefined);
        }}
        language={language}
        accentColor={config.accentColor}
        defaultMealType={defaultMealType}
      />
    </div>
  );
}
