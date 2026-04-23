'use client';

import { Apple } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function NutritionPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.nutrition;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.nutrition')}
        icon={Apple}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Учёт питания и КБЖУ' : 'Nutrition tracking and macros'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Apple}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
