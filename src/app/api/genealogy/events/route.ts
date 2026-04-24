import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const events = await db.familyEvent.findMany({
      where,
      orderBy: { date: 'asc' },
      take: 50,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching family events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = await db.familyEvent.create({ data: body });

    const character = await db.character.findFirst();
    if (character) {
      await emitXP(character.id, 'genealogy', 'event_add').catch(() => {});
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating family event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
