'use client';

import { Wallet } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function FinancePage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.finance;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.finance')}
        icon={Wallet}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Контроль личных финансов' : 'Personal finance control'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Wallet}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
