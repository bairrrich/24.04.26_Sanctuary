import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateXP, attributeLevelFromXP, characterLevelFromXP } from '@/lib/xp-engine';
import { assignClass } from '@/lib/class-system';
import type { RPGAttribute } from '@/types';

// ==================== Helper: Internal emit XP ====================

async function emitXPInternal(characterId: string, module: string, action: string) {
  const xpResult = calculateXP(module, action);
  if (!xpResult) return null;

  await db.xPEvent.create({
    data: {
      characterId,
      module,
      action,
      attribute: xpResult.attribute,
      amount: xpResult.amount,
    },
  });

  const currentAttr = await db.characterAttribute.findUnique({
    where: {
      characterId_attribute: { characterId, attribute: xpResult.attribute },
    },
  });

  if (!currentAttr) return null;

  const newAttrXP = currentAttr.xp + xpResult.amount;
  const newAttrLevel = attributeLevelFromXP(newAttrXP);

  await db.characterAttribute.update({
    where: { id: currentAttr.id },
    data: { xp: newAttrXP, level: newAttrLevel },
  });

  const character = await db.character.findUnique({
    where: { id: characterId },
    include: { attributes: true },
  });

  if (!character) return null;

  const newTotalXP = character.totalXP + xpResult.amount;
  const newLevel = characterLevelFromXP(newTotalXP);

  const attributeXP: Record<RPGAttribute, number> = {
    strength: 0,
    agility: 0,
    intelligence: 0,
    endurance: 0,
    charisma: 0,
  };
  for (const attr of character.attributes) {
    const key = attr.attribute as RPGAttribute;
    if (key in attributeXP) attributeXP[key] = attr.xp;
  }
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

  return {
    attribute: xpResult.attribute,
    amount: xpResult.amount,
    newTotalXP,
    newLevel,
  };
}

// ==================== GET /api/finance/budgets ====================

export async function GET() {
  try {
    const budgets = await db.budget.findMany({
      orderBy: { category: 'asc' },
    });

    // Calculate current month spending for each budget category
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;

    const spending = await db.transaction.groupBy({
      by: ['category'],
      where: {
        amount: { lt: 0 },
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const spendingMap: Record<string, number> = {};
    for (const s of spending) {
      spendingMap[s.category] = Math.abs(s._sum.amount ?? 0);
    }

    return NextResponse.json({
      budgets: budgets.map((b) => ({
        id: b.id,
        category: b.category,
        amount: b.amount,
        period: b.period,
        spent: spendingMap[b.category] ?? 0,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting budgets:', error);
    return NextResponse.json({ error: 'Failed to get budgets' }, { status: 500 });
  }
}

// ==================== POST /api/finance/budgets ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, amount, period } = body;

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }

    const validCategories = ['food', 'transport', 'entertainment', 'shopping', 'health', 'education', 'salary', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const validPeriods = ['weekly', 'monthly', 'yearly'];
    const budgetPeriod = validPeriods.includes(period) ? period : 'monthly';

    // Upsert: create or update budget for the category
    const budget = await db.budget.upsert({
      where: { category },
      update: { amount, period: budgetPeriod },
      create: { category, amount, period: budgetPeriod },
    });

    // Emit XP for budget_created
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      const xpResult = await emitXPInternal(character.id, 'finance', 'budget_created');
      if (xpResult) {
        xpEvents.push({
          module: 'finance',
          action: 'budget_created',
          amount: xpResult.amount,
          attribute: xpResult.attribute,
        });
      }
    }

    return NextResponse.json(
      {
        budget: {
          id: budget.id,
          category: budget.category,
          amount: budget.amount,
          period: budget.period,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json({ error: 'Failed to create/update budget' }, { status: 500 });
  }
}
