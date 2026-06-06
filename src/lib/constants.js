export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed', color: '#f97316' },
  { value: 'transport', label: 'Transport', icon: 'Car', color: '#3b82f6' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#8b5cf6' },
  { value: 'rent', label: 'Rent', icon: 'Home', color: '#ec4899' },
  { value: 'utilities', label: 'Utility Bills', icon: 'Zap', color: '#eab308' },
  { value: 'education', label: 'Education', icon: 'GraduationCap', color: '#06b6d4' },
  { value: 'healthcare', label: 'Healthcare', icon: 'Heart', color: '#ef4444' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#a855f7' },
  { value: 'travel', label: 'Travel', icon: 'Plane', color: '#14b8a6' },
  { value: 'family', label: 'Family', icon: 'Users', color: '#f472b6' },
  { value: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard', color: '#6366f1' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
];

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { value: 'bonus', label: 'Bonus', icon: 'Gift', color: '#f59e0b' },
  { value: 'freelance', label: 'Freelance', icon: 'Laptop', color: '#8b5cf6' },
  { value: 'business', label: 'Business', icon: 'Building2', color: '#3b82f6' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#06b6d4' },
  { value: 'commission', label: 'Commission', icon: 'Percent', color: '#ec4899' },
  { value: 'rental', label: 'Rental Income', icon: 'Home', color: '#14b8a6' },
  { value: 'gifts', label: 'Gifts', icon: 'Gift', color: '#f472b6' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
];

export const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash Wallet', icon: 'Wallet', color: '#10b981' },
  { value: 'bank', label: 'Bank Account', icon: 'Building2', color: '#3b82f6' },
  { value: 'credit_card', label: 'Credit Card', icon: 'CreditCard', color: '#8b5cf6' },
  { value: 'mobile_banking', label: 'Mobile Banking', icon: 'Smartphone', color: '#f59e0b' },
  { value: 'savings', label: 'Savings', icon: 'PiggyBank', color: '#ec4899' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#06b6d4' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile Payment' },
  { value: 'check', label: 'Check' },
  { value: 'online', label: 'Online' },
];

export function getCategoryInfo(type, value) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(c => c.value === value) || { label: value, icon: 'Circle', color: '#6b7280' };
}

export function getAccountTypeInfo(value) {
  return ACCOUNT_TYPES.find(a => a.value === value) || { label: value, icon: 'Wallet', color: '#6b7280' };
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}