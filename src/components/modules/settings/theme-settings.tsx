'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { value: ThemeMode; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'settings.themeLight' },
  { value: 'dark', icon: Moon, labelKey: 'settings.themeDark' },
  { value: 'system', icon: Monitor, labelKey: 'settings.themeSystem' },
];

export function ThemeSettings() {
  const { setTheme, theme } = useTheme();
  const language = useSettingsStore((s) => s.language);
  const setSettingsTheme = useSettingsStore((s) => s.setTheme);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setSettingsTheme(newTheme);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">{t(language, 'settings.theme')}</h3>
        <p className="text-xs text-muted-foreground">
          {t(language, 'settings.themeDescription')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleThemeChange(option.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  isActive ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {t(language, option.labelKey)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Theme preview */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-medium">
          {language === 'ru' ? 'Предпросмотр' : 'Preview'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-background border p-3">
            <div className="h-2 w-12 rounded bg-foreground mb-2" />
            <div className="h-1.5 w-20 rounded bg-muted-foreground/30 mb-1" />
            <div className="h-1.5 w-16 rounded bg-muted-foreground/30" />
          </div>
          <div className="rounded-lg bg-card border p-3">
            <div className="h-2 w-10 rounded bg-primary mb-2" />
            <div className="h-1.5 w-18 rounded bg-muted-foreground/30 mb-1" />
            <div className="h-1.5 w-14 rounded bg-muted-foreground/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
