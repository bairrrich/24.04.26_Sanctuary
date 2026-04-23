'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import type { AppLanguage } from '@/types';

export function LanguageSettings() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const languages: { value: AppLanguage; nativeName: string; englishName: string; flag: string }[] = [
    { value: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
    { value: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">{t(language, 'settings.language')}</h3>
        <p className="text-xs text-muted-foreground">
          {t(language, 'settings.languageDescription')}
        </p>
      </div>

      <div className="space-y-2">
        {languages.map((lang) => {
          const isActive = language === lang.value;

          return (
            <motion.button
              key={lang.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage(lang.value)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                  {lang.nativeName}
                </p>
              </div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                >
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
