'use client';

import { BookOpen } from 'lucide-react';
import { PageHeader, EmptyState, FAB } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function DiaryPage() {
  const language = useSettingsStore((s) => s.language);
  const config = MODULE_REGISTRY.diary;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.diary')}
        icon={BookOpen}
        accentColor={config.accentColor}
        subtitle={language === 'ru' ? 'Ваши мысли и записи' : 'Your thoughts and entries'}
      />
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={BookOpen}
          title={t(language, 'common.comingSoon')}
          description={t(language, 'common.comingSoonDescription')}
          accentColor={config.accentColor}
        />
      </div>
      <FAB accentColor={config.accentColor} onClick={() => {}} />
    </div>
  );
}
