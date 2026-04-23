'use client';

import { Rss } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function FeedPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.feed;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.feed')}
        icon={Rss}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Делитесь записями из любого модуля' : 'Share records from any module'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Rss}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
