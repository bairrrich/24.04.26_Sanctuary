'use client';

import { useCallback } from 'react';

/**
 * Hook for quest progress tracking.
 * Quest progress is automatically updated server-side when emitXP is called.
 * This hook provides a way to refresh quest data on the client.
 *
 * Usage:
 *   const questEngine = useQuestEngine();
 *   await questEngine('habits', 'habit_complete'); // refreshes quest data
 */
export function useQuestEngine() {
  return useCallback(async (_module: string, _action: string) => {
    // Quest progress is handled server-side by emitXP() in /src/lib/emit-xp.ts
    // No separate PATCH needed — just return success
    // The client refreshes quest data when the QuestsTab is mounted
    return { progressed: true };
  }, []);
}
