'use client';

import { useCallback, useRef } from 'react';
import { useGamificationStore } from '@/store/gamification-store';

/**
 * Unified hook for gaining XP from any module action.
 * All modules MUST use this hook to emit XP — gamification is the CORE.
 *
 * Dispatches `gamification:updated` custom event with detailed info
 * so XP notification components can display proper toasts.
 *
 * Usage:
 *   const gainXP = useGainXP();
 *   gainXP('habits', 'habit_complete'); // emits XP + updates character + triggers quest progress
 */
export function useGainXP() {
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);
  const previousLevelRef = useRef<number | null>(null);

  return useCallback(async (module: string, action: string) => {
    try {
      // Track previous level before the API call
      const charRes = await fetch('/api/gamification/character');
      let previousLevel: number | undefined;
      if (charRes.ok) {
        const charData = await charRes.json();
        if (charData.character) {
          previousLevel = charData.character.level;
        }
      }

      // Call the server-side emitXP endpoint
      const res = await fetch('/api/gamification/emit-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, action }),
      });

      if (res.ok) {
        const data = await res.json();

        // Refresh character data
        await loadCharacter();

        // Dispatch event with detailed info for notifications
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('gamification:updated', {
              detail: {
                module,
                action,
                xpAmount: data.xpGained?.amount ?? data.emitResult?.amount,
                attribute: data.xpGained?.attribute ?? data.emitResult?.attribute,
                newLevel: data.character?.level,
                newTotalXP: data.character?.totalXP,
                previousLevel,
                classId: data.character?.currentClassId,
                isHybrid: data.character?.isHybrid,
                hybridClassId: data.character?.hybridClassId,
                achievementsUnlocked: data.achievementsUnlocked,
                leveledUp: data.leveledUp,
              },
            })
          );
        }

        return data;
      }
    } catch (error) {
      console.error('Error emitting XP:', error);
    }
    return null;
  }, [loadCharacter]);
}
