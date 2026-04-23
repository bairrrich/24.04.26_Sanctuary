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

// ==================== GET /api/finance/transactions ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const accountId = searchParams.get('accountId');

    const where: Record<string, unknown> = {};

    if (date) {
      where.date = date;
    } else if (from && to) {
      where.date = { gte: from, lte: to };
    }

    if (accountId) {
      where.accountId = accountId;
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        account: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
      take: 200,
    });

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        accountId: t.accountId,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
        account: t.account,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return NextResponse.json({ error: 'Failed to get transactions' }, { status: 500 });
  }
}

// ==================== POST /api/finance/transactions ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, amount, category, description, date } = body;

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }
    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }
    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const validCategories = ['food', 'transport', 'entertainment', 'shopping', 'health', 'education', 'salary', 'other'];
    const cat = validCategories.includes(category) ? category : 'other';

    // Verify account exists
    const account = await db.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        accountId,
        amount,
        category: cat,
        description: description?.trim() || null,
        date,
      },
      include: {
        account: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });

    // Update account balance
    await db.account.update({
      where: { id: accountId },
      data: { balance: account.balance + amount },
    });

    // Emit XP for transaction_log
    const xpEvents: Array<{ module: string; action: string; amount: number; attribute: string }> = [];

    const character = await db.character.findFirst();
    if (character) {
      const xpResult = await emitXPInternal(character.id, 'finance', 'transaction_log');
      if (xpResult) {
        xpEvents.push({
          module: 'finance',
          action: 'transaction_log',
          amount: xpResult.amount,
          attribute: xpResult.attribute,
        });
      }
    }

    return NextResponse.json(
      {
        transaction: {
          id: transaction.id,
          accountId: transaction.accountId,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          account: transaction.account,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        },
        xpEvents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
