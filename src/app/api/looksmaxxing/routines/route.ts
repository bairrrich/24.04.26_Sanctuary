import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/looksmaxxing/routines — List all non-archived routines
export async function GET() {
  try {
    const routines = await db.routine.findMany({
      where: { isArchived: false },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    return NextResponse.json({
      routines: routines.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        icon: r.icon,
        frequency: r.frequency,
        steps: r.steps,
        sortOrder: r.sortOrder,
        isArchived: r.isArchived,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        logs: r.logs.map((l) => ({
          id: l.id,
          date: l.date,
          completedSteps: l.completedSteps,
          rating: l.rating,
          note: l.note,
        })),
      })),
    });
  } catch (error) {
    console.error('Error listing routines:', error);
    return NextResponse.json({ error: 'Failed to list routines' }, { status: 500 });
  }
}

// POST /api/looksmaxxing/routines — Create a new routine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, icon, frequency, steps, sortOrder } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const maxSort = await db.routine.findFirst({
        where: { isArchived: false },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      finalSortOrder = (maxSort?.sortOrder ?? -1) + 1;
    }

    const routine = await db.routine.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'skincare',
        icon: icon || '✨',
        frequency: frequency || 'daily',
        steps: steps || null,
        sortOrder: finalSortOrder,
      },
    });

    return NextResponse.json(
      {
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
          logs: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 });
  }
}
