import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (date) where.date = date;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, unknown>).lte = dateTo;
    }
    if (type) where.type = type;

    const shifts = await db.shift.findMany({
      where,
      orderBy: [{ date: 'desc' }, { timeStart: 'asc' }],
      take: 100,
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const shift = await db.shift.create({ data: body });

    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}
