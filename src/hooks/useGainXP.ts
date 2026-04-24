'use client';

import { useCallback } from 'react';
import { useGamificationStore } from '@/store/gamification-store';

/**
 * Unified hook for gaining XP from any module action.
 * All modules MUST use this hook to emit XP — gamification is the CORE.
 *
 * Usage:
 *   const gainXP = useGainXP();
 *   gainXP('habits', 'habit_complete'); // emits XP + updates character + triggers quest progress
 */
export function useGainXP() {
  const emitXP = useGamificationStore((s) => s.emitXP);
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  return useCallback(async (module: string, action: string) => {
    try {
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
        // Dispatch event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamification:updated', { detail: data }));
        }
        return data;
      }
    } catch (error) {
      console.error('Error emitting XP:', error);
    }
    return null;
  }, [emitXP, loadCharacter]);
}
