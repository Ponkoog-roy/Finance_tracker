const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { format, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency, EXPENSE_CATEGORIES } from '@/lib/constants';
import EmptyState from '@/components/shared/EmptyState';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, PiggyBank, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Budgets() {
  const [open, setOpen] = useState(false);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => db.entities.Budget.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list('-date', 500),
  });

  // Compute spent per category for current month
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd
  );

  const spentByCategory = monthExpenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + (tx.amount || 0);
    return acc;
  }, {});

  const currentBudgets = budgets.filter(b => b.month === currentMonth);
  const totalBudget = currentBudgets.reduce((s, b) => s + (b.amount || 0), 0);
  const totalSpent = currentBudgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Budget.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-xl"><Plus className="w-4 h-4" /> Add Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Budget</DialogTitle></DialogHeader>
            <BudgetForm onSubmit={createMutation.mutate} isSubmitting={createMutation.isPending} month={currentMonth} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Monthly Budget Overview</p>
          <p className="text-sm font-bold">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</p>
        </div>
        <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="h-3 rounded-full" />
        <p className="text-xs text-muted-foreground mt-2">
          {totalBudget > 0 ? `${formatCurrency(totalBudget - totalSpent)} remaining` : 'Set budgets to track spending'}
        </p>
      </div>

      {/* Budget Cards */}
      {currentBudgets.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No budgets" description="Create budgets to control your spending" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {currentBudgets.map((budget, i) => {
            const spent = spentByCategory[budget.category] || 0;
            const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
            const isOver = pct > 100;
            const isWarning = pct > 80 && !isOver;
            const catInfo = EXPENSE_CATEGORIES.find(c => c.value === budget.category);

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CategoryBadge type="expense" category={budget.category} size="md" />
                    <div>
                      <p className="font-medium text-sm">{catInfo?.label || budget.category}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(spent)} spent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {(isOver || isWarning) && (
                      <AlertTriangle className={cn("w-4 h-4", isOver ? "text-destructive" : "text-warning")} />
                    )}
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => deleteMutation.mutate(budget.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <Progress
                  value={Math.min(pct, 100)}
                  className={cn("h-2", isOver && "[&>div]:bg-destructive", isWarning && "[&>div]:bg-warning")}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{pct}% used</span>
                  <span>{formatCurrency(budget.amount)} limit</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BudgetForm({ onSubmit, isSubmitting, month }) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ category, amount: parseFloat(amount), month });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Budget Amount</Label>
        <Input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="rounded-xl" required />
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create Budget
      </Button>
    </form>
  );
}