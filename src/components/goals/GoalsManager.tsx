import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Goal, Category, Transaction } from '@/types/transaction';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Edit, Trash2 } from 'lucide-react';

interface GoalsManagerProps {
  transactions: Transaction[];
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ transactions }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    targetAmount: string;
    categoryId: string;
    period: 'weekly' | 'monthly' | 'yearly';
  }>({
    name: '',
    targetAmount: '',
    categoryId: '',
    period: 'monthly',
  });

  useEffect(() => {
    loadGoals();
    setCategories(storage.getCategories());
  }, []);

  const loadGoals = () => {
    setGoals(storage.getGoals());
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      categoryId: '',
      period: 'monthly',
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate: Date;

    switch (formData.period) {
      case 'weekly':
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default: // monthly
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const goalData: Goal = {
      id: editingGoal?.id || `goal-${Date.now()}`,
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal?.currentAmount || 0,
      categoryId: formData.categoryId || undefined,
      period: formData.period,
      startDate: editingGoal?.startDate || startDate,
      endDate,
    };

    if (editingGoal) {
      storage.updateGoal(goalData.id, goalData);
      toast({ title: "Goal updated successfully" });
    } else {
      storage.addGoal(goalData);
      toast({ title: "Goal created successfully" });
    }

    loadGoals();
    setShowAddGoal(false);
    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      categoryId: goal.categoryId || '',
      period: goal.period,
    });
    setShowAddGoal(true);
  };

  const handleDelete = (id: string) => {
    storage.deleteGoal(id);
    loadGoals();
    toast({ title: "Goal deleted successfully" });
  };

  const calculateCurrentAmount = (goal: Goal): number => {
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

    return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-success';
    if (percentage <= 80) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Spending Goals
        </h3>
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setShowAddGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Food Budget"
                />
              </div>
              
              <div>
                <Label htmlFor="target-amount">Target Amount</Label>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All expenses (overall goal)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All expenses (overall goal)</SelectItem>
                    {categories.filter(c => c.type === 'expense').map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, period: value as 'weekly' | 'monthly' | 'yearly' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddGoal(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No spending goals set yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create goals to track your spending habits
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => {
            const currentAmount = calculateCurrentAmount(goal);
            const percentage = Math.min((currentAmount / goal.targetAmount) * 100, 100);
            const category = goal.categoryId ? categories.find(c => c.id === goal.categoryId) : null;
            
            return (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category ? category.name : 'Overall'} • {goal.period}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${currentAmount.toFixed(2)} spent</span>
                      <span>${goal.targetAmount.toFixed(2)} budget</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>${Math.max(0, goal.targetAmount - currentAmount).toFixed(2)} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsManager;