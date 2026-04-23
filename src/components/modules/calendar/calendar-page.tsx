'use client';

import { Calendar } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function CalendarPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.calendar;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.calendar')}
        icon={Calendar}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Единый календарь событий' : 'Unified event calendar'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Calendar}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
