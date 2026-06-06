const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import TransactionList from '@/components/transactions/TransactionList';
import EmptyState from '@/components/shared/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ArrowUpDown, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { startOfWeek, startOfMonth, subMonths, format } from 'date-fns';

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list('-date', 500),
  });

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filtered = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchNote = tx.notes?.toLowerCase().includes(s);
      const matchCat = tx.category?.toLowerCase().includes(s);
      const matchAmount = String(tx.amount).includes(s);
      if (!matchNote && !matchCat && !matchAmount) return false;
    }
    if (dateFilter !== 'all') {
      const now = new Date();
      let start;
      if (dateFilter === 'this_week') start = startOfWeek(now);
      else if (dateFilter === 'this_month') start = startOfMonth(now);
      else if (dateFilter === 'last_month') start = subMonths(startOfMonth(now), 1);
      if (start && new Date(tx.date) < start) return false;
      if (dateFilter === 'last_month' && new Date(tx.date) >= startOfMonth(now)) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 rounded-xl" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Transactions</h1>
        <Link to="/transactions/new">
          <Button size="sm" className="gap-1.5 rounded-xl">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-32 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="No transactions found"
          description={search || typeFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first transaction to get started'}
          actionLabel="Add Transaction"
          actionPath="/transactions/new"
        />
      ) : (
        <TransactionList transactions={filtered} />
      )}
    </div>
  );
}