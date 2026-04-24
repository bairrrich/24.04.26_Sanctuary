'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { t } from '@/lib/i18n';
import { MODULE_ORDER, MODULE_REGISTRY } from '@/lib/module-config';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import type { LucideIcon } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';

function getIconByName(iconName: string): LucideIcon {
  const candidate = (Icons as Record<string, unknown>)[iconName];
  if (typeof candidate === 'function') {
    return candidate as LucideIcon;
  }
  return Icons.Circle;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const activeModule = useAppStore((s) => s.activeModule);
  const recentModules = useAppStore((s) => s.recentModules);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isHotkey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isHotkey) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const openPalette = () => setOpen(true);
    window.addEventListener('command-palette:open', openPalette);
    return () => window.removeEventListener('command-palette:open', openPalette);
  }, []);

  const modules = useMemo(
    () => MODULE_ORDER.map((id) => MODULE_REGISTRY[id]),
    []
  );
  const recent = useMemo(
    () => recentModules.map((id) => MODULE_REGISTRY[id]),
    [recentModules]
  );

  const triggerFab = () => {
    requestAnimationFrame(() => {
      const fab = document.querySelector<HTMLButtonElement>('[data-fab=\"true\"]');
      fab?.click();
    });
  };

  const copyCurrentModuleLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('module', activeModule);
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // Clipboard may be unavailable in some contexts; ignore silently.
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={language === 'ru' ? 'Быстрый поиск' : 'Quick Search'}
      description={language === 'ru' ? 'Переключение модулей и быстрые действия' : 'Module switcher and quick actions'}
    >
      <CommandInput
        placeholder={language === 'ru' ? 'Введите модуль или действие…' : 'Type a module or action…'}
      />
      <CommandList>
        <CommandEmpty>
          {language === 'ru' ? 'Ничего не найдено' : 'No results found'}
        </CommandEmpty>

        <CommandGroup heading={language === 'ru' ? 'Модули' : 'Modules'}>
          {modules.map((module) => {
            const Icon = getIconByName(module.icon);
            return (
              <CommandItem
                key={module.id}
                value={`${module.id} ${module.nameKey} ${module.description}`}
                onSelect={() => {
                  setActiveModule(module.id);
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{t(language, module.nameKey)}</span>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {recent.length > 0 && (
          <>
            <CommandGroup heading={language === 'ru' ? 'Недавние' : 'Recent'}>
              {recent.map((module) => {
                const Icon = getIconByName(module.icon);
                return (
                  <CommandItem
                    key={`recent-${module.id}`}
                    value={`recent ${module.id} ${module.nameKey}`}
                    onSelect={() => {
                      setActiveModule(module.id);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(language, module.nameKey)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading={language === 'ru' ? 'Быстрые действия' : 'Quick Actions'}>
          <CommandItem
            value="create add new"
            onSelect={() => {
              setOpen(false);
              triggerFab();
            }}
          >
            <Icons.Plus className="h-4 w-4" />
            <span>
              {language === 'ru'
                ? `Создать в модуле: ${t(language, MODULE_REGISTRY[activeModule].nameKey)}`
                : `Create in ${t(language, MODULE_REGISTRY[activeModule].nameKey)}`}
            </span>
          </CommandItem>

          <CommandItem
            value="settings preferences"
            onSelect={() => {
              setActiveModule('settings');
              setOpen(false);
            }}
          >
            <Icons.Settings className="h-4 w-4" />
            <span>{language === 'ru' ? 'Открыть настройки' : 'Open settings'}</span>
          </CommandItem>

          <CommandItem
            value="copy share module link"
            onSelect={() => {
              void copyCurrentModuleLink();
              setOpen(false);
            }}
          >
            <Icons.Link className="h-4 w-4" />
            <span>
              {language === 'ru'
                ? `Скопировать ссылку на модуль: ${t(language, MODULE_REGISTRY[activeModule].nameKey)}`
                : `Copy module link: ${t(language, MODULE_REGISTRY[activeModule].nameKey)}`}
            </span>
          </CommandItem>

          <CommandItem
            value="today calendar"
            onSelect={() => {
              setActiveModule('calendar');
              setOpen(false);
            }}
          >
            <Icons.Calendar className="h-4 w-4" />
            <span>{language === 'ru' ? 'Открыть календарь' : 'Open calendar'}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
