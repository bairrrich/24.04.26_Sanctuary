import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/training/workouts/[id] — Update a workout
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.workout.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['date', 'name', 'duration', 'type', 'note'];

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

    // If exercises array is provided, replace them
    if (body.exercises && Array.isArray(body.exercises)) {
      // Delete existing exercises and create new ones
      await db.exercise.deleteMany({ where: { workoutId: id } });

      updateData.exercises = {
        create: body.exercises.map((ex: { name: string; sets?: number; reps?: number; weight?: number; duration?: number; isPR?: boolean; note?: string }, i: number) => ({
          name: ex.name.trim(),
          sets: ex.sets || 0,
          reps: ex.reps || 0,
          weight: ex.weight || 0,
          duration: ex.duration || 0,
          isPR: ex.isPR || false,
          note: ex.note?.trim() || null,
          sortOrder: i,
        })),
      };
    }

    const workout = await db.workout.update({
      where: { id },
      data: updateData,
      include: { exercises: { orderBy: { sortOrder: 'asc' } } },
    });

    return NextResponse.json({
      workout: {
        id: workout.id,
        date: workout.date,
        name: workout.name,
        duration: workout.duration,
        type: workout.type,
        note: workout.note,
        createdAt: workout.createdAt.toISOString(),
        updatedAt: workout.updatedAt.toISOString(),
        exercises: workout.exercises.map((e) => ({
          id: e.id,
          workoutId: e.workoutId,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          duration: e.duration,
          isPR: e.isPR,
          note: e.note,
          sortOrder: e.sortOrder,
        })),
      },
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

// DELETE /api/training/workouts/[id] — Delete a workout
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.workout.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Cascade delete will remove associated exercises
    await db.workout.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
