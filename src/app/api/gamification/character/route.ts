import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assignClass } from '@/lib/class-system';
import { attributeLevelFromXP, characterLevelFromXP } from '@/lib/xp-engine';
import type { RPGAttribute } from '@/types';

const ATTRIBUTES: RPGAttribute[] = ['strength', 'agility', 'intelligence', 'endurance', 'charisma'];

// GET /api/gamification/character
export async function GET() {
  try {
    const character = await db.character.findFirst({
      include: {
        attributes: true,
        xpEvents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!character) {
      return NextResponse.json({ character: null });
    }

    // Build attribute map
    const attributeMap: Record<RPGAttribute, { xp: number; level: number }> = {
      strength: { xp: 0, level: 1 },
      agility: { xp: 0, level: 1 },
      intelligence: { xp: 0, level: 1 },
      endurance: { xp: 0, level: 1 },
      charisma: { xp: 0, level: 1 },
    };

    for (const attr of character.attributes) {
      const key = attr.attribute as RPGAttribute;
      if (key in attributeMap) {
        attributeMap[key] = { xp: attr.xp, level: attr.level };
      }
    }

    // Recalculate class
    const attributeXP: Record<RPGAttribute, number> = {
      strength: attributeMap.strength.xp,
      agility: attributeMap.agility.xp,
      intelligence: attributeMap.intelligence.xp,
      endurance: attributeMap.endurance.xp,
      charisma: attributeMap.charisma.xp,
    };

    const classResult = assignClass(attributeXP, character.level);

    // Update class if changed
    if (classResult.classId !== character.currentClassId) {
      await db.character.update({
        where: { id: character.id },
        data: {
          currentClassId: classResult.classId,
        },
      });
    }

    return NextResponse.json({
      character: {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        level: character.level,
        totalXP: character.totalXP,
        currentClassId: classResult.classId,
        isHybrid: classResult.isHybrid,
        hybridClassId: classResult.hybridId ?? null,
        isSetupComplete: character.isSetupComplete,
        attributes: attributeMap,
        recentXPEvents: character.xpEvents.map(e => ({
          id: e.id,
          module: e.module,
          action: e.action,
          attribute: e.attribute as RPGAttribute,
          amount: e.amount,
          createdAt: e.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Error loading character:', error);
    return NextResponse.json({ error: 'Failed to load character' }, { status: 500 });
  }
}

// POST /api/gamification/character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if character already exists
    const existing = await db.character.findFirst();
    if (existing) {
      return NextResponse.json({ error: 'Character already exists' }, { status: 409 });
    }

    // Create character with default attributes
    const character = await db.character.create({
      data: {
        name: name.trim(),
        currentClassId: 'novice',
        attributes: {
          create: ATTRIBUTES.map(attr => ({
            attribute: attr,
            xp: 0,
            level: 1,
          })),
        },
      },
      include: { attributes: true },
    });

    return NextResponse.json({
      character: {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
        level: character.level,
        totalXP: character.totalXP,
        currentClassId: character.currentClassId,
        isHybrid: false,
        hybridClassId: null,
        isSetupComplete: character.isSetupComplete,
      },
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
