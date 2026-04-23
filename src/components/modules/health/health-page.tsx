'use client';

import { Heart } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function HealthPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.health;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.health')}
        icon={Heart}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Самочувствие и болезни' : 'Wellbeing and illness log'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Heart}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
