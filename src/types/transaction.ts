export type TransactionType = 'income' | 'expense' | 'lent' | 'borrowed';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: Date;
  note?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Balance {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  categoryId?: string; // undefined for overall goal
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate: Date;
}