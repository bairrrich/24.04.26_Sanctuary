'use client';

import { useCallback } from 'react';
import { useGainXP } from './useGainXP';
import { useQuestEngine } from './useQuestEngine';

/**
 * PRIMARY HOOK — Gamification Core integration.
 * All module actions should flow through this hook.
 * It handles: XP emission → quest progress → character refresh → event dispatch
 *
 * Usage in any module:
 *   const { onAction } = useGamificationCore();
 *   onAction('habits', 'habit_complete'); // emits XP + updates quests
 */
export function useGamificationCore() {
  const gainXP = useGainXP();
  const questEngine = useQuestEngine();

  const onAction = useCallback(async (module: string, action: string) => {
    // 1. Emit XP (server-side handles: XP event, attribute update, class recalc, achievement check)
    const xpResult = await gainXP(module, action);

    // 2. Update quest progress
    const questResult = await questEngine(module, action);

    return { xpResult, questResult };
  }, [gainXP, questEngine]);

  return { onAction };
}
