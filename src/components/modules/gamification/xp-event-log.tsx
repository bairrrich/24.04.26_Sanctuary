'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ANIMATION } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';
import type { RPGAttribute } from '@/types';

const ATTRIBUTE_COLORS: Record<RPGAttribute, string> = {
  strength: '#ef4444',
  agility: '#f59e0b',
  intelligence: '#6366f1',
  endurance: '#22c55e',
  charisma: '#ec4899',
};

const MODULE_COLORS: Record<string, string> = {
  habits: '#06b6d4',
  nutrition: '#22c55e',
  training: '#ef4444',
  finance: '#10b981',
  diary: '#a855f7',
  health: '#f97316',
  collections: '#d946ef',
  shifts: '#14b8a6',
  feed: '#f59e0b',
  genealogy: '#84cc16',
  looksmaxxing: '#ec4899',
  calendar: '#6366f1',
  quests: '#eab308',
};

export function XPEventLog() {
  const language = useSettingsStore((s) => s.language);
  const { recentXPEvents } = useGamificationStore();

  if (recentXPEvents.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {language === 'ru' ? 'Нет недавних событий' : 'No recent events'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-2">
      <h3 className="text-sm font-semibold mb-3">
        {language === 'ru' ? 'Последние события' : 'Recent Activity'}
      </h3>

      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        <AnimatePresence>
          {recentXPEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * ANIMATION.STAGGER_DELAY }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors"
            >
              {/* Module dot */}
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: MODULE_COLORS[event.module] || '#888' }}
              />

              {/* Action */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {event.action.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {event.module} • {formatTimeAgo(event.createdAt, language)}
                </p>
              </div>

              {/* XP amount */}
              <div className="flex items-center gap-1 shrink-0">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: ATTRIBUTE_COLORS[event.attribute as RPGAttribute] }}
                />
                <span className="text-xs font-bold text-primary">+{event.amount}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatTimeAgo(isoDate: string, lang: 'en' | 'ru'): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return lang === 'ru' ? 'только что' : 'just now';
  if (minutes < 60) return lang === 'ru' ? `${minutes} мин. назад` : `${minutes}m ago`;
  if (hours < 24) return lang === 'ru' ? `${hours} ч. назад` : `${hours}h ago`;
  return lang === 'ru' ? `${days} дн. назад` : `${days}d ago`;
}
