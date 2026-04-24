import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.isCompleted === true) {
      const reminder = await db.reminder.findUnique({ where: { id } });
      if (reminder && !reminder.isCompleted) {
        const character = await db.character.findFirst();
        if (character) {
          await emitXP(character.id, 'reminders', 'reminder_complete').catch(() => {});
        }
      }
    }

    const reminder = await db.reminder.update({ where: { id }, data: body });
    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}
