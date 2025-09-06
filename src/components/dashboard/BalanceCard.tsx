import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Balance } from '@/types/transaction';

interface BalanceCardProps {
  balance: Balance;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
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
  );
};

export default BalanceCard;