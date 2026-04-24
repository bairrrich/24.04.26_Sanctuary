import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== GET /api/health/goals ====================

export async function GET() {
  try {
    const goals = await db.healthGoal.findMany({
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      goals: goals.map((g) => ({
        id: g.id,
        type: g.type,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        deadline: g.deadline,
        isCompleted: g.isCompleted,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting health goals:', error);
    return NextResponse.json({ error: 'Failed to get health goals' }, { status: 500 });
  }
}

// ==================== POST /api/health/goals ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, targetValue, currentValue, deadline } = body;

    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }
    if (typeof targetValue !== 'number' || targetValue <= 0) {
      return NextResponse.json({ error: 'Target value must be a positive number' }, { status: 400 });
    }

    const goal = await db.healthGoal.create({
      data: {
        type,
        targetValue,
        currentValue: typeof currentValue === 'number' ? currentValue : null,
        deadline: deadline || null,
      },
    });

    return NextResponse.json(
      {
        goal: {
          id: goal.id,
          type: goal.type,
          targetValue: goal.targetValue,
          currentValue: goal.currentValue,
          deadline: goal.deadline,
          isCompleted: goal.isCompleted,
          createdAt: goal.createdAt.toISOString(),
          updatedAt: goal.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating health goal:', error);
    return NextResponse.json({ error: 'Failed to create health goal' }, { status: 500 });
  }
}
