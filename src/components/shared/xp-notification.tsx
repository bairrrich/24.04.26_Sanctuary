'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { getClassById, getHybridClass } from '@/lib/class-system';
import type { RPGAttribute } from '@/types';

// ==================== Types ====================

interface XPNotificationData {
  module: string;
  action: string;
  xpAmount?: number;
  attribute?: RPGAttribute;
  newLevel?: number;
  newTotalXP?: number;
  previousLevel?: number;
  className?: string;
  classId?: string;
  isHybrid?: boolean;
  hybridClassId?: string;
  achievementsUnlocked?: string[];
}

interface NotificationItem {
  id: string;
  type: 'xp' | 'levelup';
  data: XPNotificationData;
  createdAt: number;
}

// ==================== Constants ====================

const ATTRIBUTE_COLORS: Record<string, string> = {
  strength: '#ef4444',
  agility: '#f59e0b',
  intelligence: '#3b82f6',
  endurance: '#22c55e',
  charisma: '#ec4899',
};

const ATTRIBUTE_LABELS: Record<string, { en: string; ru: string }> = {
  strength: { en: 'Strength', ru: 'Сила' },
  agility: { en: 'Agility', ru: 'Ловкость' },
  intelligence: { en: 'Intelligence', ru: 'Интеллект' },
  endurance: { en: 'Endurance', ru: 'Выносливость' },
  charisma: { en: 'Charisma', ru: 'Харизма' },
};

const MODULE_ICONS: Record<string, string> = {
  habits: '🎯',
  nutrition: '🥗',
  training: '🏋️',
  finance: '💰',
  diary: '📝',
  health: '❤️',
  collections: '📚',
  shifts: '📅',
  feed: '📡',
  genealogy: '🌳',
  looksmaxxing: '✨',
  calendar: '📆',
  gamification: '🏆',
  quests: '📜',
};

const MAX_VISIBLE = 3;
const XP_DISMISS_MS = 3000;
const LEVELUP_DISMISS_MS = 5000;

// ==================== Component ====================

export function XPNotification() {
  const language = useSettingsStore((s) => s.language);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback(
    (data: XPNotificationData) => {
      const isLevelUp =
        data.previousLevel !== undefined &&
        data.newLevel !== undefined &&
        data.newLevel > data.previousLevel;

      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item: NotificationItem = {
        id,
        type: isLevelUp ? 'levelup' : 'xp',
        data,
        createdAt: Date.now(),
      };

      setNotifications((prev) => {
        const updated = [...prev, item];
        // Keep only the last MAX_VISIBLE
        if (updated.length > MAX_VISIBLE) {
          const removed = updated.slice(0, updated.length - MAX_VISIBLE);
          removed.forEach((n) => {
            const timer = timersRef.current.get(n.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(n.id);
            }
          });
          return updated.slice(-MAX_VISIBLE);
        }
        return updated;
      });

      // Auto-dismiss
      const dismissMs = isLevelUp ? LEVELUP_DISMISS_MS : XP_DISMISS_MS;
      const timer = setTimeout(() => removeNotification(id), dismissMs);
      timersRef.current.set(id, timer);
    },
    [removeNotification]
  );

  useEffect(() => {
    const handleGamificationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<XPNotificationData>;
      if (customEvent.detail) {
        addNotification(customEvent.detail);
      }
    };

    window.addEventListener('gamification:updated', handleGamificationUpdate);
    return () => {
      window.removeEventListener('gamification:updated', handleGamificationUpdate);
      // Clear all timers
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [addNotification]);

  // Get class name for level-up notification
  const getClassNameDisplay = (data: XPNotificationData): string => {
    if (data.classId) {
      const cls = getClassById(data.classId);
      if (cls) return language === 'ru' ? cls.nameRu : cls.nameEn;
    }
    if (data.hybridClassId) {
      const hybrid = getHybridClass(
        // We don't know the exact attributes, just try to find by id
        ['strength', 'agility'] as [RPGAttribute, RPGAttribute] // fallback
      );
      if (hybrid) return language === 'ru' ? hybrid.nameRu : hybrid.nameEn;
    }
    return '';
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-xs">
      <AnimatePresence>
        {notifications.map((notification) => {
          const { data, type, id } = notification;
          const isLevelUp = type === 'levelup';
          const attrColor = data.attribute
            ? ATTRIBUTE_COLORS[data.attribute] ?? '#6366f1'
            : '#6366f1';
          const attrLabel = data.attribute
            ? ATTRIBUTE_LABELS[data.attribute]
            : null;
          const moduleIcon = MODULE_ICONS[data.module] ?? '⚡';

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto"
            >
              {isLevelUp ? (
                // Level Up Notification — bigger, more prominent
                <div
                  className="rounded-xl border-2 p-3 shadow-lg backdrop-blur-sm"
                  style={{
                    borderColor: attrColor,
                    backgroundColor: 'color-mix(in srgb, var(--card) 92%, transparent)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⬆️</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">
                        {language === 'ru' ? 'Уровень повышен!' : 'Level Up!'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'Уровень' : 'Level'} {data.newLevel}
                      </div>
                      {data.classId && (
                        <div
                          className="text-[10px] font-semibold mt-0.5"
                          style={{ color: attrColor }}
                        >
                          {getClassNameDisplay(data)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Regular XP Notification
                <div
                  className="rounded-xl border p-2.5 shadow-md backdrop-blur-sm"
                  style={{
                    borderColor: `${attrColor}40`,
                    backgroundColor: 'color-mix(in srgb, var(--card) 92%, transparent)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{moduleIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-sm font-bold"
                          style={{ color: attrColor }}
                        >
                          +{data.xpAmount ?? 0} XP
                        </span>
                        {attrLabel && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${attrColor}20`,
                              color: attrColor,
                            }}
                          >
                            {language === 'ru' ? attrLabel.ru : attrLabel.en}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
