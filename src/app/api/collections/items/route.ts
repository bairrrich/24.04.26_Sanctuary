import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    const where: Record<string, unknown> = {};
    if (collectionId) where.collectionId = collectionId;

    const items = await db.collectionItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = await db.collectionItem.create({ data: body });

    const character = await db.character.findFirst();
    if (character) {
      await emitXP(character.id, 'collections', 'item_add').catch(() => {});
      if (body.review) {
        await emitXP(character.id, 'collections', 'review_write').catch(() => {});
      }
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
