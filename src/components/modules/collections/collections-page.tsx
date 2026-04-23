'use client';

import { Library } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function CollectionsPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.collections;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.collections')}
        icon={Library}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Книги, фильмы, рецепты и другое' : 'Books, movies, recipes and more'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={Library}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
