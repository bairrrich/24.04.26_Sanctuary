'use client';

import { create } from 'zustand';

// ==================== Types ====================

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  sortOrder: number;
  isArchived: boolean;
  _count?: { transactions: number };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  account: { id: string; name: string; icon: string; color: string };
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  name: string;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface CreateTransactionData {
  accountId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface CreateBudgetData {
  category: string;
  amount: number;
  period?: string;
}

// ==================== Helper ====================

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

// ==================== Store Interface ====================

interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isLoading: boolean;
  selectedDate: string;

  loadDashboard: () => Promise<void>;
  loadTransactions: (date?: string) => Promise<void>;
  createAccount: (data: CreateAccountData) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createBudget: (data: CreateBudgetData) => Promise<void>;
  refreshGamification: () => Promise<void>;
}

// ==================== Store ====================

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  isLoading: false,
  selectedDate: getTodayString(),

  loadDashboard: async () => {
    set({ isLoading: true });
    try {
      const { from, to } = getMonthRange();

      const [accountsRes, budgetsRes, monthTxRes] = await Promise.all([
        fetch('/api/finance/accounts'),
        fetch('/api/finance/budgets'),
        fetch(`/api/finance/transactions?from=${from}&to=${to}`),
      ]);

      if (!accountsRes.ok || !budgetsRes.ok || !monthTxRes.ok) {
        throw new Error('Failed to load finance data');
      }

      const accountsData = await accountsRes.json();
      const budgetsData = await budgetsRes.json();
      const monthTxData = await monthTxRes.json();

      const accounts: Account[] = accountsData.accounts ?? [];
      const budgets: Budget[] = budgetsData.budgets ?? [];
      const monthTx: Transaction[] = monthTxData.transactions ?? [];

      const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      const monthlyIncome = monthTx.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const monthlyExpense = monthTx.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

      set({
        accounts,
        budgets,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        isLoading: false,
      });

      // Also load recent transactions
      await get().loadTransactions(get().selectedDate);
    } catch (error) {
      console.error('Error loading finance dashboard:', error);
      set({ isLoading: false });
    }
  },

  loadTransactions: async (date?: string) => {
    try {
      const d = date || get().selectedDate;
      const res = await fetch(`/api/finance/transactions?date=${d}`);
      if (!res.ok) throw new Error('Failed to load transactions');

      const data = await res.json();
      set({ transactions: data.transactions ?? [] });
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  },

  createAccount: async (data: CreateAccountData) => {
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create account');
      const result = await res.json();

      set((state) => ({
        accounts: [...state.accounts, result.account],
        totalBalance: state.totalBalance + (result.account.balance || 0),
      }));
    } catch (error) {
      console.error('Error creating account:', error);
    }
  },

  updateAccount: async (id: string, data: Partial<Account>) => {
    try {
      const res = await fetch(`/api/finance/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update account');
      const result = await res.json();

      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...result.account } : a)),
        totalBalance: state.accounts.reduce((sum, a) => sum + (a.id === id ? result.account.balance : a.balance), 0),
      }));
    } catch (error) {
      console.error('Error updating account:', error);
    }
  },

  deleteAccount: async (id: string) => {
    try {
      const res = await fetch(`/api/finance/accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive account');

      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
        totalBalance: state.accounts.filter((a) => a.id !== id).reduce((sum, a) => sum + a.balance, 0),
      }));
    } catch (error) {
      console.error('Error archiving account:', error);
    }
  },

  createTransaction: async (data: CreateTransactionData) => {
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      const result = await res.json();

      // Update local state
      const tx = result.transaction;
      set((state) => {
        const newAccounts = state.accounts.map((a) =>
          a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a
        );
        const totalBalance = newAccounts.reduce((sum, a) => sum + a.balance, 0);
        const isInDate = tx.date === state.selectedDate;
        const newTransactions = isInDate ? [tx, ...state.transactions] : state.transactions;
        const monthlyIncome = tx.amount > 0
          ? state.monthlyIncome + tx.amount
          : state.monthlyIncome;
        const monthlyExpense = tx.amount < 0
          ? state.monthlyExpense + Math.abs(tx.amount)
          : state.monthlyExpense;

        return {
          accounts: newAccounts,
          totalBalance,
          transactions: newTransactions,
          monthlyIncome,
          monthlyExpense,
        };
      });

      // Refresh gamification if XP was emitted
      if (result.xpEvents && result.xpEvents.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      const result = await res.json();

      // Reload dashboard to recalculate balances
      await get().loadDashboard();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete transaction');

      // Reload dashboard to recalculate
      await get().loadDashboard();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  createBudget: async (data: CreateBudgetData) => {
    try {
      const res = await fetch('/api/finance/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create budget');
      const result = await res.json();

      // Update or add the budget
      set((state) => {
        const exists = state.budgets.find((b) => b.category === result.budget.category);
        const newBudgets = exists
          ? state.budgets.map((b) => (b.category === result.budget.category ? { ...b, ...result.budget, spent: b.spent } : b))
          : [...state.budgets, { ...result.budget, spent: 0 }];
        return { budgets: newBudgets };
      });

      // Refresh gamification if XP was emitted
      if (result.xpEvents && result.xpEvents.length > 0) {
        get().refreshGamification();
      }
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  },

  refreshGamification: async () => {
    try {
      const res = await fetch('/api/gamification/character');
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined' && data.character) {
          window.dispatchEvent(
            new CustomEvent('gamification:updated', {
              detail: data.character,
            })
          );
        }
      }
    } catch {
      // Silent fail — gamification sync is non-critical
    }
  },
}));
