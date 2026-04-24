import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// ==================== Helpers ====================

const VALID_TYPES = ['personal', 'work', 'health', 'social', 'finance', 'training', 'other'];

// ==================== PATCH /api/calendar/events/[id] ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.calendarEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.date !== undefined) updates.date = body.date;
    if (body.timeStart !== undefined) updates.timeStart = body.timeStart || null;
    if (body.timeEnd !== undefined) updates.timeEnd = body.timeEnd || null;
    if (body.type !== undefined && VALID_TYPES.includes(body.type)) updates.type = body.type;
    if (body.location !== undefined) updates.location = body.location?.trim() || null;
    if (body.isRecurring !== undefined) updates.isRecurring = Boolean(body.isRecurring);
    if (body.recurRule !== undefined) updates.recurRule = body.recurRule ? JSON.stringify(body.recurRule) : null;
    if (body.isCompleted !== undefined) updates.isCompleted = Boolean(body.isCompleted);
    if (body.color !== undefined) updates.color = body.color || null;
    if (body.reminderAt !== undefined) updates.reminderAt = body.reminderAt ? new Date(body.reminderAt) : null;

    const event = await db.calendarEvent.update({
      where: { id },
      data: updates,
    });

    // XP emission: event_attend → charisma (when marking as completed/attended)
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    if (body.isCompleted === true && !existing.isCompleted) {
      const character = await db.character.findFirst();
      if (character) {
        const result = await emitXP(character.id, 'calendar', 'event_attend');
        if (result) {
          xpEvents.push({
            module: 'calendar',
            action: 'event_attend',
            amount: result.amount,
            attribute: result.attribute,
          });
        }
      }
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// ==================== DELETE /api/calendar/events/[id] ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.calendarEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await db.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
