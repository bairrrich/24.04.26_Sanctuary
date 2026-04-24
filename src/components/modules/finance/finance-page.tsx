'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
import { PageHeader, ModuleTabs, FAB, EmptyState } from '@/components/shared';
import { MODULE_REGISTRY } from '@/lib/module-config';
import { ANIMATION, CURRENCY_SYMBOLS, SPACING } from '@/lib/constants';
import { useSettingsStore } from '@/store/settings-store';
import {
  useFinanceStore,
  type Account,
  type Transaction,
  type Budget,
  type CreateTransactionData,
  type CreateBudgetData,
} from '@/store/finance-store';
import { useGamificationStore } from '@/store/gamification-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TabItem } from '@/types';

// ==================== Category Config ====================

const CATEGORIES = [
  { id: 'food', icon: '🍔', labelEn: 'Food', labelRu: 'Еда', color: '#f97316' },
  { id: 'transport', icon: '🚗', labelEn: 'Transport', labelRu: 'Транспорт', color: '#3b82f6' },
  { id: 'entertainment', icon: '🎮', labelEn: 'Entertainment', labelRu: 'Развлечения', color: '#a855f7' },
  { id: 'shopping', icon: '🛍️', labelEn: 'Shopping', labelRu: 'Покупки', color: '#ec4899' },
  { id: 'health', icon: '❤️', labelEn: 'Health', labelRu: 'Здоровье', color: '#ef4444' },
  { id: 'education', icon: '📚', labelEn: 'Education', labelRu: 'Образование', color: '#06b6d4' },
  { id: 'salary', icon: '💰', labelEn: 'Salary', labelRu: 'Зарплата', color: '#10b981' },
  { id: 'other', icon: '📦', labelEn: 'Other', labelRu: 'Другое', color: '#6b7280' },
] as const;

function getCategoryInfo(categoryId: string) {
  return CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[CATEGORIES.length - 1];
}

// ==================== Main Page ====================

export function FinancePage() {
  const language = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);
  const config = MODULE_REGISTRY.finance;
  const { isLoading, accounts, transactions, selectedDate, loadDashboard } = useFinanceStore();
  const loadCharacter = useGamificationStore((s) => s.loadCharacter);

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTxSheet, setShowCreateTxSheet] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handler = () => {
      loadCharacter();
    };
    window.addEventListener('gamification:updated', handler);
    return () => window.removeEventListener('gamification:updated', handler);
  }, [loadCharacter]);

  const tabs: TabItem[] = [
    { id: 'overview', label: language === 'ru' ? 'Обзор' : 'Overview' },
    { id: 'transactions', label: language === 'ru' ? 'Операции' : 'Transactions' },
    { id: 'budgets', label: language === 'ru' ? 'Бюджеты' : 'Budgets' },
    { id: 'analytics', label: language === 'ru' ? 'Аналитика' : 'Analytics' },
  ];

  const totalAccounts = accounts.length;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={language === 'ru' ? 'Финансы' : 'Finance'}
        icon={Wallet}
        accentColor={config.accentColor}
        subtitle={
          totalAccounts > 0
            ? `${totalAccounts} ${language === 'ru' ? 'счетов' : 'accounts'}`
            : undefined
        }
      />

      <div className={`flex-1 overflow-y-auto ${SPACING.PAGE_PX} ${SPACING.PAGE_PY} space-y-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <ModuleTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={config.accentColor}
            />

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab
                  language={language}
                  accentColor={config.accentColor}
                  currency={currency}
                />
              )}
              {activeTab === 'transactions' && (
                <TransactionsTab
                  language={language}
                  accentColor={config.accentColor}
                  currency={currency}
                  selectedDate={selectedDate}
                />
              )}
              {activeTab === 'budgets' && (
                <BudgetsTab
                  language={language}
                  accentColor={config.accentColor}
                  currency={currency}
                  onAddBudget={() => setShowCreateTxSheet(true)}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab
                  language={language}
                  accentColor={config.accentColor}
                  currency={currency}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <FAB
        accentColor={config.accentColor}
        onClick={() => setShowCreateTxSheet(true)}
      />

      <CreateTransactionSheet
        open={showCreateTxSheet}
        onClose={() => setShowCreateTxSheet(false)}
        language={language}
        accentColor={config.accentColor}
        currency={currency}
      />
    </div>
  );
}

// ==================== Format Helpers ====================

function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const abs = Math.abs(amount);
  const formatted = abs >= 1000 ? abs.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) : abs.toFixed(0);
  return `${amount < 0 ? '-' : ''}${formatted} ${symbol}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ==================== Overview Tab ====================

function OverviewTab({
  language,
  accentColor,
  currency,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
}) {
  const { accounts, totalBalance, monthlyIncome, monthlyExpense, transactions } = useFinanceStore();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-5 space-y-3"
        style={{ borderColor: `${accentColor}30` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Wallet className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {language === 'ru' ? 'Общий баланс' : 'Total Balance'}
          </span>
        </div>
        <p className="text-2xl font-bold" style={{ color: accentColor }}>
          {formatMoney(totalBalance, currency)}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Доход' : 'Income'}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              {formatMoney(monthlyIncome, currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Расход' : 'Expense'}
            </span>
            <span className="text-xs font-semibold text-red-500">
              {formatMoney(monthlyExpense, currency)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, ...ANIMATION.SPRING_GENTLE }}
          className="rounded-xl border bg-card p-3 text-center"
        >
          <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
          <p className="text-sm font-bold text-emerald-500">{formatMoney(monthlyIncome, currency)}</p>
          <p className="text-[10px] text-muted-foreground">
            {language === 'ru' ? 'Доход за месяц' : 'Monthly Income'}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, ...ANIMATION.SPRING_GENTLE }}
          className="rounded-xl border bg-card p-3 text-center"
        >
          <TrendingDown className="h-5 w-5 mx-auto text-red-500 mb-1" />
          <p className="text-sm font-bold text-red-500">{formatMoney(monthlyExpense, currency)}</p>
          <p className="text-[10px] text-muted-foreground">
            {language === 'ru' ? 'Расход за месяц' : 'Monthly Expense'}
          </p>
        </motion.div>
      </div>

      {/* Account Cards */}
      {accounts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Счета' : 'Accounts'}
          </h4>
          <div className="space-y-2">
            {accounts.map((account, i) => (
              <AccountCard
                key={account.id}
                account={account}
                language={language}
                accentColor={accentColor}
                currency={currency}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Последние операции' : 'Recent Transactions'}
          </h4>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="divide-y">
              {recentTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  language={language}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {accounts.length === 0 && (
        <EmptyState
          icon={Wallet}
          title={language === 'ru' ? 'Нет счетов' : 'No Accounts'}
          description={
            language === 'ru'
              ? 'Создайте первый счёт, чтобы начать отслеживание финансов'
              : 'Create your first account to start tracking finances'
          }
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Account Card ====================

function AccountCard({
  account,
  language,
  accentColor,
  currency,
  index,
}: {
  account: Account;
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY }}
      className="flex items-center gap-3 rounded-xl border bg-card p-3"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ backgroundColor: `${account.color}20` }}
      >
        {account.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{account.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {account._count?.transactions ?? 0} {language === 'ru' ? 'операций' : 'transactions'}
        </p>
      </div>
      <span
        className="text-sm font-bold"
        style={{ color: account.balance >= 0 ? accentColor : '#ef4444' }}
      >
        {formatMoney(account.balance, currency)}
      </span>
    </motion.div>
  );
}

// ==================== Transaction Row ====================

function TransactionRow({
  transaction,
  language,
  currency,
  onDelete,
}: {
  transaction: Transaction;
  language: 'en' | 'ru';
  currency: string;
  onDelete?: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const catInfo = getCategoryInfo(transaction.category);
  const isIncome = transaction.amount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 p-3 group"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ backgroundColor: `${catInfo.color}20` }}
      >
        {catInfo.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {transaction.description || (language === 'ru' ? catInfo.labelRu : catInfo.labelEn)}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {language === 'ru' ? catInfo.labelRu : catInfo.labelEn}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {transaction.account?.name || ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className={`text-sm font-bold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
          {isIncome ? '+' : ''}{formatMoney(transaction.amount, currency)}
        </span>
        {onDelete && (
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-1"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        {showDelete && onDelete && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-destructive" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Transactions Tab ====================

function TransactionsTab({
  language,
  accentColor,
  currency,
  selectedDate,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
  selectedDate: string;
}) {
  const { transactions, loadTransactions } = useFinanceStore();
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  return (
    <motion.div
      key="transactions"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {/* Date Navigation */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={(date) => {
          useFinanceStore.setState({ selectedDate: date });
          loadTransactions(date);
        }}
        language={language}
        accentColor={accentColor}
      />

      {/* Transaction List */}
      {transactions.length > 0 ? (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-3 border-b">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {transactions.length} {language === 'ru' ? 'операций' : 'transactions'}
            </span>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                language={language}
                currency={currency}
                onDelete={() => deleteTransaction(tx.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title={language === 'ru' ? 'Нет операций' : 'No Transactions'}
          description={
            language === 'ru'
              ? 'Добавьте первую операцию, нажав кнопку +'
              : 'Add your first transaction using the + button'
          }
          accentColor={accentColor}
        />
      )}
    </motion.div>
  );
}

// ==================== Date Navigator ====================

function DateNavigator({
  selectedDate,
  onDateChange,
  language,
  accentColor,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  language: 'en' | 'ru';
  accentColor: string;
}) {
  const navigateDate = (direction: -1 | 1) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  const goToToday = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    onDateChange(today);
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return language === 'ru' ? 'Сегодня' : 'Today';
    if (diff === -1) return language === 'ru' ? 'Вчера' : 'Yesterday';
    if (diff === 1) return language === 'ru' ? 'Завтра' : 'Tomorrow';

    const weekdays = language === 'ru'
      ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = language === 'ru'
      ? ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const isToday = (() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return selectedDate === today;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-2xl border bg-card p-3"
    >
      <button
        onClick={() => navigateDate(-1)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={goToToday} className="flex flex-col items-center">
        <span className="text-sm font-medium">{formatDateLabel(selectedDate)}</span>
        {!isToday && (
          <span className="text-[10px] text-muted-foreground">
            {language === 'ru' ? 'нажмите: сегодня' : 'tap for today'}
          </span>
        )}
      </button>
      <button
        onClick={() => navigateDate(1)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ==================== Budgets Tab ====================

function BudgetsTab({
  language,
  accentColor,
  currency,
  onAddBudget,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
  onAddBudget: () => void;
}) {
  const { budgets } = useFinanceStore();
  const [showBudgetSheet, setShowBudgetSheet] = useState(false);

  return (
    <motion.div
      key="budgets"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {/* Add Budget Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowBudgetSheet(true)}
        style={{ borderColor: `${accentColor}40`, color: accentColor }}
      >
        <Plus className="h-4 w-4 mr-2" />
        {language === 'ru' ? 'Добавить бюджет' : 'Add Budget'}
      </Button>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="space-y-3">
          {budgets.map((budget, i) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              language={language}
              accentColor={accentColor}
              currency={currency}
              index={i}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title={language === 'ru' ? 'Нет бюджетов' : 'No Budgets'}
          description={
            language === 'ru'
              ? 'Создайте бюджет для контроля расходов по категориям'
              : 'Create a budget to control spending by category'
          }
          accentColor={accentColor}
        />
      )}

      <CreateBudgetSheet
        open={showBudgetSheet}
        onClose={() => setShowBudgetSheet(false)}
        language={language}
        accentColor={accentColor}
        currency={currency}
      />
    </motion.div>
  );
}

// ==================== Budget Card ====================

function BudgetCard({
  budget,
  language,
  accentColor,
  currency,
  index,
}: {
  budget: Budget;
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
  index: number;
}) {
  const catInfo = getCategoryInfo(budget.category);
  const percentage = budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0;
  const isOver = budget.spent > budget.amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.STAGGER_DELAY }}
      className="rounded-2xl border bg-card p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: `${catInfo.color}20` }}
          >
            {catInfo.icon}
          </div>
          <div>
            <p className="text-sm font-medium">
              {language === 'ru' ? catInfo.labelRu : catInfo.labelEn}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {budget.period === 'weekly' ? (language === 'ru' ? 'Еженедельно' : 'Weekly') :
               budget.period === 'yearly' ? (language === 'ru' ? 'Ежегодно' : 'Yearly') :
               (language === 'ru' ? 'Ежемесячно' : 'Monthly')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isOver ? 'text-red-500' : ''}`}>
            {formatMoney(budget.spent, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            / {formatMoney(budget.amount, currency)}
          </p>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: isOver ? '#ef4444' : catInfo.color }}
        />
      </div>
      {isOver && (
        <p className="text-[10px] font-medium text-red-500">
          {language === 'ru' ? 'Бюджет превышен!' : 'Budget exceeded!'}
        </p>
      )}
    </motion.div>
  );
}

// ==================== Analytics Tab ====================

function AnalyticsTab({
  language,
  accentColor,
  currency,
}: {
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
}) {
  const { transactions, monthlyExpense, monthlyIncome } = useFinanceStore();

  // Expense by category
  const categoryExpenses = (() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.amount < 0) {
        const cat = tx.category || 'other';
        map[cat] = (map[cat] || 0) + Math.abs(tx.amount);
      }
    }
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  })();

  const maxExpense = categoryExpenses.length > 0 ? categoryExpenses[0].amount : 1;

  // Weekly trend (last 4 weeks)
  const weeklyData = (() => {
    const weeks: { label: string; expense: number; income: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const startStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
      weeks.push({
        label: language === 'ru' ? `Н${4 - i}` : `W${4 - i}`,
        expense: 0,
        income: 0,
      });
    }
    return weeks;
  })();

  const maxWeekly = Math.max(monthlyExpense, monthlyIncome, 1);

  // Stats
  const totalTransactions = transactions.length;
  const expenseCount = transactions.filter((t) => t.amount < 0).length;
  const avgDailyExpense = expenseCount > 0 ? Math.round(monthlyExpense / 30) : 0;
  const biggestCategory = categoryExpenses.length > 0
    ? getCategoryInfo(categoryExpenses[0].category)
    : null;

  const stats = [
    {
      label: language === 'ru' ? 'Всего операций' : 'Total Transactions',
      value: totalTransactions,
      icon: '📊',
    },
    {
      label: language === 'ru' ? 'Средний расход/день' : 'Avg Daily Expense',
      value: formatMoney(avgDailyExpense, currency),
      icon: '📉',
    },
    {
      label: language === 'ru' ? 'Крупная категория' : 'Biggest Category',
      value: biggestCategory
        ? language === 'ru' ? biggestCategory.labelRu : biggestCategory.labelEn
        : '—',
      icon: biggestCategory?.icon || '📦',
    },
    {
      label: language === 'ru' ? 'Расход/Доход' : 'Expense/Income',
      value: monthlyIncome > 0 ? `${Math.round((monthlyExpense / monthlyIncome) * 100)}%` : '—',
      icon: '⚖️',
    },
  ];

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, ...ANIMATION.SPRING_GENTLE }}
            className="rounded-xl border bg-card p-3 text-center"
          >
            <span className="text-xl">{stat.icon}</span>
            <p className="text-sm font-bold mt-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Expense by Category */}
      {categoryExpenses.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === 'ru' ? 'Расходы по категориям' : 'Expense by Category'}
          </h4>
          <div className="space-y-2.5">
            {categoryExpenses.slice(0, 6).map((item) => {
              const catInfo = getCategoryInfo(item.category);
              const pct = maxExpense > 0 ? (item.amount / maxExpense) * 100 : 0;

              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{catInfo.icon}</span>
                      <span className="text-xs font-medium">
                        {language === 'ru' ? catInfo.labelRu : catInfo.labelEn}
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: catInfo.color }}>
                      {formatMoney(item.amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: catInfo.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Trend (last 4 weeks) */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {language === 'ru' ? 'Тренд за 4 недели' : '4-Week Trend'}
        </h4>
        <div className="flex items-end gap-3 h-28">
          {weeklyData.map((week, i) => {
            const expenseHeight = maxWeekly > 0 ? Math.max(4, (week.expense / maxWeekly) * 100) : 4;
            const incomeHeight = maxWeekly > 0 ? Math.max(4, (week.income / maxWeekly) * 100) : 4;

            return (
              <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full h-20">
                  <motion.div
                    initial={{ height: 4 }}
                    animate={{ height: `${incomeHeight}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                    className="flex-1 rounded-t-md min-h-1"
                    style={{ backgroundColor: '#10b981' }}
                  />
                  <motion.div
                    initial={{ height: 4 }}
                    animate={{ height: `${expenseHeight}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                    className="flex-1 rounded-t-md min-h-1"
                    style={{ backgroundColor: '#ef4444' }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{week.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-muted-foreground">
              {language === 'ru' ? 'Доход' : 'Income'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[9px] text-muted-foreground">
              {language === 'ru' ? 'Расход' : 'Expense'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== Create Transaction Sheet ====================

function CreateTransactionSheet({
  open,
  onClose,
  language,
  accentColor,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
}) {
  const { accounts, createAccount, createTransaction } = useFinanceStore();
  const [tab, setTab] = useState<'transaction' | 'account'>('transaction');

  // Transaction form state
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [isCreating, setIsCreating] = useState(false);

  // Account form state
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountIcon, setAccountIcon] = useState('💰');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Use first account as default if none selected
  const effectiveAccountId = accountId || (accounts.length > 0 ? accounts[0].id : '');

  const handleCreateTransaction = async () => {
    if (!effectiveAccountId || !amount) return;
    setIsCreating(true);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setIsCreating(false);
      return;
    }

    await createTransaction({
      accountId: effectiveAccountId,
      amount: txType === 'expense' ? -parsedAmount : parsedAmount,
      category: txType === 'expense' ? category : 'salary',
      description: description.trim() || undefined,
      date: date || new Date().toISOString().split('T')[0],
    });

    // Reset form
    setAmount('');
    setCategory('food');
    setDescription('');
    setIsCreating(false);
    onClose();
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) return;
    setIsCreatingAccount(true);

    await createAccount({
      name: accountName.trim(),
      balance: parseFloat(accountBalance) || 0,
      currency,
      icon: accountIcon,
    });

    setAccountName('');
    setAccountBalance('');
    setAccountIcon('💰');
    setIsCreatingAccount(false);
    setTab('transaction');
  };

  const accountIcons = ['💰', '🏦', '💳', '🏠', '💵', '📱', '🔒', '🪙'];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {tab === 'transaction'
              ? language === 'ru' ? 'Новая операция' : 'New Transaction'
              : language === 'ru' ? 'Новый счёт' : 'New Account'}
          </SheetTitle>
        </SheetHeader>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-4 mb-4">
          <button
            onClick={() => setTab('transaction')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'transaction'
                ? 'border-2 shadow-sm'
                : 'bg-muted text-muted-foreground border-2 border-transparent'
            }`}
            style={
              tab === 'transaction'
                ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }
                : undefined
            }
          >
            {language === 'ru' ? 'Операция' : 'Transaction'}
          </button>
          <button
            onClick={() => setTab('account')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'account'
                ? 'border-2 shadow-sm'
                : 'bg-muted text-muted-foreground border-2 border-transparent'
            }`}
            style={
              tab === 'account'
                ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }
                : undefined
            }
          >
            {language === 'ru' ? 'Счёт' : 'Account'}
          </button>
        </div>

        {tab === 'transaction' ? (
          <div className="space-y-5">
            {/* Income / Expense Toggle */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {language === 'ru' ? 'Тип операции' : 'Transaction Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTxType('expense')}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    txType === 'expense'
                      ? 'border-2 shadow-sm'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                  style={
                    txType === 'expense'
                      ? { backgroundColor: '#ef444415', color: '#ef4444', borderColor: '#ef444440' }
                      : undefined
                  }
                >
                  <ArrowDownRight className="h-4 w-4" />
                  {language === 'ru' ? 'Расход' : 'Expense'}
                </button>
                <button
                  onClick={() => setTxType('income')}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    txType === 'income'
                      ? 'border-2 shadow-sm'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                  style={
                    txType === 'income'
                      ? { backgroundColor: '#10b98115', color: '#10b981', borderColor: '#10b98140' }
                      : undefined
                  }
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {language === 'ru' ? 'Доход' : 'Income'}
                </button>
              </div>
            </div>

            {/* Account Selector */}
            {accounts.length > 0 ? (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  {language === 'ru' ? 'Счёт' : 'Account'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setAccountId(acc.id)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                        effectiveAccountId === acc.id
                          ? 'border-2 shadow-sm'
                          : 'bg-muted text-muted-foreground border-2 border-transparent'
                      }`}
                      style={
                        effectiveAccountId === acc.id
                          ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }
                          : undefined
                      }
                    >
                      <span>{acc.icon}</span>
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {language === 'ru' ? 'Сначала создайте счёт' : 'Create an account first'}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setTab('account')}
                  style={{ color: accentColor }}
                >
                  {language === 'ru' ? 'Создать счёт →' : 'Create Account →'}
                </Button>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Сумма' : 'Amount'}
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min={0}
                step={0.01}
                autoFocus
              />
            </div>

            {/* Category Selector (only for expenses) */}
            {txType === 'expense' && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  {language === 'ru' ? 'Категория' : 'Category'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'salary').map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 rounded-xl text-center transition-all ${
                        category === cat.id
                          ? 'border-2 shadow-sm'
                          : 'bg-muted border-2 border-transparent'
                      }`}
                      style={
                        category === cat.id
                          ? { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40` }
                          : undefined
                      }
                    >
                      <span className="text-lg block">{cat.icon}</span>
                      <span
                        className="text-[9px] font-medium block mt-0.5"
                        style={category === cat.id ? { color: cat.color } : undefined}
                      >
                        {language === 'ru' ? cat.labelRu : cat.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Описание (необязательно)' : 'Description (optional)'}
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'ru' ? 'Напр: Обед в кафе' : 'e.g. Lunch at cafe'}
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Дата' : 'Date'}
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateTransaction}
              disabled={!effectiveAccountId || !amount || isCreating}
              className="w-full"
              style={{ backgroundColor: accentColor }}
            >
              {isCreating
                ? language === 'ru' ? 'Добавление...' : 'Adding...'
                : language === 'ru' ? 'Добавить операцию' : 'Add Transaction'}
            </Button>
          </div>
        ) : (
          /* Account creation form */
          <div className="space-y-5">
            {/* Account Name */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Название счёта' : 'Account Name'}
              </label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={language === 'ru' ? 'Напр: Основной счёт' : 'e.g. Main Account'}
                autoFocus
              />
            </div>

            {/* Initial Balance */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {language === 'ru' ? 'Начальный баланс' : 'Initial Balance'}
              </label>
              <Input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                placeholder="0"
                min={0}
                step={0.01}
              />
            </div>

            {/* Icon Selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                {language === 'ru' ? 'Иконка' : 'Icon'}
              </label>
              <div className="flex flex-wrap gap-2">
                {accountIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setAccountIcon(icon)}
                    className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                      accountIcon === icon
                        ? 'border-2 shadow-sm'
                        : 'bg-muted border-2 border-transparent'
                    }`}
                    style={
                      accountIcon === icon
                        ? { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }
                        : undefined
                    }
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Account Button */}
            <Button
              onClick={handleCreateAccount}
              disabled={!accountName.trim() || isCreatingAccount}
              className="w-full"
              style={{ backgroundColor: accentColor }}
            >
              {isCreatingAccount
                ? language === 'ru' ? 'Создание...' : 'Creating...'
                : language === 'ru' ? 'Создать счёт' : 'Create Account'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ==================== Create Budget Sheet ====================

function CreateBudgetSheet({
  open,
  onClose,
  language,
  accentColor,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'ru';
  accentColor: string;
  currency: string;
}) {
  const { createBudget } = useFinanceStore();
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!amount) return;
    setIsCreating(true);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setIsCreating(false);
      return;
    }

    await createBudget({
      category,
      amount: parsedAmount,
      period,
    });

    setAmount('');
    setCategory('food');
    setPeriod('monthly');
    setIsCreating(false);
    onClose();
  };

  const periods = [
    { id: 'weekly', label: language === 'ru' ? 'Еженедельно' : 'Weekly' },
    { id: 'monthly', label: language === 'ru' ? 'Ежемесячно' : 'Monthly' },
    { id: 'yearly', label: language === 'ru' ? 'Ежегодно' : 'Yearly' },
  ];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'ru' ? 'Новый бюджет' : 'New Budget'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Category Selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Категория' : 'Category'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.filter((c) => c.id !== 'salary').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 rounded-xl text-center transition-all ${
                    category === cat.id
                      ? 'border-2 shadow-sm'
                      : 'bg-muted border-2 border-transparent'
                  }`}
                  style={
                    category === cat.id
                      ? { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40` }
                      : undefined
                  }
                >
                  <span className="text-lg block">{cat.icon}</span>
                  <span
                    className="text-[9px] font-medium block mt-0.5"
                    style={category === cat.id ? { color: cat.color } : undefined}
                  >
                    {language === 'ru' ? cat.labelRu : cat.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {language === 'ru' ? 'Сумма бюджета' : 'Budget Amount'}
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min={0}
              step={100}
              autoFocus
            />
          </div>

          {/* Period */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Период' : 'Period'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    period === p.id
                      ? 'border-2 shadow-sm'
                      : 'bg-muted text-muted-foreground border-2 border-transparent'
                  }`}
                  style={
                    period === p.id
                      ? { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` }
                      : undefined
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!amount || isCreating}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {isCreating
              ? language === 'ru' ? 'Создание...' : 'Creating...'
              : language === 'ru' ? 'Создать бюджет' : 'Create Budget'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
