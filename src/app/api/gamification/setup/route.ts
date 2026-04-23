import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/gamification/setup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, ...setupData } = body;

    if (!characterId) {
      return NextResponse.json({ error: 'characterId is required' }, { status: 400 });
    }

    // Upsert setup data
    const existing = await db.characterSetupData.findUnique({
      where: { characterId },
    });

    if (existing) {
      await db.characterSetupData.update({
        where: { characterId },
        data: {
          height: setupData.height ?? existing.height,
          weight: setupData.weight ?? existing.weight,
          age: setupData.age ?? existing.age,
          gender: setupData.gender ?? existing.gender,
          initialAccounts: setupData.initialAccounts ? JSON.stringify(setupData.initialAccounts) : existing.initialAccounts,
          dailyCalories: setupData.dailyCalories ?? existing.dailyCalories,
          dailyProtein: setupData.dailyProtein ?? existing.dailyProtein,
          dailyFat: setupData.dailyFat ?? existing.dailyFat,
          dailyCarbs: setupData.dailyCarbs ?? existing.dailyCarbs,
          dailyWater: setupData.dailyWater ?? existing.dailyWater,
          fitnessLevel: setupData.fitnessLevel ?? existing.fitnessLevel,
          targetSleepHours: setupData.targetSleepHours ?? existing.targetSleepHours,
          targetWakeTime: setupData.targetWakeTime ?? existing.targetWakeTime,
          focusAreas: setupData.focusAreas ? JSON.stringify(setupData.focusAreas) : existing.focusAreas,
        },
      });
    } else {
      await db.characterSetupData.create({
        data: {
          characterId,
          height: setupData.height,
          weight: setupData.weight,
          age: setupData.age,
          gender: setupData.gender,
          initialAccounts: setupData.initialAccounts ? JSON.stringify(setupData.initialAccounts) : null,
          dailyCalories: setupData.dailyCalories,
          dailyProtein: setupData.dailyProtein,
          dailyFat: setupData.dailyFat,
          dailyCarbs: setupData.dailyCarbs,
          dailyWater: setupData.dailyWater,
          fitnessLevel: setupData.fitnessLevel,
          targetSleepHours: setupData.targetSleepHours,
          targetWakeTime: setupData.targetWakeTime,
          focusAreas: setupData.focusAreas ? JSON.stringify(setupData.focusAreas) : null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving setup:', error);
    return NextResponse.json({ error: 'Failed to save setup' }, { status: 500 });
  }
}
