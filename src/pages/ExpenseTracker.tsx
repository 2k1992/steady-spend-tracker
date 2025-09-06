import React, { useState, useEffect } from 'react';
import Navigation from '@/components/ui/navigation';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import { Transaction, Balance } from '@/types/transaction';
import { storage } from '@/lib/storage';
import SettingsPage from '@/components/settings/SettingsPage';

const ExpenseTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });

  const loadTransactions = () => {
    const loadedTransactions = storage.getTransactions();
    setTransactions(loadedTransactions);
    
    const totalIncome = loadedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = loadedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setBalance({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    });
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleTransactionUpdate = () => {
    loadTransactions();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <BalanceCard balance={balance} />
            <RecentTransactions 
              transactions={transactions}
              onViewAll={() => setActiveTab('transactions')}
            />
          </div>
        );
      
      case 'add':
        return (
          <AddTransactionForm onTransactionAdded={handleTransactionUpdate} />
        );
      
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions}
            onTransactionUpdate={handleTransactionUpdate}
          />
        );
      
      case 'settings':
        return <SettingsPage />;
      
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Expense Tracker</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-md mx-auto px-4 py-6 pb-24">
        {renderContent()}
      </main>

      {/* Navigation */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};

export default ExpenseTracker;