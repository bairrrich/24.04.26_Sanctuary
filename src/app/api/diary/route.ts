import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateXP } from '@/lib/xp-engine';
import { assignClass } from '@/lib/class-system';
import { attributeLevelFromXP, characterLevelFromXP } from '@/lib/xp-engine';
import type { RPGAttribute } from '@/types';

// ==================== XP Emitter ====================

async function emitXPInternal(characterId: string, module: string, action: string) {
  const xpResult = calculateXP(module, action);
  if (!xpResult) return null;
  await db.xPEvent.create({ data: { characterId, module, action, attribute: xpResult.attribute, amount: xpResult.amount } });
  const currentAttr = await db.characterAttribute.findUnique({ where: { characterId_attribute: { characterId, attribute: xpResult.attribute } } });
  if (!currentAttr) return null;
  const newAttrXP = currentAttr.xp + xpResult.amount;
  const newAttrLevel = attributeLevelFromXP(newAttrXP);
  await db.characterAttribute.update({ where: { id: currentAttr.id }, data: { xp: newAttrXP, level: newAttrLevel } });
  const character = await db.character.findUnique({ where: { id: characterId }, include: { attributes: true } });
  if (!character) return null;
  const newTotalXP = character.totalXP + xpResult.amount;
  const newLevel = characterLevelFromXP(newTotalXP);
  const attributeXP: Record<string, number> = { strength: 0, agility: 0, intelligence: 0, endurance: 0, charisma: 0 };
  for (const attr of character.attributes) { const key = attr.attribute; if (key in attributeXP) attributeXP[key] = attr.xp; }
  attributeXP[xpResult.attribute] = newAttrXP;
  const classResult = assignClass(attributeXP as Record<RPGAttribute, number>, newLevel);
  await db.character.update({ where: { id: characterId }, data: { totalXP: newTotalXP, level: newLevel, currentClassId: classResult.classId } });
  return { attribute: xpResult.attribute, amount: xpResult.amount, newTotalXP, newLevel };
}

// ==================== Helpers ====================

function getTodayString(): string {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

// ==================== GET /api/diary ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {};

    if (date && isValidDate(date)) {
      where.date = date;
    } else if (from && to && isValidDate(from) && isValidDate(to)) {
      where.date = { gte: from, lte: to };
    } else if (from && isValidDate(from)) {
      where.date = { gte: from };
    } else if (to && isValidDate(to)) {
      where.date = { lte: to };
    }

    const entries = await db.diaryEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const serialized = entries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    return NextResponse.json({ entries: serialized });
  } catch (error) {
    console.error('Error listing diary entries:', error);
    return NextResponse.json({ error: 'Failed to list diary entries' }, { status: 500 });
  }
}

// ==================== POST /api/diary ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, title, content, mood, tags } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const entryDate = date || getTodayString();
    if (!isValidDate(entryDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    if (mood && !['great', 'good', 'neutral', 'bad', 'terrible'].includes(mood)) {
      return NextResponse.json({ error: 'Invalid mood value' }, { status: 400 });
    }

    const entry = await db.diaryEntry.create({
      data: {
        date: entryDate,
        title: title?.trim() || null,
        content: content.trim(),
        mood: mood || null,
        tags: tags && Array.isArray(tags) ? JSON.stringify(tags) : null,
      },
    });

    // ==================== XP Emission ====================
    const xpEvents: Array<{ attribute: string; amount: number; action: string }> = [];

    // Get the first character (single-user app)
    const character = await db.character.findFirst();
    if (character) {
      // entry_create: always emit
      const xp1 = await emitXPInternal(character.id, 'diary', 'entry_create');
      if (xp1) xpEvents.push({ attribute: xp1.attribute, amount: xp1.amount, action: 'entry_create' });

      // entry_long: if content >= 500 chars
      if (content.trim().length >= 500) {
        const xp2 = await emitXPInternal(character.id, 'diary', 'entry_long');
        if (xp2) xpEvents.push({ attribute: xp2.attribute, amount: xp2.amount, action: 'entry_long' });
      }

      // daily_reflection: if it's the first entry today
      const todayEntriesCount = await db.diaryEntry.count({
        where: { date: entryDate },
      });
      // todayEntriesCount includes the entry we just created, so if it's 1, it's the first
      if (todayEntriesCount === 1) {
        const xp3 = await emitXPInternal(character.id, 'diary', 'daily_reflection');
        if (xp3) xpEvents.push({ attribute: xp3.attribute, amount: xp3.amount, action: 'daily_reflection' });
      }
    }

    return NextResponse.json(
      {
        entry: {
          id: entry.id,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags ? JSON.parse(entry.tags) : [],
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating diary entry:', error);
    return NextResponse.json({ error: 'Failed to create diary entry' }, { status: 500 });
  }
}
