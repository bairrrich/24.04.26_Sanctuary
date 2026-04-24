import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// ==================== GET /api/health/wellbeing ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = {};

    if (date) {
      where.date = date;
    } else if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, unknown>).lte = dateTo;
    }

    const logs = await db.wellbeingLog.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        date: l.date,
        mood: l.mood,
        energy: l.energy,
        sleepHours: l.sleepHours,
        sleepQuality: l.sleepQuality,
        stress: l.stress,
        symptoms: l.symptoms,
        note: l.note,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting wellbeing logs:', error);
    return NextResponse.json({ error: 'Failed to get wellbeing logs' }, { status: 500 });
  }
}

// ==================== POST /api/health/wellbeing ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, mood, energy, sleepHours, sleepQuality, stress, symptoms, note } = body;

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const validMoods = ['great', 'good', 'neutral', 'bad', 'terrible'];
    if (mood && !validMoods.includes(mood)) {
      return NextResponse.json({ error: 'Invalid mood value' }, { status: 400 });
    }

    const log = await db.wellbeingLog.create({
      data: {
        date,
        mood: mood || null,
        energy: typeof energy === 'number' ? energy : null,
        sleepHours: typeof sleepHours === 'number' ? sleepHours : null,
        sleepQuality: typeof sleepQuality === 'number' ? sleepQuality : null,
        stress: typeof stress === 'number' ? stress : null,
        symptoms: symptoms ? JSON.stringify(symptoms) : null,
        note: note?.trim() || null,
      },
    });

    // XP emission
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      // Always emit mood_log XP
      const moodResult = await emitXP(character.id, 'health', 'mood_log');
      if (moodResult) {
        xpEvents.push({
          module: 'health',
          action: 'mood_log',
          amount: moodResult.amount,
          attribute: moodResult.attribute,
        });
      }

      // If mood is great or good, emit wellbeing_good XP too
      if (mood === 'great' || mood === 'good') {
        const wellbeingResult = await emitXP(character.id, 'health', 'wellbeing_good');
        if (wellbeingResult) {
          xpEvents.push({
            module: 'health',
            action: 'wellbeing_good',
            amount: wellbeingResult.amount,
            attribute: wellbeingResult.attribute,
          });
        }
      }
    }

    return NextResponse.json(
      {
        log: {
          id: log.id,
          date: log.date,
          mood: log.mood,
          energy: log.energy,
          sleepHours: log.sleepHours,
          sleepQuality: log.sleepQuality,
          stress: log.stress,
          symptoms: log.symptoms,
          note: log.note,
          createdAt: log.createdAt.toISOString(),
          updatedAt: log.updatedAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating wellbeing log:', error);
    return NextResponse.json({ error: 'Failed to create wellbeing log' }, { status: 500 });
  }
}
