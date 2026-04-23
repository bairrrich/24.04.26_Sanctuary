'use client';

import { Shield, Heart, Code } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';

export function AboutSettings() {
  const language = useSettingsStore((s) => s.language);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">{t(language, 'settings.about')}</h3>
      </div>

      {/* App Identity */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary mb-3">
          <span className="text-2xl font-bold text-primary-foreground">S</span>
        </div>
        <h2 className="text-xl font-bold">Sanctuary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'ru'
            ? 'Ваша универсальная система управления жизнью'
            : 'Your all-in-one life management system'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {t(language, 'settings.version')} 1.0.0
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <FeatureItem
          icon={Shield}
          title={language === 'ru' ? 'Приватность' : 'Privacy'}
          description={language === 'ru'
            ? 'Все данные хранятся локально на вашем устройстве'
            : 'All data is stored locally on your device'}
        />
        <FeatureItem
          icon={Heart}
          title={language === 'ru' ? 'Кросс-модульная интеграция' : 'Cross-module integration'}
          description={language === 'ru'
            ? 'Все модули связаны между собой для целостного опыта'
            : 'All modules are interconnected for a holistic experience'}
        />
        <FeatureItem
          icon={Code}
          title={language === 'ru' ? 'Открытая архитектура' : 'Open architecture'}
          description={language === 'ru'
            ? 'Легко расширяется новыми модулями и функциями'
            : 'Easily extensible with new modules and features'}
        />
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
