'use client';

import { Dumbbell } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function TrainingPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.training;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.training')}
        icon={Dumbbell}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Журнал тренировок и упражнений' : 'Workout and exercise log'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Dumbbell}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
