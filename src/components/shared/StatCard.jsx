import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, className, variant = 'default' }) {
  const variants = {
    default: 'bg-card border border-border',
    primary: 'bg-primary/5 border border-primary/20',
    success: 'bg-success/5 border border-success/20',
    destructive: 'bg-destructive/5 border border-destructive/20',
    warning: 'bg-warning/5 border border-warning/20',
    info: 'bg-info/5 border border-info/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl p-5", variants[variant], className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-display font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
}