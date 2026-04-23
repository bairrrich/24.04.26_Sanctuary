'use client';

import { Target } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function HabitsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.habits;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.habits')}
        icon={Target}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Отслеживание привычек' : 'Habit tracking'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Target}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
