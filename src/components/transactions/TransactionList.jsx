import React from 'react';
import { format } from 'date-fns';
import { formatCurrency, getCategoryInfo } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function TransactionList({ transactions, onSelect }) {
  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const key = tx.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <div key={date}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {format(new Date(date), 'EEEE, MMM d, yyyy')}
            </p>
            <DaySummary transactions={grouped[date]} />
          </div>
          <div className="space-y-1.5">
            {grouped[date].map((tx, i) => (
              <TransactionItem key={tx.id} tx={tx} index={i} onClick={() => onSelect?.(tx)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DaySummary({ transactions }) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  return (
    <div className="flex items-center gap-3 text-xs">
      {income > 0 && <span className="text-success font-medium">+{formatCurrency(income)}</span>}
      {expense > 0 && <span className="text-destructive font-medium">-{formatCurrency(expense)}</span>}
    </div>
  );
}

function TransactionItem({ tx, index, onClick }) {
  const info = getCategoryInfo(tx.type, tx.category);
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
    >
      <CategoryBadge type={tx.type} category={tx.category} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{info.label}</p>
        {tx.notes && <p className="text-xs text-muted-foreground truncate">{tx.notes}</p>}
      </div>
      <div className="text-right">
        <p className={cn(
          "text-sm font-semibold tabular-nums",
          isIncome ? 'text-success' : isTransfer ? 'text-info' : 'text-foreground'
        )}>
          {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount)}
        </p>
        {tx.payment_method && (
          <p className="text-xs text-muted-foreground capitalize">{tx.payment_method.replace('_', ' ')}</p>
        )}
      </div>
    </motion.div>
  );
}