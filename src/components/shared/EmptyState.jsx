import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionPath }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground/50" />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && actionPath && (
        <Link to={actionPath} className="mt-4">
          <Button size="sm" className="rounded-xl">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}