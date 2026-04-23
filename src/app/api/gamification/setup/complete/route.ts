import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/gamification/setup/complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId } = body;

    if (!characterId) {
      return NextResponse.json({ error: 'characterId is required' }, { status: 400 });
    }

    await db.character.update({
      where: { id: characterId },
      data: { isSetupComplete: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing setup:', error);
    return NextResponse.json({ error: 'Failed to complete setup' }, { status: 500 });
  }
}
