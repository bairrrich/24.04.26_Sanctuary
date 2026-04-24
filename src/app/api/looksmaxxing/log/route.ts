import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// GET /api/looksmaxxing/log — Get logs for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    const where: Record<string, unknown> = {};
    if (date) {
      where.date = date;
    } else if (from && to) {
      where.date = { gte: from, lte: to };
    }

    const logs = await db.routineLog.findMany({
      where,
      include: {
        routine: {
          select: {
            id: true,
            name: true,
            icon: true,
            category: true,
            frequency: true,
            steps: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        routineId: l.routineId,
        date: l.date,
        completedSteps: l.completedSteps,
        rating: l.rating,
        note: l.note,
        createdAt: l.createdAt.toISOString(),
        routine: l.routine,
      })),
    });
  } catch (error) {
    console.error('Error getting routine logs:', error);
    return NextResponse.json({ error: 'Failed to get routine logs' }, { status: 500 });
  }
}

// POST /api/looksmaxxing/log — Complete a routine (toggle)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { routineId, date, completedSteps, rating, note } = body;

    if (!routineId) {
      return NextResponse.json({ error: 'routineId is required' }, { status: 400 });
    }

    const routine = await db.routine.findUnique({ where: { id: routineId } });
    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }
    if (routine.isArchived) {
      return NextResponse.json({ error: 'Cannot log archived routine' }, { status: 400 });
    }

    const logDate = date || getTodayString();
    let isCompleted: boolean;
    let logEntry: { id: string; routineId: string; date: string; completedSteps: number | null; rating: number | null } | null = null;

    const existingLog = await db.routineLog.findUnique({
      where: {
        routineId_date: { routineId, date: logDate },
      },
    });

    if (existingLog) {
      // Toggle off: remove the log
      await db.routineLog.delete({ where: { id: existingLog.id } });
      isCompleted = false;
    } else {
      // Toggle on: create a log
      const created = await db.routineLog.create({
        data: {
          routineId,
          date: logDate,
          completedSteps: completedSteps ?? null,
          rating: rating ?? null,
          note: note ?? null,
        },
      });
      logEntry = {
        id: created.id,
        routineId: created.routineId,
        date: created.date,
        completedSteps: created.completedSteps,
        rating: created.rating,
      };
      isCompleted = true;
    }

    // XP emission — only on completion
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    if (isCompleted) {
      const character = await db.character.findFirst();
      if (character) {
        const result = await emitXP(character.id, 'looksmaxxing', 'routine_complete');
        if (result) {
          xpEvents.push({
            module: 'looksmaxxing',
            action: 'routine_complete',
            amount: result.amount,
            attribute: result.attribute,
          });
        }
      }
    }

    return NextResponse.json({
      log: logEntry,
      isCompleted,
      xpEvents,
    });
  } catch (error) {
    console.error('Error toggling routine log:', error);
    return NextResponse.json({ error: 'Failed to toggle routine log' }, { status: 500 });
  }
}
