import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== PATCH /api/finance/accounts/[id] ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, balance, currency, icon, color, sortOrder } = body;

    const existing = await db.account.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = await db.account.update({
      where: { id },
      data: {
        ...(name !== undefined && typeof name === 'string' ? { name: name.trim() } : {}),
        ...(balance !== undefined && typeof balance === 'number' ? { balance } : {}),
        ...(currency !== undefined && typeof currency === 'string' ? { currency } : {}),
        ...(icon !== undefined && typeof icon === 'string' ? { icon } : {}),
        ...(color !== undefined && typeof color === 'string' ? { color } : {}),
        ...(sortOrder !== undefined && typeof sortOrder === 'number' ? { sortOrder } : {}),
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

// ==================== DELETE /api/finance/accounts/[id] ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.account.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Soft delete: archive the account
    const account = await db.account.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({
      account: {
        id: account.id,
        name: account.name,
        isArchived: account.isArchived,
      },
    });
  } catch (error) {
    console.error('Error archiving account:', error);
    return NextResponse.json({ error: 'Failed to archive account' }, { status: 500 });
  }
}
