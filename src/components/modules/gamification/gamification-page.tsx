'use client';

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { PageHeader, ModuleTabs, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';
import { CharacterProfile } from './character-profile';
import { ClassDisplay } from './class-display';
import { AttributeDisplay } from './attribute-display';
import { XPEventLog } from './xp-event-log';
import { AchievementsTab } from './achievements-tab';
import { QuestsTab } from './quests-tab';
import { CharacterSetup } from './character-setup';
import type { TabItem } from '@/types';

export function GamificationPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.gamification;
  const {
    id,
    isSetupComplete,
    isLoading,
    loadCharacter,
  } = useGamificationStore();

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader
          title={language === 'ru' ? 'Геймификация' : 'Gamification'}
          icon={Trophy}
          accentColor={config.accentColor}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              {language === 'ru' ? 'Загрузка...' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Setup wizard if character doesn't exist
  if (!id || !isSetupComplete) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader
          title={language === 'ru' ? 'Создание персонажа' : 'Create Character'}
          icon={Trophy}
          accentColor={config.accentColor}
        />
        <CharacterSetup />
      </div>
    );
  }

  // Main gamification view
  const tabs: TabItem[] = [
    { id: 'profile', label: language === 'ru' ? 'Профиль' : 'Profile' },
    { id: 'quests', label: language === 'ru' ? 'Квесты' : 'Quests' },
    { id: 'attributes', label: language === 'ru' ? 'Характеристики' : 'Attributes' },
    { id: 'class', label: language === 'ru' ? 'Класс' : 'Class' },
    { id: 'achievements', label: language === 'ru' ? 'Достижения' : 'Achievements' },
    { id: 'activity', label: language === 'ru' ? 'Активность' : 'Activity' },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Геймификация' : 'Gamification'}
        icon={Trophy}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Достижения, уровни, квесты' : 'Achievements, levels, quests'}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Character Profile — always visible */}
        <CharacterProfile />

        {/* Tabs */}
        <ModuleTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor={config.accentColor}
        />

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <AttributeDisplay />
            <XPEventLog />
          </div>
        )}

        {activeTab === 'quests' && (
          <QuestsTab />
        )}

        {activeTab === 'attributes' && (
          <AttributeDisplay />
        )}

        {activeTab === 'class' && (
          <ClassDisplay />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab />
        )}

        {activeTab === 'activity' && (
          <XPEventLog />
        )}
      </div>
    </div>
  );
}
