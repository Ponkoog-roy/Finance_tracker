import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

export default function DashboardCharts({ transactions }) {
  const chartData = useMemo(() => {
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayTx = transactions.filter(t => t.date === date);
      const income = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
      const expense = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
      last30.push({
        date,
        label: format(subDays(new Date(), i), 'MMM d'),
        income,
        expense,
      });
    }
    return last30;
  }, [transactions]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-display font-semibold text-base mb-4">30-Day Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Area type="monotone" dataKey="income" stroke="hsl(160, 84%, 39%)" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
            <Area type="monotone" dataKey="expense" stroke="hsl(0, 72%, 51%)" fill="url(#expenseGrad)" strokeWidth={2} name="Expense" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}