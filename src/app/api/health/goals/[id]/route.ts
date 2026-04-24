import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== PATCH /api/health/goals/[id] ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.healthGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goal = await db.healthGoal.update({
      where: { id },
      data: {
        ...(body.type !== undefined && { type: body.type }),
        ...(body.targetValue !== undefined && { targetValue: body.targetValue }),
        ...(body.currentValue !== undefined && { currentValue: body.currentValue }),
        ...(body.deadline !== undefined && { deadline: body.deadline || null }),
        ...(body.isCompleted !== undefined && { isCompleted: body.isCompleted }),
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating health goal:', error);
    return NextResponse.json({ error: 'Failed to update health goal' }, { status: 500 });
  }
}

// ==================== DELETE /api/health/goals/[id] ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.healthGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    await db.healthGoal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting health goal:', error);
    return NextResponse.json({ error: 'Failed to delete health goal' }, { status: 500 });
  }
}
