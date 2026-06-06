const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';

import { cn } from '@/lib/utils';

export default function TransactionForm({ accounts, onSubmit, initialData, isSubmitting }) {
  const [form, setForm] = useState(initialData || {
    type: 'expense',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    account_id: accounts?.[0]?.id || '',
    payment_method: 'cash',
    notes: '',
    receipt_url: '',
  });
  const [uploading, setUploading] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'type') setForm(prev => ({ ...prev, [field]: value, category: '' }));
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, receipt_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Tabs value={form.type} onValueChange={v => handleChange('type', v)} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-11 rounded-xl">
          <TabsTrigger value="expense" className="rounded-lg">Expense</TabsTrigger>
          <TabsTrigger value="income" className="rounded-lg">Income</TabsTrigger>
          <TabsTrigger value="transfer" className="rounded-lg">Transfer</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-1.5">
        <Label>Amount</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={e => handleChange('amount', e.target.value)}
          className="text-2xl h-14 font-display font-bold rounded-xl"
          required
        />
      </div>

      {form.type !== 'transfer' && (
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => handleChange('category', v)} required>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal rounded-xl">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.date ? format(new Date(form.date), 'MMM d, yyyy') : 'Pick date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.date ? new Date(form.date) : undefined}
                onSelect={d => handleChange('date', d ? format(d, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label>Account</Label>
          <Select value={form.account_id} onValueChange={v => handleChange('account_id', v)}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts?.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.type === 'transfer' && (
        <div className="space-y-1.5">
          <Label>To Account</Label>
          <Select value={form.to_account_id || ''} onValueChange={v => handleChange('to_account_id', v)}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Transfer to..." /></SelectTrigger>
            <SelectContent>
              {accounts?.filter(a => a.id !== form.account_id).map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Payment Method</Label>
        <Select value={form.payment_method} onValueChange={v => handleChange('payment_method', v)}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          placeholder="Add a note..."
          value={form.notes}
          onChange={e => handleChange('notes', e.target.value)}
          className="rounded-xl resize-none"
          rows={2}
        />
      </div>

      {form.type === 'expense' && (
        <div className="space-y-1.5">
          <Label>Receipt</Label>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="rounded-xl relative" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {form.receipt_url ? 'Change' : 'Upload'} Receipt
              <input type="file" accept="image/*" onChange={handleReceiptUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </Button>
            {form.receipt_url && <span className="text-xs text-success">Uploaded ✓</span>}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {initialData ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </form>
  );
}