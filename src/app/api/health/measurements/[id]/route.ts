import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== PATCH /api/health/measurements/[id] ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.bodyMeasurement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Measurement not found' }, { status: 404 });
    }

    const measurement = await db.bodyMeasurement.update({
      where: { id },
      data: {
        ...(body.date !== undefined && { date: body.date }),
        ...(body.weight !== undefined && { weight: body.weight }),
        ...(body.height !== undefined && { height: body.height }),
        ...(body.waist !== undefined && { waist: body.waist }),
        ...(body.chest !== undefined && { chest: body.chest }),
        ...(body.hips !== undefined && { hips: body.hips }),
        ...(body.bicep !== undefined && { bicep: body.bicep }),
        ...(body.thigh !== undefined && { thigh: body.thigh }),
        ...(body.neck !== undefined && { neck: body.neck }),
        ...(body.bodyFat !== undefined && { bodyFat: body.bodyFat }),
        ...(body.note !== undefined && { note: body.note?.trim() || null }),
      },
    });

    return NextResponse.json({
      measurement: {
        id: measurement.id,
        date: measurement.date,
        weight: measurement.weight,
        height: measurement.height,
        waist: measurement.waist,
        chest: measurement.chest,
        hips: measurement.hips,
        bicep: measurement.bicep,
        thigh: measurement.thigh,
        neck: measurement.neck,
        bodyFat: measurement.bodyFat,
        note: measurement.note,
        createdAt: measurement.createdAt.toISOString(),
        updatedAt: measurement.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating measurement:', error);
    return NextResponse.json({ error: 'Failed to update measurement' }, { status: 500 });
  }
}

// ==================== DELETE /api/health/measurements/[id] ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.bodyMeasurement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Measurement not found' }, { status: 404 });
    }

    await db.bodyMeasurement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return NextResponse.json({ error: 'Failed to delete measurement' }, { status: 500 });
  }
}
