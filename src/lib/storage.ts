import { Transaction, Category } from '@/types/transaction';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense-tracker-transactions',
  CATEGORIES: 'expense-tracker-categories',
} as const;

export const storage = {
  // Transactions
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      
      const transactions = JSON.parse(data);
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  },

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  },

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      this.saveTransactions(transactions);
    }
  },

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    this.saveTransactions(filtered);
  },

  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) return getDefaultCategories();
      return JSON.parse(data);
    } catch {
      return getDefaultCategories();
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  },

  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  },

  // Backup and Restore
  exportData(): string {
    const transactions = this.getTransactions();
    const categories = this.getCategories();
    const data = {
      transactions,
      categories,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.transactions || !data.categories) {
        return { success: false, message: 'Invalid backup file format' };
      }

      // Validate and convert transactions
      const transactions = data.transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));

      this.saveTransactions(transactions);
      this.saveCategories(data.categories);
      
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import data. Please check the file format.' };
    }
  },
};

function getDefaultCategories(): Category[] {
  return [
    // Income categories
    { id: '1', name: 'Salary', icon: 'Briefcase', color: '#10b981', type: 'income' },
    { id: '2', name: 'Freelance', icon: 'Laptop', color: '#059669', type: 'income' },
    { id: '3', name: 'Investment', icon: 'TrendingUp', color: '#047857', type: 'income' },
    { id: '4', name: 'Other Income', icon: 'Plus', color: '#065f46', type: 'income' },
    
    // Expense categories
    { id: '5', name: 'Food', icon: 'Utensils', color: '#ef4444', type: 'expense' },
    { id: '6', name: 'Transport', icon: 'Car', color: '#dc2626', type: 'expense' },
    { id: '7', name: 'Entertainment', icon: 'Film', color: '#b91c1c', type: 'expense' },
    { id: '8', name: 'Shopping', icon: 'ShoppingBag', color: '#991b1b', type: 'expense' },
    { id: '9', name: 'Bills', icon: 'Receipt', color: '#7f1d1d', type: 'expense' },
    { id: '10', name: 'Health', icon: 'Heart', color: '#dc2626', type: 'expense' },
    { id: '11', name: 'Other Expense', icon: 'Minus', color: '#991b1b', type: 'expense' },
    
    // Lending categories
    { id: '12', name: 'Money Lent', icon: 'ArrowUpRight', color: '#f59e0b', type: 'lent' },
    { id: '13', name: 'Money Borrowed', icon: 'ArrowDownLeft', color: '#8b5cf6', type: 'borrowed' },
  ];
}