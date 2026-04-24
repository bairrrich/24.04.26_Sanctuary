import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await db.collectionItem.update({ where: { id }, data: body });

    // Check if all items in collection are completed
    if (body.status === 'completed') {
      const siblings = await db.collectionItem.findMany({ where: { collectionId: item.collectionId } });
      const allDone = siblings.every(s => s.status === 'completed');
      if (allDone) {
        const character = await db.character.findFirst();
        if (character) {
          await emitXP(character.id, 'collections', 'collection_complete').catch(() => {});
        }
      }
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collectionItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
