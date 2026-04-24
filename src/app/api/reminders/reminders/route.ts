import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    const where: Record<string, unknown> = {};
    if (date) where.date = date;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (where.date as Record<string, unknown>).lte = dateTo;
    }
    if (!includeCompleted) where.isCompleted = false;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const reminders = await db.reminder.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 100,
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reminder = await db.reminder.create({ data: body });
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}
