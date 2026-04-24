'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Rss, BookOpen, CalendarClock, Wallet, Apple, Dumbbell,
  Target, Library, GitBranch, Heart, Calendar, Sparkles,
  Trophy, Bell, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import { MODULE_REGISTRY, getMoreNavModules, getPrimaryNavModules } from '@/lib/module-config';
import { LAYOUT, ANIMATION, Z_INDEX } from '@/lib/constants';
import { t } from '@/lib/i18n';
import type { ModuleId } from '@/types';

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, IconComponent> = {
  Rss, BookOpen, CalendarClock, Wallet, Apple, Dumbbell,
  Target, Library, GitBranch, Heart, Calendar, Sparkles,
  Trophy, Bell, Settings,
};

interface SidebarProps {
  activeModule: ModuleId;
  onModuleSelect: (module: ModuleId) => void;
}

export function Sidebar({ activeModule, onModuleSelect }: SidebarProps) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const language = useSettingsStore((s) => s.language);

  const primaryModules = getPrimaryNavModules();
  const moreModules = getMoreNavModules();

  const width = collapsed ? LAYOUT.SIDEBAR_COLLAPSED_WIDTH : LAYOUT.SIDEBAR_WIDTH;

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={ANIMATION.SPRING_GENTLE}
      className="hidden lg:flex flex-col border-r bg-sidebar h-screen sticky top-0 shrink-0"
      style={{ zIndex: Z_INDEX.SIDEBAR }}
    >
      {/* Logo / App Name */}
      <div
        className="flex items-center gap-3 border-b px-4 shrink-0"
        style={{ height: LAYOUT.HEADER_HEIGHT }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">S</span>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base font-semibold tracking-tight"
          >
            Sanctuary
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {/* Primary modules */}
        <div className="space-y-0.5">
          {primaryModules.map((mod) => {
            const Icon = ICON_MAP[mod.icon];
            const isActive = activeModule === mod.id;
            return (
              <SidebarItem
                key={mod.id}
                icon={Icon}
                label={t(language, mod.nameKey)}
                accentColor={mod.accentColor}
                isActive={isActive}
                collapsed={collapsed}
                onClick={() => onModuleSelect(mod.id)}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-3 mx-2 border-t" />

        {/* More modules */}
        <div className="space-y-0.5">
          {moreModules.map((mod) => {
            const Icon = ICON_MAP[mod.icon];
            const isActive = activeModule === mod.id;
            return (
              <SidebarItem
                key={mod.id}
                icon={Icon}
                label={t(language, mod.nameKey)}
                accentColor={mod.accentColor}
                isActive={isActive}
                collapsed={collapsed}
                onClick={() => onModuleSelect(mod.id)}
              />
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">{t(language, 'nav.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

interface SidebarItemProps {
  icon: IconComponent | undefined;
  label: string;
  accentColor: string;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function SidebarItem({ icon: Icon, label, accentColor, isActive, collapsed, onClick }: SidebarItemProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
          style={{ backgroundColor: accentColor }}
          transition={ANIMATION.SPRING_SNAPPY}
        />
      )}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={isActive ? { backgroundColor: `${accentColor}15` } : undefined}
      >
        {Icon && (
          <Icon
            className="h-4 w-4"
            style={isActive ? { color: accentColor } : undefined}
          />
        )}
      </div>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="truncate"
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  );
}
