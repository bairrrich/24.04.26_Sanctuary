'use client';

import { Sparkles } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function LooksmaxxingPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.looksmaxxing;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.looksmaxxing')}
        icon={Sparkles}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Оптимизация внешности и рутины' : 'Look optimization and routines'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Sparkles}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
