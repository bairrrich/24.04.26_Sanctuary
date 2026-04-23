import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/nutrition/water/[id] — Delete a water entry
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.waterLog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Water entry not found' }, { status: 404 });
    }

    await db.waterLog.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting water entry:', error);
    return NextResponse.json({ error: 'Failed to delete water entry' }, { status: 500 });
  }
}
