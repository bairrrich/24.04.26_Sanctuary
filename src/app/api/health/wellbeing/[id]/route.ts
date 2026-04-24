import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== PATCH /api/health/wellbeing/[id] ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.wellbeingLog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Wellbeing log not found' }, { status: 404 });
    }

    const log = await db.wellbeingLog.update({
      where: { id },
      data: {
        ...(body.date !== undefined && { date: body.date }),
        ...(body.mood !== undefined && { mood: body.mood }),
        ...(body.energy !== undefined && { energy: body.energy }),
        ...(body.sleepHours !== undefined && { sleepHours: body.sleepHours }),
        ...(body.sleepQuality !== undefined && { sleepQuality: body.sleepQuality }),
        ...(body.stress !== undefined && { stress: body.stress }),
        ...(body.symptoms !== undefined && { symptoms: body.symptoms ? JSON.stringify(body.symptoms) : null }),
        ...(body.note !== undefined && { note: body.note?.trim() || null }),
      },
    });

    return NextResponse.json({
      log: {
        id: log.id,
        date: log.date,
        mood: log.mood,
        energy: log.energy,
        sleepHours: log.sleepHours,
        sleepQuality: log.sleepQuality,
        stress: log.stress,
        symptoms: log.symptoms,
        note: log.note,
        createdAt: log.createdAt.toISOString(),
        updatedAt: log.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating wellbeing log:', error);
    return NextResponse.json({ error: 'Failed to update wellbeing log' }, { status: 500 });
  }
}

// ==================== DELETE /api/health/wellbeing/[id] ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.wellbeingLog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Wellbeing log not found' }, { status: 404 });
    }

    await db.wellbeingLog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wellbeing log:', error);
    return NextResponse.json({ error: 'Failed to delete wellbeing log' }, { status: 500 });
  }
}
