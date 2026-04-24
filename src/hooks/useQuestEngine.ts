'use client';

import { useCallback } from 'react';

interface QuestProgressResult {
  progressed: boolean;
  questCount: number;
  completedCount: number;
}

/**
 * Hook for quest progress tracking.
 * After an action, refreshes quest data from the API and dispatches
 * a custom event so quest UI components can update.
 *
 * Usage:
 *   const questEngine = useQuestEngine();
 *   const result = await questEngine('habits', 'habit_complete');
 */
export function useQuestEngine() {
  return useCallback(async (module: string, action: string): Promise<QuestProgressResult> => {
    try {
      // Fetch updated quest data
      const res = await fetch('/api/gamification/quests?status=all');
      if (res.ok) {
        const data = await res.json();
        const quests = data.quests ?? [];
        const completedCount = quests.filter(
          (q: { status: string }) => q.status === 'completed'
        ).length;

        // Dispatch event so quest UI can refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('gamification:quests-updated', {
              detail: {
                module,
                action,
                quests,
                questCount: quests.length,
                completedCount,
              },
            })
          );
        }

        return {
          progressed: true,
          questCount: quests.length,
          completedCount,
        };
      }
    } catch (error) {
      console.error('Error refreshing quest data:', error);
    }

    return { progressed: false, questCount: 0, completedCount: 0 };
  }, []);
}
