'use client';

import { motion } from 'framer-motion';
import {
  Rss, Wallet, Apple, Dumbbell, MoreHorizontal,
  BookOpen, CalendarClock, Target, Library, GitBranch,
  Heart, Calendar, Sparkles, Trophy, Bell, Settings, X,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import { MODULE_REGISTRY, getMoreNavModules } from '@/lib/module-config';
import { LAYOUT, ANIMATION, Z_INDEX } from '@/lib/constants';
import { t } from '@/lib/i18n';
import type { ModuleId } from '@/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rss, Wallet, Apple, Dumbbell, MoreHorizontal,
  BookOpen, CalendarClock, Target, Library, GitBranch,
  Heart, Calendar, Sparkles, Trophy, Bell, Settings, X,
};

const NAV_ITEMS: { moduleId: ModuleId; icon: string; labelKey: string }[] = [
  { moduleId: 'feed', icon: 'Rss', labelKey: 'nav.home' },
  { moduleId: 'finance', icon: 'Wallet', labelKey: 'nav.finance' },
  { moduleId: 'nutrition', icon: 'Apple', labelKey: 'nav.nutrition' },
  { moduleId: 'training', icon: 'Dumbbell', labelKey: 'nav.training' },
];

interface MobileNavbarProps {
  activeModule: ModuleId;
  onModuleSelect: (module: ModuleId) => void;
}

export function MobileNavbar({ activeModule, onModuleSelect }: MobileNavbarProps) {
  const moreMenuOpen = useAppStore((s) => s.moreMenuOpen);
  const setMoreMenuOpen = useAppStore((s) => s.setMoreMenuOpen);
  const language = useSettingsStore((s) => s.language);
  const moreModules = getMoreNavModules();

  const isMoreActive = moreModules.some((m) => m.id === activeModule);

  return (
    <>
      {/* More Menu Overlay */}
      {moreMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMoreMenuOpen(false)}
        />
      )}

      {/* More Menu Sheet */}
      {moreMenuOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={ANIMATION.SPRING_BOUNCY}
          className="fixed bottom-16 left-0 right-0 bg-background border-t rounded-t-2xl z-50 lg:hidden max-h-[60vh] overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{t(language, 'nav.modules')}</h3>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {moreModules.map((mod) => {
                const Icon = ICON_MAP[mod.icon];
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onModuleSelect(mod.id);
                      setMoreMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors hover:bg-muted"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: isActive ? `${mod.accentColor}20` : undefined,
                      }}
                    >
                      {Icon && (
                        <Icon
                          className="h-5 w-5"
                          style={{ color: isActive ? mod.accentColor : undefined }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium truncate w-full text-center"
                      style={{ color: isActive ? mod.accentColor : undefined }}
                    >
                      {t(language, mod.nameKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md lg:hidden"
        style={{ height: LAYOUT.MOBILE_NAV_HEIGHT, zIndex: Z_INDEX.MOBILE_NAV }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const mod = MODULE_REGISTRY[item.moduleId];
            const isActive = activeModule === item.moduleId;
            return (
              <button
                key={item.moduleId}
                onClick={() => onModuleSelect(item.moduleId)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors min-w-[56px]"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  style={{
                    backgroundColor: isActive ? `${mod.accentColor}15` : undefined,
                  }}
                >
                  {Icon && (
                    <Icon
                      className="h-4.5 w-4.5 transition-colors"
                      style={{ color: isActive ? mod.accentColor : undefined }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? mod.accentColor : undefined }}
                >
                  {t(language, item.labelKey)}
                </span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors min-w-[56px]"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: isMoreActive ? 'hsl(var(--accent))' : undefined,
              }}
            >
              <MoreHorizontal
                className="h-4.5 w-4.5"
                style={{ color: isMoreActive ? 'hsl(var(--primary))' : undefined }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {t(language, 'nav.more')}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
