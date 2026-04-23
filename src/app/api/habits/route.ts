import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTodayString, calculateStreak } from '@/lib/habit-utils';

// GET /api/habits — List all non-archived habits with today's log and current streak
export async function GET() {
  try {
    const today = getTodayString();

    const habits = await db.habit.findMany({
      where: { isArchived: false },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        logs: {
          where: { date: today },
          select: { id: true, count: true, date: true },
        },
      },
    });

    // For each habit, calculate current streak by fetching all logs
    const habitsWithStreak = await Promise.all(
      habits.map(async (habit) => {
        const allLogs = await db.habitLog.findMany({
          where: { habitId: habit.id },
          select: { date: true },
          orderBy: { date: 'desc' },
        });

        const todayLog = habit.logs.length > 0 ? { count: habit.logs[0].count } : null;
        const currentStreak = calculateStreak(allLogs);

        return {
          id: habit.id,
          name: habit.name,
          description: habit.description,
          icon: habit.icon,
          color: habit.color,
          type: habit.type,
          frequency: habit.frequency,
          targetCount: habit.targetCount,
          sortOrder: habit.sortOrder,
          isArchived: habit.isArchived,
          todayLog,
          currentStreak,
          createdAt: habit.createdAt.toISOString(),
          updatedAt: habit.updatedAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ habits: habitsWithStreak });
  } catch (error) {
    console.error('Error listing habits:', error);
    return NextResponse.json({ error: 'Failed to list habits' }, { status: 500 });
  }
}

// POST /api/habits — Create a new habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, color, type, frequency, targetCount, sortOrder } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Determine the next sort order if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const maxSort = await db.habit.findFirst({
        where: { isArchived: false },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      finalSortOrder = (maxSort?.sortOrder ?? -1) + 1;
    }

    const habit = await db.habit.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || '🎯',
        color: color || '#06b6d4',
        type: type || 'positive',
        frequency: frequency || 'daily',
        targetCount: targetCount || 1,
        sortOrder: finalSortOrder,
      },
    });

    return NextResponse.json(
      {
        habit: {
          id: habit.id,
          name: habit.name,
          description: habit.description,
          icon: habit.icon,
          color: habit.color,
          type: habit.type,
          frequency: habit.frequency,
          targetCount: habit.targetCount,
          sortOrder: habit.sortOrder,
          isArchived: habit.isArchived,
          todayLog: null,
          currentStreak: 0,
          createdAt: habit.createdAt.toISOString(),
          updatedAt: habit.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
