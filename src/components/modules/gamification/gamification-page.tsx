'use client';

import { Trophy } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function GamificationPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.gamification;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.gamification')}
        icon={Trophy}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Достижения, уровни, квесты' : 'Achievements, levels, quests'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Trophy}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
