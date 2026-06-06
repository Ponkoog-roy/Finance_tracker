const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { formatCurrency } from '@/lib/constants';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Loader2, Trash2, PlusCircle, CalendarDays } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Goals() {
  const [open, setOpen] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => db.entities.SavingsGoal.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.SavingsGoal.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); setOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.SavingsGoal.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); setAddFundsGoal(null); setAddAmount(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.SavingsGoal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const handleAddFunds = () => {
    if (!addFundsGoal || !addAmount) return;
    const newAmount = (addFundsGoal.current_amount || 0) + parseFloat(addAmount);
    const status = newAmount >= addFundsGoal.target_amount ? 'completed' : 'active';
    updateMutation.mutate({ id: addFundsGoal.id, data: { current_amount: newAmount, status } });
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Savings Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-xl"><Plus className="w-4 h-4" /> New Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Savings Goal</DialogTitle></DialogHeader>
            <GoalForm onSubmit={createMutation.mutate} isSubmitting={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={!!addFundsGoal} onOpenChange={v => !v && setAddFundsGoal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Funds to {addFundsGoal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={addAmount} onChange={e => setAddAmount(e.target.value)} className="rounded-xl" />
            </div>
            <Button onClick={handleAddFunds} className="w-full rounded-xl" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Funds
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No savings goals" description="Create a goal to start saving towards something you want" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal, i) => {
            const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
            const isCompleted = goal.status === 'completed' || pct >= 100;
            const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-card border rounded-2xl p-5",
                  isCompleted ? "border-success/30 bg-success/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold">{goal.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {goal.priority && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          goal.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                          goal.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {goal.priority}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                          Completed ✓
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => deleteMutation.mutate(goal.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">{formatCurrency(goal.current_amount || 0)}</span>
                    <span className="text-muted-foreground">{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="h-2.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% complete</span>
                    {daysLeft !== null && daysLeft > 0 && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> {daysLeft} days left
                      </span>
                    )}
                  </div>
                </div>

                {!isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl gap-1.5"
                    onClick={() => setAddFundsGoal(goal)}
                  >
                    <PlusCircle className="w-4 h-4" /> Add Funds
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoalForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: '', target_amount: '', deadline: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, target_amount: parseFloat(form.target_amount), current_amount: 0, status: 'active' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Goal Name</Label>
        <Input placeholder="e.g. Emergency Fund" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label>Target Amount</Label>
        <Input type="number" step="0.01" placeholder="0.00" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} className="rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label>Deadline</Label>
        <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create Goal
      </Button>
    </form>
  );
}