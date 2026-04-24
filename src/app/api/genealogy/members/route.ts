import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitXP } from '@/lib/emit-xp';

export async function GET() {
  try {
    const members = await db.familyMember.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const member = await db.familyMember.create({ data: body });

    const character = await db.character.findFirst();
    if (character) {
      await emitXP(character.id, 'genealogy', 'member_add').catch(() => {});
    }

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
