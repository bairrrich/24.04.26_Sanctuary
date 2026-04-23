'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LAYOUT, ANIMATION } from '@/lib/constants';
import type { TabItem } from '@/types';

interface ModuleTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor?: string;
}

export function ModuleTabs({
  tabs,
  activeTab,
  onTabChange,
  accentColor,
}: ModuleTabsProps) {
  return (
    <motion.div
      initial={ANIMATION.FADE_TRANSITION.initial}
      animate={ANIMATION.FADE_TRANSITION.animate}
    >
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList
          className="h-10 w-full justify-start overflow-x-auto bg-muted/50 p-1"
          style={{ minHeight: LAYOUT.TABS_HEIGHT }}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 text-xs data-[state=active]:shadow-sm shrink-0"
              style={
                activeTab === tab.id && accentColor
                  ? {
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                    }
                  : undefined
              }
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-medium text-primary">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
}
