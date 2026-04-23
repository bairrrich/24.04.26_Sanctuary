import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateXP } from '@/lib/xp-engine';
import { assignClass } from '@/lib/class-system';
import { attributeLevelFromXP, characterLevelFromXP } from '@/lib/xp-engine';
import type { RPGAttribute } from '@/types';

// POST /api/gamification/emit-xp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, module, action } = body;

    if (!characterId || !module || !action) {
      return NextResponse.json({ error: 'characterId, module, and action are required' }, { status: 400 });
    }

    // Calculate XP for this action
    const xpResult = calculateXP(module, action);
    if (!xpResult) {
      return NextResponse.json({ error: `Unknown action: ${module}.${action}` }, { status: 400 });
    }

    // Create XP event
    const xpEvent = await db.xPEvent.create({
      data: {
        characterId,
        module,
        action,
        attribute: xpResult.attribute,
        amount: xpResult.amount,
      },
    });

    // Update attribute XP
    const currentAttr = await db.characterAttribute.findUnique({
      where: {
        characterId_attribute: { characterId, attribute: xpResult.attribute },
      },
    });

    if (!currentAttr) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
    }

    const newAttrXP = currentAttr.xp + xpResult.amount;
    const newAttrLevel = attributeLevelFromXP(newAttrXP);

    await db.characterAttribute.update({
      where: { id: currentAttr.id },
      data: { xp: newAttrXP, level: newAttrLevel },
    });

    // Update character total XP and level
    const character = await db.character.findUnique({
      where: { id: characterId },
      include: { attributes: true },
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const newTotalXP = character.totalXP + xpResult.amount;
    const newLevel = characterLevelFromXP(newTotalXP);

    // Recalculate class assignment
    const attributeXP: Record<RPGAttribute, number> = {
      strength: 0, agility: 0, intelligence: 0, endurance: 0, charisma: 0,
    };
    for (const attr of character.attributes) {
      const key = attr.attribute as RPGAttribute;
      if (key in attributeXP) attributeXP[key] = attr.xp;
    }
    // Include the just-updated attribute
    attributeXP[xpResult.attribute] = newAttrXP;

    const classResult = assignClass(attributeXP, newLevel);

    await db.character.update({
      where: { id: characterId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        currentClassId: classResult.classId,
      },
    });

    // Build updated attribute map
    const updatedAttributes: Record<RPGAttribute, { xp: number; level: number }> = {
      strength: { xp: 0, level: 1 },
      agility: { xp: 0, level: 1 },
      intelligence: { xp: 0, level: 1 },
      endurance: { xp: 0, level: 1 },
      charisma: { xp: 0, level: 1 },
    };
    for (const attr of character.attributes) {
      const key = attr.attribute as RPGAttribute;
      if (key in updatedAttributes) {
        updatedAttributes[key] = { xp: attr.xp, level: attr.level };
      }
    }
    updatedAttributes[xpResult.attribute] = { xp: newAttrXP, level: newAttrLevel };

    return NextResponse.json({
      character: {
        level: newLevel,
        totalXP: newTotalXP,
        currentClassId: classResult.classId,
        isHybrid: classResult.isHybrid,
        hybridClassId: classResult.hybridId ?? null,
        attributes: updatedAttributes,
        recentXPEvents: {
          id: xpEvent.id,
          module: xpEvent.module,
          action: xpEvent.action,
          attribute: xpEvent.attribute,
          amount: xpEvent.amount,
          createdAt: xpEvent.createdAt.toISOString(),
        },
      },
      xpGained: {
        attribute: xpResult.attribute,
        amount: xpResult.amount,
      },
      leveledUp: newLevel > character.level,
      attrLeveledUp: newAttrLevel > currentAttr.level,
    });
  } catch (error) {
    console.error('Error emitting XP:', error);
    return NextResponse.json({ error: 'Failed to emit XP' }, { status: 500 });
  }
}
