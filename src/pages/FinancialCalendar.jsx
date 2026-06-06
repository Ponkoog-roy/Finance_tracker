const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { formatCurrency, getCategoryInfo } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function FinancialCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.entities.Transaction.list('-date', 1000),
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const txByDate = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (!acc[tx.date]) acc[tx.date] = [];
      acc[tx.date].push(tx);
      return acc;
    }, {});
  }, [transactions]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedTx = selectedDateStr ? (txByDate[selectedDateStr] || []) : [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-display font-semibold min-w-[140px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTx = txByDate[dateStr] || [];
            const income = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
            const expense = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
            const net = income - expense;
            const hasActivity = dayTx.length > 0;
            const today = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all text-xs relative",
                  today && "ring-2 ring-primary",
                  hasActivity && net > 0 && "bg-success/10 hover:bg-success/20",
                  hasActivity && net < 0 && "bg-destructive/10 hover:bg-destructive/20",
                  hasActivity && net === 0 && "bg-info/10 hover:bg-info/20",
                  !hasActivity && "hover:bg-muted/50",
                  selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr && "ring-2 ring-primary bg-primary/10"
                )}
              >
                <span className={cn("font-medium", today && "text-primary")}>{format(day, 'd')}</span>
                {hasActivity && (
                  <div className="hidden sm:flex flex-col items-center gap-0.5 mt-0.5">
                    {income > 0 && <span className="text-[9px] text-success font-medium leading-none">+{income >= 1000 ? `${(income/1000).toFixed(1)}k` : income}</span>}
                    {expense > 0 && <span className="text-[9px] text-destructive font-medium leading-none">-{expense >= 1000 ? `${(expense/1000).toFixed(1)}k` : expense}</span>}
                  </div>
                )}
                {hasActivity && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full absolute bottom-1 sm:hidden",
                    net > 0 ? "bg-success" : net < 0 ? "bg-destructive" : "bg-info"
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-success/20" /> Profit
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-destructive/20" /> Loss
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-muted" /> No Activity
          </div>
        </div>
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={v => !v && setSelectedDate(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</DialogTitle>
          </DialogHeader>
          {selectedTx.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions on this day</p>
          ) : (
            <div className="space-y-2">
              {/* Day summary */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-xl bg-success/5">
                  <p className="text-[10px] text-muted-foreground">Income</p>
                  <p className="text-sm font-bold text-success">
                    {formatCurrency(selectedTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0))}
                  </p>
                </div>
                <div className="text-center p-2 rounded-xl bg-destructive/5">
                  <p className="text-[10px] text-muted-foreground">Expense</p>
                  <p className="text-sm font-bold text-destructive">
                    {formatCurrency(selectedTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0))}
                  </p>
                </div>
                <div className="text-center p-2 rounded-xl bg-info/5">
                  <p className="text-[10px] text-muted-foreground">Net</p>
                  <p className="text-sm font-bold">
                    {formatCurrency(
                      selectedTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) -
                      selectedTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
                    )}
                  </p>
                </div>
              </div>
              {selectedTx.map(tx => {
                const info = getCategoryInfo(tx.type, tx.category);
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <CategoryBadge type={tx.type} category={tx.category} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{info.label}</p>
                      {tx.notes && <p className="text-xs text-muted-foreground truncate">{tx.notes}</p>}
                    </div>
                    <p className={cn(
                      "text-sm font-semibold",
                      tx.type === 'income' ? 'text-success' : 'text-foreground'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}