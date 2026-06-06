import React from 'react';
import { getCategoryInfo } from '@/lib/constants';
import {
  UtensilsCrossed, Car, ShoppingBag, Home, Zap, GraduationCap,
  Heart, Gamepad2, Plane, Users, CreditCard, MoreHorizontal,
  Briefcase, Gift, Laptop, Building2, TrendingUp, Percent, Circle, PiggyBank
} from 'lucide-react';

const iconMap = {
  UtensilsCrossed, Car, ShoppingBag, Home, Zap, GraduationCap,
  Heart, Gamepad2, Plane, Users, CreditCard, MoreHorizontal,
  Briefcase, Gift, Laptop, Building2, TrendingUp, Percent, Circle, PiggyBank,
};

export default function CategoryBadge({ type, category, size = 'sm' }) {
  const info = getCategoryInfo(type, category);
  const Icon = iconMap[info.icon] || Circle;
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: info.color + '15' }}
    >
      <Icon className={iconSizes[size]} style={{ color: info.color }} />
    </div>
  );
}