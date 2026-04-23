'use client';

import { motion } from 'framer-motion';
import { ANIMATION } from '@/lib/constants';
import { getClassName, getClassIcon, getClassesForAttribute, getTierName, getClassById } from '@/lib/class-system';
import { totalXPForAttributeLevel, xpForAttributeLevel } from '@/lib/xp-engine';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';
import type { RPGAttribute } from '@/types';

const ATTRIBUTE_META: Record<RPGAttribute, { icon: string; color: string; bgColor: string; nameKey: string }> = {
  strength:     { icon: '⚔️', color: '#ef4444', bgColor: '#fef2f2', nameKey: 'rpg.strength' },
  agility:      { icon: '⚡', color: '#f59e0b', bgColor: '#fffbeb', nameKey: 'rpg.agility' },
  intelligence: { icon: '🧠', color: '#6366f1', bgColor: '#eef2ff', nameKey: 'rpg.intelligence' },
  endurance:    { icon: '🛡️', color: '#22c55e', bgColor: '#f0fdf4', nameKey: 'rpg.endurance' },
  charisma:     { icon: '⭐', color: '#ec4899', bgColor: '#fdf2f8', nameKey: 'rpg.charisma' },
};

export function AttributeDisplay() {
  const language = useSettingsStore((s) => s.language);
  const { attributes, currentClassId } = useGamificationStore();
  const currentClass = getClassById(currentClassId);

  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      transition={ANIMATION.SPRING_GENTLE}
      className="rounded-2xl border bg-card p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold">
        {language === 'ru' ? 'Характеристики' : 'Attributes'}
      </h3>

      <div className="space-y-3">
        {(Object.entries(ATTRIBUTE_META) as [RPGAttribute, typeof ATTRIBUTE_META.strength][]).map(
          ([attr, meta], index) => {
            const attrData = attributes[attr];
            const xp = attrData?.xp ?? 0;
            const attrLevel = attrData?.level ?? 1;
            const isDominant = currentClass?.primaryAttribute === attr;

            // XP progress within current attribute level
            const xpForCurrentLevel = totalXPForAttributeLevel(attrLevel);
            const xpForNextLevel = totalXPForAttributeLevel(attrLevel + 1);
            const progressXP = xp - xpForCurrentLevel;
            const neededXP = xpForNextLevel - xpForCurrentLevel;
            const percentage = neededXP > 0 ? Math.min(100, Math.max(0, (progressXP / neededXP) * 100)) : 0;

            // Class progression for this attribute
            const classLineage = getClassesForAttribute(attr);

            return (
              <motion.div
                key={attr}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * ANIMATION.STAGGER_DELAY, ...ANIMATION.SPRING_GENTLE }}
                className={`rounded-xl p-3 transition-colors ${
                  isDominant ? 'ring-1' : ''
                }`}
                style={{
                  backgroundColor: `${meta.color}08`,
                  ...(isDominant ? { ringColor: `${meta.color}40` } : {}),
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t_rpg(attr, language)}</span>
                        {isDominant && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                          >
                            {language === 'ru' ? 'Основа' : 'Core'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: meta.color }}>
                        {attrLevel}
                      </span>
                    </div>

                    {/* XP Bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {xp.toLocaleString()} XP
                      </span>
                    </div>

                    {/* Class lineage */}
                    <div className="flex items-center gap-1 mt-2">
                      {classLineage.map((cls, i) => {
                        const isUnlocked = cls.requiredLevel <= (currentClassId === cls.id ? 999 : attrLevel);
                        return (
                          <span
                            key={cls.id}
                            className={`text-[10px] ${isUnlocked ? '' : 'opacity-30'}`}
                            title={language === 'ru' ? cls.nameRu : cls.nameEn}
                          >
                            {cls.icon}
                            {i < classLineage.length - 1 && (
                              <span className="mx-0.5 text-muted-foreground">→</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }
        )}
      </div>
    </motion.div>
  );
}

function t_rpg(attr: RPGAttribute, lang: 'en' | 'ru'): string {
  const names: Record<RPGAttribute, { en: string; ru: string }> = {
    strength: { en: 'Strength', ru: 'Сила' },
    agility: { en: 'Agility', ru: 'Ловкость' },
    intelligence: { en: 'Intelligence', ru: 'Интеллект' },
    endurance: { en: 'Endurance', ru: 'Выносливость' },
    charisma: { en: 'Charisma', ru: 'Харизма' },
  };
  return names[attr][lang];
}
