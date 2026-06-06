const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { formatCurrency, ACCOUNT_TYPES, getAccountTypeInfo } from '@/lib/constants';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Wallet, Trash2, Loader2, Building2, CreditCard, Smartphone, PiggyBank, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = { Wallet, Building2, CreditCard, Smartphone, PiggyBank, TrendingUp };

export default function Accounts() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => db.entities.Account.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Account.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); setOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Account.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Accounts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-xl"><Plus className="w-4 h-4" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
            <AccountForm onSubmit={createMutation.mutate} isSubmitting={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
        <p className="text-3xl font-display font-bold">{formatCurrency(totalBalance)}</p>
        <p className="text-xs text-muted-foreground mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {accounts.length === 0 ? (
        <EmptyState icon={Wallet} title="No accounts" description="Add your first account to start tracking" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {accounts.map((account, i) => {
            const typeInfo = getAccountTypeInfo(account.type);
            const Icon = iconMap[typeInfo.icon] || Wallet;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: typeInfo.color + '15' }}>
                      <Icon className="w-5 h-5" style={{ color: typeInfo.color }} />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{typeInfo.label}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => deleteMutation.mutate(account.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-2xl font-display font-bold mt-4">{formatCurrency(account.balance)}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AccountForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ name: '', type: 'bank', balance: '', currency: 'USD' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, balance: parseFloat(form.balance || '0'), is_active: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Account Name</Label>
        <Input placeholder="e.g. Main Bank Account" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl" required />
      </div>
      <div className="space-y-1.5">
        <Label>Account Type</Label>
        <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Initial Balance</Label>
        <Input type="number" step="0.01" placeholder="0.00" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} className="rounded-xl" />
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create Account
      </Button>
    </form>
  );
}