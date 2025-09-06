import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Balance, Goal, Transaction } from '@/types/transaction';
import { storage } from '@/lib/storage';
import { TrendingUp, TrendingDown, DollarSign, Target, Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: Balance;
  transactions: Transaction[];
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, transactions }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setGoals(storage.getGoals());
  }, []);

  const calculateGoalProgress = (goal: Goal): { current: number; percentage: number } => {
    const now = new Date();
    const relevantTransactions = transactions.filter(t => {
      const isInPeriod = t.date >= goal.startDate && t.date <= goal.endDate;
      const isExpense = t.type === 'expense';
      
      if (goal.categoryId) {
        return isInPeriod && isExpense && t.category.id === goal.categoryId;
      } else {
        return isInPeriod && isExpense;
      }
    });

    const current = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = Math.min((current / goal.targetAmount) * 100, 100);
    
    return { current, percentage };
  };

  const activeGoals = goals.filter(goal => {
    const now = new Date();
    return now >= goal.startDate && now <= goal.endDate;
  }).slice(0, 2); // Show max 2 goals in dashboard

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold opacity-90">Total Balance</h2>
            <Wallet className="h-5 w-5 opacity-90" />
          </div>
          
          <div className="mb-6">
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(balance.netBalance)}
            </p>
            <p className="text-sm opacity-75">Current balance</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium">Income</span>
              </div>
              <p className="text-lg font-semibold text-green-300">
                {formatCurrency(balance.totalIncome)}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-300" />
                <span className="text-sm font-medium">Expenses</span>
              </div>
              <p className="text-lg font-semibold text-red-300">
                {formatCurrency(balance.totalExpenses)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeGoals.map(goal => {
              const { current, percentage } = calculateGoalProgress(goal);
              const remaining = Math.max(0, goal.targetAmount - current);
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${current.toFixed(2)} spent</span>
                    <span>${remaining.toFixed(2)} left</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BalanceCard;