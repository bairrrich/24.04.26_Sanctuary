import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

// GET /api/looksmaxxing/photos — List all progress photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (from && to) where.date = { gte: from, lte: to };

    const photos = await db.progressPhoto.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      photos: photos.map((p) => ({
        id: p.id,
        date: p.date,
        category: p.category,
        note: p.note,
        photoData: p.photoData,
        rating: p.rating,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error listing progress photos:', error);
    return NextResponse.json({ error: 'Failed to list photos' }, { status: 500 });
  }
}

// POST /api/looksmaxxing/photos — Create a progress photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, category, note, rating } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const photo = await db.progressPhoto.create({
      data: {
        date,
        category: category || 'face',
        note: note?.trim() || null,
        rating: rating ?? null,
      },
    });

    // XP emission
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];
    const character = await db.character.findFirst();
    if (character) {
      const result = await emitXP(character.id, 'looksmaxxing', 'progress_photo');
      if (result) {
        xpEvents.push({
          module: 'looksmaxxing',
          action: 'progress_photo',
          amount: result.amount,
          attribute: result.attribute,
        });
      }
    }

    return NextResponse.json(
      {
        photo: {
          id: photo.id,
          date: photo.date,
          category: photo.category,
          note: photo.note,
          rating: photo.rating,
          createdAt: photo.createdAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating progress photo:', error);
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 });
  }
}
