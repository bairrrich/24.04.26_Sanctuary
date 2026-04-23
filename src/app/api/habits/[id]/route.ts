import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/habits/[id] — Update a habit
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.habit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'icon', 'color', 'type', 'frequency', 'targetCount', 'sortOrder'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Trim name if provided
    if (updateData.name && typeof updateData.name === 'string') {
      updateData.name = (updateData.name as string).trim();
      if ((updateData.name as string).length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
    }

    const habit = await db.habit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
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
        createdAt: habit.createdAt.toISOString(),
        updatedAt: habit.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

// DELETE /api/habits/[id] — Soft-delete (archive) a habit
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.habit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const habit = await db.habit.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({
      habit: {
        id: habit.id,
        name: habit.name,
        isArchived: habit.isArchived,
      },
    });
  } catch (error) {
    console.error('Error archiving habit:', error);
    return NextResponse.json({ error: 'Failed to archive habit' }, { status: 500 });
  }
}
