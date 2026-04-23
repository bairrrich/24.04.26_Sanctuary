import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTodayString, calculateStreak, getStreakMilestone, getStreakAction } from '@/lib/habit-utils';
import { calculateXP } from '@/lib/xp-engine';
import { assignClass } from '@/lib/class-system';
import { attributeLevelFromXP, characterLevelFromXP } from '@/lib/xp-engine';
import type { RPGAttribute } from '@/types';

// ==================== Helper: Internal emit XP ====================

/**
 * Directly emit XP from server-side without making an HTTP request.
 * This mirrors the logic in /api/gamification/emit-xp but runs inline.
 */
async function emitXPInternal(characterId: string, module: string, action: string) {
  const xpResult = calculateXP(module, action);
  if (!xpResult) return null;

  // Create XP event
  await db.xPEvent.create({
    data: {
      characterId,
      module,
      action,
      attribute: xpResult.attribute,
      amount: xpResult.amount,
    },
  });

  // Update attribute XP
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

  // Update character total XP and level
  const character = await db.character.findUnique({
    where: { id: characterId },
    include: { attributes: true },
  });

  if (!character) return null;

  const newTotalXP = character.totalXP + xpResult.amount;
  const newLevel = characterLevelFromXP(newTotalXP);

  // Recalculate class assignment
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

  return {
    attribute: xpResult.attribute,
    amount: xpResult.amount,
    newTotalXP,
    newLevel,
    newAttrXP,
    newAttrLevel,
  };
}

// ==================== POST /api/habits/log — Toggle habit completion ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitId } = body;

    if (!habitId) {
      return NextResponse.json({ error: 'habitId is required' }, { status: 400 });
    }

    // Fetch the habit
    const habit = await db.habit.findUnique({ where: { id: habitId } });
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    if (habit.isArchived) {
      return NextResponse.json({ error: 'Cannot log archived habit' }, { status: 400 });
    }

    const today = getTodayString();
    let isCompleted: boolean;
    let logEntry: { id: string; habitId: string; date: string; count: number } | null = null;

    // Check if there's already a log for today
    const existingLog = await db.habitLog.findUnique({
      where: {
        habitId_date: { habitId, date: today },
      },
    });

    if (existingLog) {
      // Toggle off: remove the log
      await db.habitLog.delete({ where: { id: existingLog.id } });
      isCompleted = false;
    } else {
      // Toggle on: create a log
      const created = await db.habitLog.create({
        data: {
          habitId,
          date: today,
          count: 1,
        },
      });
      logEntry = {
        id: created.id,
        habitId: created.habitId,
        date: created.date,
        count: created.count,
      };
      isCompleted = true;
    }

    // Calculate current streak after the toggle
    const allLogs = await db.habitLog.findMany({
      where: { habitId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });
    const currentStreak = calculateStreak(allLogs);

    // XP emissions (only when completing, not when un-completing)
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    if (isCompleted) {
      // Get the character for XP emissions
      const character = await db.character.findFirst();
      if (character) {
        // 1. Emit habit_complete for positive habits
        if (habit.type === 'positive') {
          const result = await emitXPInternal(character.id, 'habits', 'habit_complete');
          if (result) {
            xpEvents.push({
              module: 'habits',
              action: 'habit_complete',
              amount: result.amount,
              attribute: result.attribute,
            });
          }
        }

        // 2. Emit habit_negative_break for negative habits
        if (habit.type === 'negative') {
          const result = await emitXPInternal(character.id, 'habits', 'habit_negative_break');
          if (result) {
            xpEvents.push({
              module: 'habits',
              action: 'habit_negative_break',
              amount: result.amount,
              attribute: result.attribute,
            });
          }
        }

        // 3. Check for streak milestones
        const milestone = getStreakMilestone(currentStreak);
        if (milestone) {
          const streakAction = getStreakAction(milestone);
          const result = await emitXPInternal(character.id, 'habits', streakAction);
          if (result) {
            xpEvents.push({
              module: 'habits',
              action: streakAction,
              amount: result.amount,
              attribute: result.attribute,
            });
          }
        }

        // 4. Check if ALL positive habits for today are completed
        if (habit.type === 'positive') {
          const allPositiveHabits = await db.habit.findMany({
            where: { isArchived: false, type: 'positive' },
            select: { id: true },
          });

          const todayLogs = await db.habitLog.findMany({
            where: {
              date: today,
              habitId: { in: allPositiveHabits.map((h) => h.id) },
            },
            select: { habitId: true },
          });

          const loggedHabitIds = new Set(todayLogs.map((l) => l.habitId));
          const allCompleted = allPositiveHabits.every((h) => loggedHabitIds.has(h.id));

          if (allCompleted && allPositiveHabits.length > 0) {
            const result = await emitXPInternal(character.id, 'habits', 'all_daily_complete');
            if (result) {
              xpEvents.push({
                module: 'habits',
                action: 'all_daily_complete',
                amount: result.amount,
                attribute: result.attribute,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      log: logEntry,
      isCompleted,
      currentStreak,
      xpEvents,
    });
  } catch (error) {
    console.error('Error toggling habit log:', error);
    return NextResponse.json({ error: 'Failed to toggle habit log' }, { status: 500 });
  }
}

// ==================== GET /api/habits/log — Get logs for a date range ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to query params are required (YYYY-MM-DD)' }, { status: 400 });
    }

    const logs = await db.habitLog.findMany({
      where: {
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        habit: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        habitId: log.habitId,
        date: log.date,
        count: log.count,
        note: log.note,
        createdAt: log.createdAt.toISOString(),
        habit: log.habit,
      })),
    });
  } catch (error) {
    console.error('Error getting habit logs:', error);
    return NextResponse.json({ error: 'Failed to get habit logs' }, { status: 500 });
  }
}
