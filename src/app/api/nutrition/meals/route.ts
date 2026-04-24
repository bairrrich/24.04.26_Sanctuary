import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// ==================== Default nutrition targets ====================

const DEFAULT_CALORIE_TARGET = 2000;
const DEFAULT_PROTEIN_TARGET = 150;
const DEFAULT_FAT_TARGET = 65;
const DEFAULT_CARBS_TARGET = 250;

// ==================== GET /api/nutrition/meals ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'date query param is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const meals = await db.mealEntry.findMany({
      where: { date },
      orderBy: [{ mealType: 'asc' }, { createdAt: 'desc' }],
    });

    // Group by mealType
    const grouped: Record<string, typeof meals> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const meal of meals) {
      if (!grouped[meal.mealType]) {
        grouped[meal.mealType] = [];
      }
      grouped[meal.mealType].push(meal);
    }

    // Calculate daily summary
    const summary = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        fat: acc.fat + meal.fat,
        carbs: acc.carbs + meal.carbs,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    // Get targets from character setup
    const setupData = await db.characterSetupData.findFirst();
    const targets = {
      calories: setupData?.dailyCalories ?? DEFAULT_CALORIE_TARGET,
      protein: setupData?.dailyProtein ?? DEFAULT_PROTEIN_TARGET,
      fat: setupData?.dailyFat ?? DEFAULT_FAT_TARGET,
      carbs: setupData?.dailyCarbs ?? DEFAULT_CARBS_TARGET,
    };

    return NextResponse.json({
      meals: meals.map((m) => ({
        id: m.id,
        date: m.date,
        mealType: m.mealType,
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        fat: m.fat,
        carbs: m.carbs,
        note: m.note,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      grouped: Object.fromEntries(
        Object.entries(grouped).map(([key, entries]) => [
          key,
          entries.map((m) => ({
            id: m.id,
            date: m.date,
            mealType: m.mealType,
            name: m.name,
            calories: m.calories,
            protein: m.protein,
            fat: m.fat,
            carbs: m.carbs,
            note: m.note,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt.toISOString(),
          })),
        ])
      ),
      summary,
      targets,
    });
  } catch (error) {
    console.error('Error getting meals:', error);
    return NextResponse.json({ error: 'Failed to get meals' }, { status: 500 });
  }
}

// ==================== POST /api/nutrition/meals ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, mealType, name, calories, protein, fat, carbs, note } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }
    if (!mealType || typeof mealType !== 'string') {
      return NextResponse.json({ error: 'Meal type is required' }, { status: 400 });
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      return NextResponse.json({ error: 'Invalid meal type. Must be: breakfast, lunch, dinner, snack' }, { status: 400 });
    }

    const meal = await db.mealEntry.create({
      data: {
        date,
        mealType,
        name: name.trim(),
        calories: typeof calories === 'number' ? calories : 0,
        protein: typeof protein === 'number' ? protein : 0,
        fat: typeof fat === 'number' ? fat : 0,
        carbs: typeof carbs === 'number' ? carbs : 0,
        note: note?.trim() || null,
      },
    });

    // XP emissions
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      // 1. Emit meal_log XP
      const mealLogResult = await emitXP(character.id, 'nutrition', 'meal_log');
      if (mealLogResult) {
        xpEvents.push({
          module: 'nutrition',
          action: 'meal_log',
          amount: mealLogResult.amount,
          attribute: mealLogResult.attribute,
        });
      }

      // 2. Check if daily calories target met
      const allMealsToday = await db.mealEntry.findMany({
        where: { date },
        select: { calories: true },
      });
      const totalCalories = allMealsToday.reduce((sum, m) => sum + m.calories, 0);

      const setupData = await db.characterSetupData.findFirst();
      const calorieTarget = setupData?.dailyCalories ?? DEFAULT_CALORIE_TARGET;

      if (totalCalories >= calorieTarget) {
        // Check if we haven't already emitted daily_calories_target today
        const existingCalXP = await db.xPEvent.findFirst({
          where: {
            characterId: character.id,
            module: 'nutrition',
            action: 'daily_calories_target',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        if (!existingCalXP) {
          const calResult = await emitXP(character.id, 'nutrition', 'daily_calories_target');
          if (calResult) {
            xpEvents.push({
              module: 'nutrition',
              action: 'daily_calories_target',
              amount: calResult.amount,
              attribute: calResult.attribute,
            });
          }
        }
      }

      // 3. Check if daily macros target met
      const allMealsTodayWithMacros = await db.mealEntry.findMany({
        where: { date },
        select: { protein: true, fat: true, carbs: true },
      });
      const totalProtein = allMealsTodayWithMacros.reduce((sum, m) => sum + m.protein, 0);
      const totalFat = allMealsTodayWithMacros.reduce((sum, m) => sum + m.fat, 0);
      const totalCarbs = allMealsTodayWithMacros.reduce((sum, m) => sum + m.carbs, 0);

      const proteinTarget = setupData?.dailyProtein ?? DEFAULT_PROTEIN_TARGET;
      const fatTarget = setupData?.dailyFat ?? DEFAULT_FAT_TARGET;
      const carbsTarget = setupData?.dailyCarbs ?? DEFAULT_CARBS_TARGET;

      if (totalProtein >= proteinTarget && totalFat >= fatTarget && totalCarbs >= carbsTarget) {
        // Check if we haven't already emitted daily_macros_target today
        const existingMacroXP = await db.xPEvent.findFirst({
          where: {
            characterId: character.id,
            module: 'nutrition',
            action: 'daily_macros_target',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        if (!existingMacroXP) {
          const macroResult = await emitXP(character.id, 'nutrition', 'daily_macros_target');
          if (macroResult) {
            xpEvents.push({
              module: 'nutrition',
              action: 'daily_macros_target',
              amount: macroResult.amount,
              attribute: macroResult.attribute,
            });
          }
        }
      }
    }

    return NextResponse.json(
      {
        meal: {
          id: meal.id,
          date: meal.date,
          mealType: meal.mealType,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          fat: meal.fat,
          carbs: meal.carbs,
          note: meal.note,
          createdAt: meal.createdAt.toISOString(),
          updatedAt: meal.updatedAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }
}
