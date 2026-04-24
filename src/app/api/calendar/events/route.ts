import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// ==================== Helpers ====================

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

const VALID_TYPES = ['personal', 'work', 'health', 'social', 'finance', 'training', 'other'];

// ==================== GET /api/calendar/events ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: Record<string, unknown> = {};

    if (date && isValidDate(date)) {
      where.date = date;
    } else if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom && isValidDate(dateFrom)) (where.date as Record<string, unknown>).gte = dateFrom;
      if (dateTo && isValidDate(dateTo)) (where.date as Record<string, unknown>).lte = dateTo;
    }

    if (type && VALID_TYPES.includes(type)) {
      where.type = type;
    }

    const events = await db.calendarEvent.findMany({
      where,
      orderBy: [{ date: 'asc' }, { timeStart: 'asc' }],
      take: limit,
    });

    return NextResponse.json({
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        timeStart: e.timeStart,
        timeEnd: e.timeEnd,
        type: e.type,
        location: e.location,
        isRecurring: e.isRecurring,
        recurRule: e.recurRule ? JSON.parse(e.recurRule) : null,
        isCompleted: e.isCompleted,
        color: e.color,
        reminderAt: e.reminderAt?.toISOString() ?? null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error listing calendar events:', error);
    return NextResponse.json({ error: 'Failed to list events' }, { status: 500 });
  }
}

// ==================== POST /api/calendar/events ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, timeStart, timeEnd, type, location, isRecurring, recurRule, color, reminderAt } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!date || !isValidDate(date)) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const eventType = type && VALID_TYPES.includes(type) ? type : 'personal';

    const event = await db.calendarEvent.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date,
        timeStart: timeStart || null,
        timeEnd: timeEnd || null,
        type: eventType,
        location: location?.trim() || null,
        isRecurring: Boolean(isRecurring),
        recurRule: recurRule ? JSON.stringify(recurRule) : null,
        color: color || null,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
      },
    });

    // XP emission: event_create → intelligence
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      const result = await emitXP(character.id, 'calendar', 'event_create');
      if (result) {
        xpEvents.push({
          module: 'calendar',
          action: 'event_create',
          amount: result.amount,
          attribute: result.attribute,
        });
      }
    }

    return NextResponse.json(
      {
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          timeStart: event.timeStart,
          timeEnd: event.timeEnd,
          type: event.type,
          location: event.location,
          isRecurring: event.isRecurring,
          recurRule: event.recurRule ? JSON.parse(event.recurRule) : null,
          isCompleted: event.isCompleted,
          color: event.color,
          reminderAt: event.reminderAt?.toISOString() ?? null,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
