'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PageHeader, ModuleTabs, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import { useLooksmaxxingStore } from '@/store/looksmaxxing-store';
import { useGamificationStore } from '@/store/gamification-store';
import type { TabItem } from '@/types';
import { AnalyticsTab, CreatePhotoSheet, CreateRoutineSheet, PhotosTab, RoutinesTab, TodayTab } from './components/looks-sections';

export function LooksmaxxingPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.looksmaxxing;
  const { routines, loadRoutines, loadPhotos } = useLooksmaxxingStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('routines');
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [showCreatePhoto, setShowCreatePhoto] = useState(false);

  useEffect(() => { loadRoutines(); loadPhotos(); }, [loadRoutines, loadPhotos]);

  useEffect(() => {
    const handler = () => loadCharacter();
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'routines', label: t(language, 'looksmaxxing.routines') },
    { id: 'today', label: t(language, 'looksmaxxing.today') },
    { id: 'photos', label: t(language, 'looksmaxxing.photos') },
    { id: 'analytics', label: t(language, 'common.analytics') },
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t(language, 'modules.looksmaxxing')} icon={Sparkles} accentColor={config.accentColor} subtitle={routines.length > 0 ? `${routines.length} ${t(language, 'looksmaxxing.routinesCount')}` : undefined} />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor={config.accentColor} />
        {activeTab === 'routines' && <RoutinesTab language={language} accentColor={config.accentColor} />}
        {activeTab === 'today' && <TodayTab language={language} accentColor={config.accentColor} />}
        {activeTab === 'photos' && <PhotosTab language={language} accentColor={config.accentColor} />}
        {activeTab === 'analytics' && <AnalyticsTab language={language} accentColor={config.accentColor} />}
      </div>

      <FAB accentColor={config.accentColor} onClick={() => { if (activeTab === 'photos') setShowCreatePhoto(true); else setShowCreateRoutine(true); }} />

      <CreateRoutineSheet open={showCreateRoutine} onClose={() => setShowCreateRoutine(false)} language={language} accentColor={config.accentColor} />
      <CreatePhotoSheet open={showCreatePhoto} onClose={() => setShowCreatePhoto(false)} language={language} accentColor={config.accentColor} />
    </div>
  );
}
