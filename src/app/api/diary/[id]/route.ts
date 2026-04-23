import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ==================== PATCH /api/diary/[id] ====================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.diaryEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Diary entry not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['date', 'title', 'content', 'mood', 'tags'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'title') {
          updateData[field] = body[field]?.trim() || null;
        } else if (field === 'tags') {
          updateData[field] = Array.isArray(body[field]) ? JSON.stringify(body[field]) : null;
        } else if (field === 'mood') {
          if (body[field] && !['great', 'good', 'neutral', 'bad', 'terrible'].includes(body[field])) {
            return NextResponse.json({ error: 'Invalid mood value' }, { status: 400 });
          }
          updateData[field] = body[field] || null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Validate content if provided
    if (body.content !== undefined && (typeof body.content !== 'string' || body.content.trim().length === 0)) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // Validate date if provided
    if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    const entry = await db.diaryEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      entry: {
        id: entry.id,
        date: entry.date,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags ? JSON.parse(entry.tags) : [],
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating diary entry:', error);
    return NextResponse.json({ error: 'Failed to update diary entry' }, { status: 500 });
  }
}

// ==================== DELETE /api/diary/[id] ====================

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.diaryEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Diary entry not found' }, { status: 404 });
    }

    await db.diaryEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    return NextResponse.json({ error: 'Failed to delete diary entry' }, { status: 500 });
  }
}
