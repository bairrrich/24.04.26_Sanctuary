'use client';

import { motion } from 'framer-motion';
import { ANIMATION } from '@/lib/constants';
import { getClassName, getClassIcon, getTierName, getNextEvolution, getClassById } from '@/lib/class-system';
import { xpForCharacterLevel, totalXPForCharacterLevel } from '@/lib/xp-engine';
import { useSettingsStore } from '@/store/settings-store';
import { useGamificationStore } from '@/store/gamification-store';
import type { RPGAttribute } from '@/types';

export function ClassDisplay() {
  const language = useSettingsStore((s) => s.language);
  const { currentClassId, isHybrid, hybridClassId, level } = useGamificationStore();

  const currentClass = getClassById(currentClassId);
  const classIcon = getClassIcon(currentClassId);
  const className = getClassName(currentClassId, language);
  const tierName = currentClass ? getTierName(currentClass.tier, language) : '';
  const nextEvolution = getNextEvolution(currentClassId);
  const hybridClassName = hybridClassId ? getClassName(hybridClassId, language) : null;
  const hybridIcon = hybridClassId ? getClassIcon(hybridClassId) : null;

  return (
    <motion.div
      initial={ANIMATION.PAGE_TRANSITION.initial}
      animate={ANIMATION.PAGE_TRANSITION.animate}
      transition={ANIMATION.SPRING_GENTLE}
      className="rounded-2xl border bg-card p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold">
        {language === 'ru' ? 'Класс персонажа' : 'Character Class'}
      </h3>

      {/* Current Class Card */}
      <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background text-2xl shadow-sm">
          {classIcon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{className}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
              {tierName}
            </span>
          </div>
          {currentClass && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === 'ru' ? currentClass.descriptionRu : currentClass.descriptionEn}
            </p>
          )}
        </div>
      </div>

      {/* Hybrid Class */}
      {isHybrid && hybridClassName && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed p-3">
          <span className="text-lg">{hybridIcon}</span>
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              {language === 'ru' ? 'Гибридный класс' : 'Hybrid Class'}
            </span>
            <p className="text-sm font-semibold">{hybridClassName}</p>
          </div>
        </div>
      )}

      {/* Next Evolution */}
      {nextEvolution && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {language === 'ru' ? 'Следующая эволюция' : 'Next Evolution'}
          </span>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
              {getClassIcon(nextEvolution.id)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {language === 'ru' ? nextEvolution.nameRu : nextEvolution.nameEn}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {language === 'ru'
                  ? `Доступен с уровня ${nextEvolution.requiredLevel}`
                  : `Available at level ${nextEvolution.requiredLevel}`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-muted-foreground">
                Lv.{nextEvolution.requiredLevel}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
