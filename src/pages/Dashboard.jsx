const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { format, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { formatCurrency } from '@/lib/constants';
import StatCard from '@/components/shared/StatCard';
import TransactionList from '@/components/transactions/TransactionList';
import EmptyState from '@/components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target,
  ArrowRight, Plus, ArrowUpDown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list('-date', 200),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => db.entities.Account.list(),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => db.entities.Budget.list(),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => db.entities.SavingsGoal.filter({ status: 'active' }),
  });

  if (loadingTx) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const monthlyTx = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
  const todayTx = transactions.filter(t => t.date === today);

  const monthIncome = monthlyTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const monthExpense = monthlyTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalBudget = budgets.reduce((s, b) => s + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const budgetUsage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const recentTx = transactions.slice(0, 10);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthIncome)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthExpense)}
          icon={TrendingDown}
          variant="destructive"
        />
        <StatCard
          title="Budget Usage"
          value={`${budgetUsage}%`}
          subtitle={totalBudget > 0 ? `${formatCurrency(totalSpent)} of ${formatCurrency(totalBudget)}` : 'No budgets set'}
          icon={PiggyBank}
          variant={budgetUsage > 90 ? 'destructive' : budgetUsage > 70 ? 'warning' : 'info'}
        />
      </div>

      {/* Today's Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <h3 className="font-display font-semibold text-base mb-4">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-success/5">
            <p className="text-xs text-muted-foreground mb-1">Income</p>
            <p className="text-lg font-bold text-success">{formatCurrency(todayIncome)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-destructive/5">
            <p className="text-xs text-muted-foreground mb-1">Expenses</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(todayExpense)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-info/5">
            <p className="text-xs text-muted-foreground mb-1">Net</p>
            <p className={`text-lg font-bold ${todayIncome - todayExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(todayIncome - todayExpense)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts & Goals */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DashboardCharts transactions={transactions} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base">Savings Goals</h3>
            <Link to="/goals" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {goals.length === 0 ? (
            <EmptyState icon={Target} title="No goals yet" description="Set savings goals to track your progress" actionLabel="Create Goal" actionPath="/goals" />
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 4).map(goal => {
                const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">{pct}%</p>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(goal.current_amount)}</span>
                      <span>{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base">Recent Transactions</h3>
          <Link to="/transactions">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <EmptyState icon={ArrowUpDown} title="No transactions" description="Add your first transaction to get started" actionLabel="Add Transaction" actionPath="/transactions/new" />
        ) : (
          <TransactionList transactions={recentTx} />
        )}
      </div>
    </div>
  );
}