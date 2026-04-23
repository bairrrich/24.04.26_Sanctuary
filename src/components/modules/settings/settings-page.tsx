'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, Globe, Ruler, Database, Info } from 'lucide-react';
import { PageHeader, ModuleTabs } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { useSettingsStore } from '@/store/settings-store';
import { t } from '@/lib/i18n';
import { ThemeSettings } from './theme-settings';
import { LanguageSettings } from './language-settings';
import { UnitsSettings } from './units-settings';
import { DataSettings } from './data-settings';
import { AboutSettings } from './about-settings';
import type { TabItem } from '@/types';

const SETTINGS_TABS: TabItem[] = [
  { id: 'theme', label: 'Тема', icon: 'Palette' },
  { id: 'language', label: 'Язык', icon: 'Globe' },
  { id: 'units', label: 'Единицы', icon: 'Ruler' },
  { id: 'data', label: 'Данные', icon: 'Database' },
  { id: 'about', label: 'О приложении', icon: 'Info' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('theme');
  const language = useSettingsStore((s) => s.language);
  const moduleConfig = MODULE_REGISTRY.settings;

  const tabs: TabItem[] = [
    { id: 'theme', label: t(language, 'settings.theme') },
    { id: 'language', label: t(language, 'settings.language') },
    { id: 'units', label: t(language, 'settings.units') },
    { id: 'data', label: t(language, 'settings.data') },
    { id: 'about', label: t(language, 'settings.about') },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t(language, 'modules.settings')}
        icon={Settings}
        accentColor={moduleConfig.accentColor}
      />

      <div className="px-4 sm:px-6 py-4 space-y-4">
        <ModuleTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor={moduleConfig.accentColor}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'theme' && <ThemeSettings />}
            {activeTab === 'language' && <LanguageSettings />}
            {activeTab === 'units' && <UnitsSettings />}
            {activeTab === 'data' && <DataSettings />}
            {activeTab === 'about' && <AboutSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
