import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/looksmaxxing/photos/[id] — Delete a progress photo
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.progressPhoto.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    await db.progressPhoto.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting progress photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
