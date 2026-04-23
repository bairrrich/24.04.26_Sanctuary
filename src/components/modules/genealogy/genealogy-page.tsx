'use client';

import { GitBranch } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function GenealogyPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.genealogy;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.genealogy')}
        icon={GitBranch}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Генеалогическое древо и жизненные события' : 'Family tree and life events'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={GitBranch}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
