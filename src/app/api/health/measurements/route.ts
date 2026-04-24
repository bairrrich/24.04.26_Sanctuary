import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// ==================== GET /api/health/measurements ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = {};

    if (date) {
      where.date = date;
    } else if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, unknown>).lte = dateTo;
    }

    const measurements = await db.bodyMeasurement.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return NextResponse.json({
      measurements: measurements.map((m) => ({
        id: m.id,
        date: m.date,
        weight: m.weight,
        height: m.height,
        waist: m.waist,
        chest: m.chest,
        hips: m.hips,
        bicep: m.bicep,
        thigh: m.thigh,
        neck: m.neck,
        bodyFat: m.bodyFat,
        note: m.note,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting measurements:', error);
    return NextResponse.json({ error: 'Failed to get measurements' }, { status: 500 });
  }
}

// ==================== POST /api/health/measurements ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, weight, height, waist, chest, hips, bicep, thigh, neck, bodyFat, note } = body;

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const measurement = await db.bodyMeasurement.create({
      data: {
        date,
        weight: typeof weight === 'number' ? weight : null,
        height: typeof height === 'number' ? height : null,
        waist: typeof waist === 'number' ? waist : null,
        chest: typeof chest === 'number' ? chest : null,
        hips: typeof hips === 'number' ? hips : null,
        bicep: typeof bicep === 'number' ? bicep : null,
        thigh: typeof thigh === 'number' ? thigh : null,
        neck: typeof neck === 'number' ? neck : null,
        bodyFat: typeof bodyFat === 'number' ? bodyFat : null,
        note: note?.trim() || null,
      },
    });

    // XP emission
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      const result = await emitXP(character.id, 'health', 'body_measurements');
      if (result) {
        xpEvents.push({
          module: 'health',
          action: 'body_measurements',
          amount: result.amount,
          attribute: result.attribute,
        });
      }
    }

    return NextResponse.json(
      {
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
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating measurement:', error);
    return NextResponse.json({ error: 'Failed to create measurement' }, { status: 500 });
  }
}
