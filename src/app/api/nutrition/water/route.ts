import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// Default water goal in ml
const DEFAULT_WATER_GOAL = 2000;

// ==================== GET /api/nutrition/water ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'date query param is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const waterEntries = await db.waterLog.findMany({
      where: { date },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = waterEntries.reduce((sum, entry) => sum + entry.amount, 0);

    // Get water goal from setup
    const setupData = await db.characterSetupData.findFirst();
    const goal = setupData?.dailyWater ?? DEFAULT_WATER_GOAL;

    return NextResponse.json({
      entries: waterEntries.map((e) => ({
        id: e.id,
        date: e.date,
        amount: e.amount,
        createdAt: e.createdAt.toISOString(),
      })),
      totalAmount,
      goal,
    });
  } catch (error) {
    console.error('Error getting water:', error);
    return NextResponse.json({ error: 'Failed to get water entries' }, { status: 500 });
  }
}

// ==================== POST /api/nutrition/water ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, amount } = body;

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const waterAmount = typeof amount === 'number' && amount > 0 ? amount : 250;

    const waterEntry = await db.waterLog.create({
      data: {
        date,
        amount: waterAmount,
      },
    });

    // XP emissions
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      // 1. Emit water_glass XP
      const glassResult = await emitXP(character.id, 'nutrition', 'water_glass');
      if (glassResult) {
        xpEvents.push({
          module: 'nutrition',
          action: 'water_glass',
          amount: glassResult.amount,
          attribute: glassResult.attribute,
        });
      }

      // 2. Check if water goal met
      const allWaterToday = await db.waterLog.findMany({
        where: { date },
        select: { amount: true },
      });
      const totalWater = allWaterToday.reduce((sum, e) => sum + e.amount, 0);

      const setupData = await db.characterSetupData.findFirst();
      const waterGoal = setupData?.dailyWater ?? DEFAULT_WATER_GOAL;

      if (totalWater >= waterGoal) {
        // Check if we haven't already emitted water_goal today
        const existingWaterXP = await db.xPEvent.findFirst({
          where: {
            characterId: character.id,
            module: 'nutrition',
            action: 'water_goal',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        if (!existingWaterXP) {
          const goalResult = await emitXP(character.id, 'nutrition', 'water_goal');
          if (goalResult) {
            xpEvents.push({
              module: 'nutrition',
              action: 'water_goal',
              amount: goalResult.amount,
              attribute: goalResult.attribute,
            });
          }
        }
      }
    }

    // Get updated total
    const allWaterToday = await db.waterLog.findMany({
      where: { date },
      select: { amount: true },
    });
    const totalAmount = allWaterToday.reduce((sum, e) => sum + e.amount, 0);

    const setupData = await db.characterSetupData.findFirst();
    const goal = setupData?.dailyWater ?? DEFAULT_WATER_GOAL;

    return NextResponse.json(
      {
        entry: {
          id: waterEntry.id,
          date: waterEntry.date,
          amount: waterEntry.amount,
          createdAt: waterEntry.createdAt.toISOString(),
        },
        totalAmount,
        goal,
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding water:', error);
    return NextResponse.json({ error: 'Failed to add water entry' }, { status: 500 });
  }
}
