/**
 * Shared server-side XP emission library.
 *
 * Consolidates the duplicated emitXPInternal from 7 API routes into a single
 * module. Also adds:
 *  - Achievement checking after XP is emitted
 *  - Quest progress updates for active quests matching module:action
 */
import { db } from '@/lib/db';
import { calculateXP, attributeLevelFromXP, characterLevelFromXP } from '@/lib/xp-engine';
import { assignClass } from '@/lib/class-system';
import type { RPGAttribute } from '@/types';

// ==================== Result Type ====================

export interface EmitXPResult {
  attribute: RPGAttribute;
  amount: number;
  newTotalXP: number;
  newLevel: number;
  newAttrXP: number;
  newAttrLevel: number;
  achievementsUnlocked: string[];
  questsProgressed: string[];
}

// ==================== Core emitXP ====================

/**
 * Emit XP for a character action. Handles:
 *  1. Calculate XP from module:action
 *  2. Create XPEvent in DB
 *  3. Update CharacterAttribute XP + level
 *  4. Update Character totalXP + level
 *  5. Recalculate class via assignClass()
 *  6. Check & unlock achievements
 *  7. Progress active quests matching this module:action
 */
export async function emitXP(
  characterId: string,
  module: string,
  action: string,
): Promise<EmitXPResult | null> {
  const xpResult = calculateXP(module, action);
  if (!xpResult) return null;

  // 1. Create XP event
  await db.xPEvent.create({
    data: {
      characterId,
      module,
      action,
      attribute: xpResult.attribute,
      amount: xpResult.amount,
    },
  });

  // 2. Update attribute XP + level
  const currentAttr = await db.characterAttribute.findUnique({
    where: {
      characterId_attribute: { characterId, attribute: xpResult.attribute },
    },
  });

  if (!currentAttr) return null;

  const newAttrXP = currentAttr.xp + xpResult.amount;
  const newAttrLevel = attributeLevelFromXP(newAttrXP);

  await db.characterAttribute.update({
    where: { id: currentAttr.id },
    data: { xp: newAttrXP, level: newAttrLevel },
  });

  // 3. Update character total XP + level
  const character = await db.character.findUnique({
    where: { id: characterId },
    include: { attributes: true },
  });

  if (!character) return null;

  const newTotalXP = character.totalXP + xpResult.amount;
  const newLevel = characterLevelFromXP(newTotalXP);

  // 4. Recalculate class assignment
  const attributeXP: Record<RPGAttribute, number> = {
    strength: 0,
    agility: 0,
    intelligence: 0,
    endurance: 0,
    charisma: 0,
  };
  for (const attr of character.attributes) {
    const key = attr.attribute as RPGAttribute;
    if (key in attributeXP) attributeXP[key] = attr.xp;
  }
  attributeXP[xpResult.attribute] = newAttrXP;

  const classResult = assignClass(attributeXP, newLevel);

  await db.character.update({
    where: { id: characterId },
    data: {
      totalXP: newTotalXP,
      level: newLevel,
      currentClassId: classResult.classId,
    },
  });

  // 5. Achievement checking — run after XP update, catch errors silently
  let achievementsUnlocked: string[] = [];
  try {
    achievementsUnlocked = await checkAndUnlockAchievements(characterId);
  } catch {
    // Non-critical — don't block XP emission
  }

  // 6. Quest progress update — find active quests matching module:action
  let questsProgressed: string[] = [];
  try {
    questsProgressed = await updateQuestProgress(characterId, module, action);
  } catch {
    // Non-critical — don't block XP emission
  }

  return {
    attribute: xpResult.attribute,
    amount: xpResult.amount,
    newTotalXP,
    newLevel,
    newAttrXP,
    newAttrLevel,
    achievementsUnlocked,
    questsProgressed,
  };
}

// ==================== Achievement Checking ====================

/**
 * After XP is emitted, gather stats and check if any new achievements
 * should be unlocked. Creates UserAchievement records for newly met conditions.
 */
async function checkAndUnlockAchievements(characterId: string): Promise<string[]> {
  const character = await db.character.findUnique({
    where: { id: characterId },
    include: { attributes: true, achievements: true },
  });
  if (!character) return [];

  // Build context for achievement checking
  const attributeXP: Record<string, number> = {};
  for (const attr of character.attributes) {
    attributeXP[attr.attribute] = attr.xp;
  }

  // Count various stats from XP events
  const [
    workoutCount,
    habitLogCount,
    diaryCount,
    transactionCount,
  ] = await Promise.all([
    db.xPEvent.count({ where: { characterId, module: 'training', action: 'workout_complete' } }),
    db.xPEvent.count({ where: { characterId, module: 'habits', action: 'habit_complete' } }),
    db.xPEvent.count({ where: { characterId, module: 'diary', action: 'entry_create' } }),
    db.xPEvent.count({ where: { characterId, module: 'finance', action: 'transaction_log' } }),
  ]);

  // Estimate streak days from habit logs
  const streakDays = await estimateStreakDays(characterId);

  const context = {
    totalXP: character.totalXP,
    level: character.level,
    attributeXP,
    totalWorkouts: workoutCount,
    totalHabitsCompleted: habitLogCount,
    totalDiaryEntries: diaryCount,
    totalTransactions: transactionCount,
    streakDays,
  };

  // Dynamic import to avoid circular dependency
  const { checkAchievements } = await import('@/lib/gamification/achievement-engine');
  const newlyUnlocked = checkAchievements(context);

  // Filter out already-unlocked achievements
  const alreadyUnlocked = new Set(character.achievements.map(a => a.achievementId));
  const toCreate = newlyUnlocked.filter(id => !alreadyUnlocked.has(id));

  if (toCreate.length > 0) {
    await db.userAchievement.createMany({
      data: toCreate.map(achievementId => ({
        characterId,
        achievementId,
      })),
      skipDuplicates: true,
    });
  }

  return toCreate;
}

/**
 * Estimate current streak days from habit completion data.
 * Counts consecutive days (from today backwards) where at least one habit was completed.
 */
async function estimateStreakDays(characterId: string): Promise<number> {
  const character = await db.character.findUnique({ where: { id: characterId } });
  if (!character) return 0;

  // Get distinct dates with habit_complete events, ordered desc
  const habitDates = await db.xPEvent.findMany({
    where: { characterId, module: 'habits', action: 'habit_complete' },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  if (habitDates.length === 0) return 0;

  // Group by date string
  const uniqueDates = [...new Set(
    habitDates.map(e => e.createdAt.toISOString().split('T')[0])
  )].sort().reverse();

  // Count consecutive days from today
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  const checkDate = new Date(today);

  for (const dateStr of uniqueDates) {
    const expected = checkDate.toISOString().split('T')[0];
    if (dateStr === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expected) {
      break;
    }
  }

  return streak;
}

// ==================== Quest Progress Update ====================

/**
 * Find active quests matching this module:action and increment their progress.
 * If a quest reaches its target, mark it as completed.
 */
async function updateQuestProgress(
  characterId: string,
  module: string,
  action: string,
): Promise<string[]> {
  const questAction = `${module}:${action}`;

  const activeQuests = await db.userQuest.findMany({
    where: {
      characterId,
      status: 'active',
      questId: { contains: questAction.split(':')[0] }, // rough filter
    },
  });

  // Filter to quests whose action matches
  const matchingQuests = activeQuests.filter(q => {
    // Quest IDs follow the pattern: "type_category_action_suffix"
    // The action is embedded in the questId
    return q.questId.includes(questAction) || q.questId.includes(action);
  });

  const progressed: string[] = [];

  for (const quest of matchingQuests) {
    const newProgress = quest.progress + 1;
    const isComplete = newProgress >= quest.target;

    await db.userQuest.update({
      where: { id: quest.id },
      data: {
        progress: newProgress,
        status: isComplete ? 'completed' : 'active',
        completedAt: isComplete ? new Date() : undefined,
      },
    });

    progressed.push(quest.id);
  }

  return progressed;
}
