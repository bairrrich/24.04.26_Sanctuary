import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== PATCH /api/finance/transactions/[id] ====================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { accountId, amount, category, description, date } = body;

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // If amount or accountId changes, we need to adjust account balance(s)
    const amountChanged = amount !== undefined && typeof amount === 'number' && amount !== existing.amount;
    const accountChanged = accountId !== undefined && typeof accountId === 'string' && accountId !== existing.accountId;

    if (amountChanged || accountChanged) {
      // Reverse the old amount from the old account
      const oldAccount = await db.account.findUnique({ where: { id: existing.accountId } });
      if (oldAccount) {
        await db.account.update({
          where: { id: existing.accountId },
          data: { balance: oldAccount.balance - existing.amount },
        });
      }

      // If account changed, add the new amount to the new account
      if (accountChanged) {
        const newAccount = await db.account.findUnique({ where: { id: accountId } });
        if (!newAccount) {
          return NextResponse.json({ error: 'New account not found' }, { status: 404 });
        }
        await db.account.update({
          where: { id: accountId },
          data: { balance: newAccount.balance + (typeof amount === 'number' ? amount : existing.amount) },
        });
      } else {
        // Same account, just adjust for the new amount
        await db.account.update({
          where: { id: existing.accountId },
          data: { balance: (oldAccount!.balance - existing.amount) + (typeof amount === 'number' ? amount : existing.amount) },
        });
      }
    }

    const validCategories = ['food', 'transport', 'entertainment', 'shopping', 'health', 'education', 'salary', 'other'];

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        ...(accountId !== undefined && typeof accountId === 'string' ? { accountId } : {}),
        ...(amount !== undefined && typeof amount === 'number' ? { amount } : {}),
        ...(category !== undefined && validCategories.includes(category) ? { category } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(date !== undefined && typeof date === 'string' ? { date } : {}),
      },
      include: {
        account: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// ==================== DELETE /api/finance/transactions/[id] ====================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Reverse the amount from the account balance
    const account = await db.account.findUnique({ where: { id: existing.accountId } });
    if (account) {
      await db.account.update({
        where: { id: existing.accountId },
        data: { balance: account.balance - existing.amount },
      });
    }

    // Delete the transaction
    await db.transaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
