const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, eachMonthOfInterval, subDays } from 'date-fns';
import { formatCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryInfo } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#eab308', '#06b6d4', '#ef4444', '#14b8a6', '#6366f1', '#a855f7', '#6b7280'];

export default function Analytics() {
  const [period, setPeriod] = useState('month');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list('-date', 1000),
  });

  const filtered = useMemo(() => {
    const now = new Date();
    let start;
    if (period === 'week') start = startOfWeek(now);
    else if (period === 'month') start = startOfMonth(now);
    else if (period === 'year') start = subMonths(now, 12);
    else return transactions;
    return transactions.filter(t => new Date(t.date) >= start);
  }, [transactions, period]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + (t.amount || 0);
    });
    return Object.entries(map)
      .map(([cat, amt]) => {
        const info = getCategoryInfo('expense', cat);
        return { name: info.label, value: amt, category: cat, color: info.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Income by source
  const incomeBySource = useMemo(() => {
    const map = {};
    filtered.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + (t.amount || 0);
    });
    return Object.entries(map)
      .map(([cat, amt]) => {
        const info = getCategoryInfo('income', cat);
        return { name: info.label, value: amt, category: cat, color: info.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });
    return months.map(m => {
      const start = format(startOfMonth(m), 'yyyy-MM-dd');
      const end = format(endOfMonth(m), 'yyyy-MM-dd');
      const monthTx = transactions.filter(t => t.date >= start && t.date <= end);
      return {
        month: format(m, 'MMM'),
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0),
      };
    });
  }, [transactions]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold">Analytics</h1>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="week" className="rounded-lg text-xs">Week</TabsTrigger>
            <TabsTrigger value="month" className="rounded-lg text-xs">Month</TabsTrigger>
            <TabsTrigger value="year" className="rounded-lg text-xs">Year</TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-success/5 border border-success/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <p className="text-xl font-display font-bold text-success">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="text-xl font-display font-bold text-destructive">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-info/5 border border-info/20 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className={`text-xl font-display font-bold ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Monthly Trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-display font-semibold text-base mb-4">Monthly Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="income" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" radius={[6, 6, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Expense by Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-base mb-4">Expense by Category</h3>
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No expense data</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {expenseByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {expenseByCategory.slice(0, 6).map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Income by Source */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-semibold text-base mb-4">Income by Source</h3>
          {incomeBySource.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No income data</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeBySource} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                      {incomeBySource.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {incomeBySource.slice(0, 6).map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}