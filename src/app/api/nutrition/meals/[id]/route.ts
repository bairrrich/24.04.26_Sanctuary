import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/nutrition/meals/[id] — Update a meal entry
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.mealEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['mealType', 'name', 'calories', 'protein', 'fat', 'carbs', 'note'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.name && typeof updateData.name === 'string') {
      updateData.name = (updateData.name as string).trim();
      if ((updateData.name as string).length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (updateData.mealType && !validMealTypes.includes(updateData.mealType as string)) {
      return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
    }

    const meal = await db.mealEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }
}

// DELETE /api/nutrition/meals/[id] — Delete a meal entry
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.mealEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    await db.mealEntry.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
