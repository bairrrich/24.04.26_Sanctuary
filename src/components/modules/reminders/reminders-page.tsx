'use client';

import { Bell } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function RemindersPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.reminders;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.reminders')}
        icon={Bell}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Напоминания из всех модулей' : 'Reminders from all modules'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Bell}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
