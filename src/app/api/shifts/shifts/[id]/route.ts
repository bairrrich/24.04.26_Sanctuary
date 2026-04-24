import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If marking as completed, emit XP
    if (body.isCompleted === true) {
      const shift = await db.shift.findUnique({ where: { id } });
      if (shift && !shift.isCompleted) {
        const character = await db.character.findFirst();
        if (character) {
          const action = shift.type === 'overtime' ? 'overtime_logged' : 'shift_complete';
          await emitXP(character.id, 'shifts', action).catch(() => {});
        }
      }
    }

    const shift = await db.shift.update({ where: { id }, data: body });
    return NextResponse.json({ shift });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.shift.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}
