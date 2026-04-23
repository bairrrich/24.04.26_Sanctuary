import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== GET /api/finance/accounts ====================

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      where: { isArchived: false },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        currency: a.currency,
        icon: a.icon,
        color: a.color,
        sortOrder: a.sortOrder,
        isArchived: a.isArchived,
        _count: { transactions: a._count.transactions },
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    return NextResponse.json({ error: 'Failed to get accounts' }, { status: 500 });
  }
}

// ==================== POST /api/finance/accounts ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, balance, currency, icon, color, sortOrder } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const account = await db.account.create({
      data: {
        name: name.trim(),
        balance: typeof balance === 'number' ? balance : 0,
        currency: typeof currency === 'string' ? currency : 'RUB',
        icon: typeof icon === 'string' ? icon : '💰',
        color: typeof color === 'string' ? color : '#10b981',
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    return NextResponse.json(
      {
        account: {
          id: account.id,
          name: account.name,
          balance: account.balance,
          currency: account.currency,
          icon: account.icon,
          color: account.color,
          sortOrder: account.sortOrder,
          isArchived: account.isArchived,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
