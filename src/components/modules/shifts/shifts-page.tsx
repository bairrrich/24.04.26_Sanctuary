'use client';

import { CalendarClock } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function ShiftsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.shifts;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.shifts')}
        icon={CalendarClock}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'График смен и переработок' : 'Shift schedule and overtime'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={CalendarClock}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
