import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/looksmaxxing/routines/[id] — Update a routine
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.routine.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'category', 'icon', 'frequency', 'steps', 'sortOrder'];

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

    const routine = await db.routine.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      routine: {
        id: routine.id,
        name: routine.name,
        description: routine.description,
        category: routine.category,
        icon: routine.icon,
        frequency: routine.frequency,
        steps: routine.steps,
        sortOrder: routine.sortOrder,
        isArchived: routine.isArchived,
        createdAt: routine.createdAt.toISOString(),
        updatedAt: routine.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 });
  }
}

// DELETE /api/looksmaxxing/routines/[id] — Soft-delete (archive) a routine
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.routine.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const routine = await db.routine.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({
      routine: {
        id: routine.id,
        name: routine.name,
        isArchived: routine.isArchived,
      },
    });
  } catch (error) {
    console.error('Error archiving routine:', error);
    return NextResponse.json({ error: 'Failed to archive routine' }, { status: 500 });
  }
}
