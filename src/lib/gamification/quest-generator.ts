/**
 * Quest Generator — dynamically generates daily and weekly quests
 * from the quest pool, ensuring variety across categories.
 */
import { QUEST_POOL } from './quest-pool';
import type { QuestTemplate, QuestCategory, QuestType } from './quest-pool';

// ==================== Utility ====================

/** Fisher-Yates shuffle, returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ==================== Generators ====================

/**
 * Generate a set of daily quests.
 * Selects `count` quests from different categories for maximum variety.
 * Prefers easy/medium difficulty for dailies.
 */
export function generateDailyQuests(count: number = 4): QuestTemplate[] {
  const dailyPool = QUEST_POOL.filter(q => q.type === 'daily');
  return selectFromDifferentCategories(dailyPool, count);
}

/**
 * Generate a set of weekly quests.
 * Selects harder quests (medium/hard difficulty).
 */
export function generateWeeklyQuests(count: number = 2): QuestTemplate[] {
  const weeklyPool = QUEST_POOL.filter(q =>
    q.type === 'weekly' || (q.type === 'challenge' && q.difficulty !== 'hard')
  );
  return selectFromDifferentCategories(weeklyPool, count);
}

/**
 * Generate a set of challenge quests.
 * Only hard difficulty quests.
 */
export function generateChallengeQuests(count: number = 1): QuestTemplate[] {
  const challengePool = QUEST_POOL.filter(q =>
    q.type === 'challenge' && q.difficulty === 'hard'
  );
  return selectFromDifferentCategories(challengePool, count);
}

/**
 * Generate quiz/knowledge quests.
 */
export function generateQuizQuests(count: number = 1): QuestTemplate[] {
  const quizPool = QUEST_POOL.filter(q => q.type === 'quiz' || q.type === 'knowledge');
  return shuffle(quizPool).slice(0, count);
}

/**
 * Find a specific quest template by ID.
 */
export function generateQuestById(id: string): QuestTemplate | undefined {
  return QUEST_POOL.find(q => q.id === id);
}

/**
 * Get all quests of a specific type.
 */
export function getQuestsByType(type: QuestType): QuestTemplate[] {
  return QUEST_POOL.filter(q => q.type === type);
}

/**
 * Get all quests of a specific category.
 */
export function getQuestsByCategory(category: QuestCategory): QuestTemplate[] {
  return QUEST_POOL.filter(q => q.category === category);
}

/**
 * Generate a full set of quests for a day:
 *  - 4 daily
 *  - 2 weekly
 *  - 1 challenge
 *  - 1 quiz
 */
export function generateDailyQuestSet(): QuestTemplate[] {
  return [
    ...generateDailyQuests(4),
    ...generateWeeklyQuests(2),
    ...generateChallengeQuests(1),
    ...generateQuizQuests(1),
  ];
}

// ==================== Internal Helpers ====================

/**
 * Select `count` quests ensuring variety across categories.
 * Shuffles within each category, then picks one per category
 * before picking additional from any remaining.
 */
function selectFromDifferentCategories(pool: QuestTemplate[], count: number): QuestTemplate[] {
  if (pool.length === 0) return [];
  if (pool.length <= count) return shuffle(pool);

  // Group by category
  const byCategory = new Map<QuestCategory, QuestTemplate[]>();
  for (const q of pool) {
    const existing = byCategory.get(q.category) ?? [];
    existing.push(q);
    byCategory.set(q.category, existing);
  }

  // Shuffle each category's pool
  for (const [cat, quests] of byCategory) {
    byCategory.set(cat, shuffle(quests));
  }

  const result: QuestTemplate[] = [];
  const categories = shuffle([...byCategory.keys()]);
  let catIndex = 0;

  // First pass: pick one from each category
  const used = new Set<string>();
  for (const cat of categories) {
    if (result.length >= count) break;
    const quests = byCategory.get(cat) ?? [];
    const pick = quests.find(q => !used.has(q.id));
    if (pick) {
      result.push(pick);
      used.add(pick.id);
    }
  }

  // Second pass: fill remaining from shuffled full pool
  if (result.length < count) {
    const remaining = shuffle(pool.filter(q => !used.has(q.id)));
    for (const q of remaining) {
      if (result.length >= count) break;
      result.push(q);
    }
  }

  return result;
}
