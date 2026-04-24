import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// ==================== Helper: Format workout response ====================

function formatWorkout(workout: {
  id: string;
  date: string;
  name: string;
  duration: number;
  type: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  exercises: Array<{
    id: string;
    workoutId: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    duration: number;
    isPR: boolean;
    note: string | null;
    sortOrder: number;
  }>;
}) {
  return {
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
  };
}

// ==================== GET /api/training/workouts ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // single date YYYY-MM-DD
    const from = searchParams.get('from'); // range start
    const to = searchParams.get('to'); // range end

    let where: Record<string, unknown> = {};

    if (date) {
      where = { date };
    } else if (from && to) {
      where = { date: { gte: from, lte: to } };
    }

    const workouts = await db.workout.findMany({
      where,
      include: { exercises: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      workouts: workouts.map(formatWorkout),
    });
  } catch (error) {
    console.error('Error listing workouts:', error);
    return NextResponse.json({ error: 'Failed to list workouts' }, { status: 500 });
  }
}

// ==================== POST /api/training/workouts ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, name, duration, type, note, exercises } = body as {
      date?: string;
      name?: string;
      duration?: number;
      type?: string;
      note?: string;
      exercises?: Array<{
        name: string;
        sets?: number;
        reps?: number;
        weight?: number;
        duration?: number;
        isPR?: boolean;
        note?: string;
      }>;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Workout name is required' }, { status: 400 });
    }

    const workoutDate = date || new Date().toISOString().split('T')[0];

    // Create workout with exercises in a transaction
    const workout = await db.workout.create({
      data: {
        date: workoutDate,
        name: name.trim(),
        duration: duration || 0,
        type: type || 'strength',
        note: note?.trim() || null,
        exercises: {
          create: (exercises || []).map((ex, i) => ({
            name: ex.name.trim(),
            sets: ex.sets || 0,
            reps: ex.reps || 0,
            weight: ex.weight || 0,
            duration: ex.duration || 0,
            isPR: ex.isPR || false,
            note: ex.note?.trim() || null,
            sortOrder: i,
          })),
        },
      },
      include: { exercises: { orderBy: { sortOrder: 'asc' } } },
    });

    // XP emissions
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      // Emit workout_complete
      const workoutXP = await emitXP(character.id, 'training', 'workout_complete');
      if (workoutXP) {
        xpEvents.push({
          module: 'training',
          action: 'workout_complete',
          amount: workoutXP.amount,
          attribute: workoutXP.attribute,
        });
      }

      // Emit exercise_pr for each PR exercise
      const prExercises = workout.exercises.filter((e) => e.isPR);
      for (const _ex of prExercises) {
        const prXP = await emitXP(character.id, 'training', 'exercise_pr');
        if (prXP) {
          xpEvents.push({
            module: 'training',
            action: 'exercise_pr',
            amount: prXP.amount,
            attribute: prXP.attribute,
          });
        }
      }
    }

    return NextResponse.json(
      {
        workout: formatWorkout(workout),
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}
