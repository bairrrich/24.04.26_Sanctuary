'use client';

import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';
import { getClassIcon, getClassName, getTierName } from '@/lib/class-system';
import { getXPProgressInLevel, xpForCharacterLevel } from '@/lib/xp-engine';
import { ANIMATION, RPG } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';
import type { RPGAttribute } from '@/types';

const ATTRIBUTE_META: Record<RPGAttribute, { icon: string; color: string; nameKey: string }> = {
  strength:     { icon: '⚔️', color: '#ef4444', nameKey: 'rpg.strength' },
  agility:      { icon: '⚡', color: '#f59e0b', nameKey: 'rpg.agility' },
  intelligence: { icon: '🧠', color: '#6366f1', nameKey: 'rpg.intelligence' },
  endurance:    { icon: '🛡️', color: '#22c55e', nameKey: 'rpg.endurance' },
  charisma:     { icon: '⭐', color: '#ec4899', nameKey: 'rpg.charisma' },
};

interface CharacterProfileProps {
  onEditName?: () => void;
}

export function CharacterProfile({ onEditName }: CharacterProfileProps) {
  const language = useSettingsStore((s) => s.language);
  const {
    name,
    level,
    totalXP,
    currentClassId,
    isHybrid,
    hybridClassId,
    attributes,
  } = useGamificationStore();

  const progress = getXPProgressInLevel(totalXP, level);
  const classIcon = getClassIcon(currentClassId);
  const className = getClassName(currentClassId, language);
  const hybridName = hybridClassId ? getClassName(hybridClassId, language) : null;

  const currentClass = getClassById(currentClassId);
  const tierName = currentClass ? getTierName(currentClass.tier, language) : '';

  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      transition={ANIMATION.SPRING_GENTLE}
      className="relative rounded-2xl border bg-card overflow-hidden"
    >
      {/* Background gradient based on class tier */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${ATTRIBUTE_META[getDominantAttribute(attributes)].color}, transparent 60%)`,
        }}
      />

      <div className="relative p-5 space-y-4">
        {/* Header: Avatar + Name + Class */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
              {classIcon}
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-card">
              {level}
            </div>
          </div>

          {/* Name & Class */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold truncate">{name}</h2>
              {onEditName && (
                <button
                  onClick={onEditName}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-medium text-primary">{className}</span>
              {isHybrid && hybridName && (
                <span className="text-xs text-muted-foreground">× {hybridName}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{tierName}</span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {language === 'ru' ? 'Уровень' : 'Level'} {level}
            </span>
            <span className="text-muted-foreground">
              {progress.current} / {progress.needed} XP
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(ATTRIBUTE_META) as [RPGAttribute, typeof ATTRIBUTE_META.strength][]).map(
            ([attr, meta]) => {
              const attrData = attributes[attr];
              const attrProgress = attrData
                ? getAttributeXPProgress(attrData.xp, attrData.level)
                : { percentage: 0 };

              return (
                <motion.button
                  key={attr}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-[10px] font-bold" style={{ color: meta.color }}>
                    {attrData?.level ?? 1}
                  </span>
                  <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${attrProgress.percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                  </div>
                </motion.button>
              );
            }
          )}
        </div>

        {/* Total XP */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">
            {language === 'ru' ? 'Всего опыта' : 'Total XP'}:
          </span>
          <span className="text-sm font-bold text-primary">{totalXP.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Helper: get dominant attribute from attribute map
function getDominantAttribute(
  attributes: Record<RPGAttribute, { xp: number; level: number }>
): RPGAttribute {
  let dominant: RPGAttribute = 'strength';
  let maxXP = 0;
  for (const [key, val] of Object.entries(attributes)) {
    if (val.xp > maxXP) {
      maxXP = val.xp;
      dominant = key as RPGAttribute;
    }
  }
  return dominant;
}

// Need to import this
function getAttributeXPProgress(currentXP: number, currentLevel: number) {
  const xpForCurrentLevel = totalAttrXP(currentLevel);
  const xpForNextLevel = totalAttrXP(currentLevel + 1);
  const current = currentXP - xpForCurrentLevel;
  const needed = xpForNextLevel - xpForCurrentLevel;
  return {
    current: Math.max(0, current),
    needed,
    percentage: Math.min(100, Math.max(0, (current / needed) * 100)),
  };
}

function totalAttrXP(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(80 * Math.pow(i, 1.4));
  }
  return total;
}

// Import for class lookup
import { getClassById } from '@/lib/class-system';
