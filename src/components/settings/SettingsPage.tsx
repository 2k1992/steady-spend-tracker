import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import GoalsManager from '@/components/goals/GoalsManager';
import { useTheme } from '@/components/providers/theme-provider';
import { Transaction } from '@/types/transaction';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Download, 
  Upload,
  FileText
} from 'lucide-react';

interface SettingsPageProps {
  transactions: Transaction[];
}

const SettingsPage: React.FC<SettingsPageProps> = ({ transactions }) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExportData = () => {
    try {
      const data = storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported successfully",
        description: "Your backup file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a backup file to import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = storage.importData(jsonData);
        
        toast({
          title: result.success ? "Import successful" : "Import failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        });

        if (result.success) {
          setImportFile(null);
          // Refresh the page to show imported data
          window.location.reload();
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format or corrupted file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(importFile);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Goals & Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsManager transactions={transactions} />
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getThemeIcon()}
                  <Label htmlFor="theme-light">Light Mode</Label>
                </div>
                <Switch
                  id="theme-light"
                  checked={theme === 'light'}
                  onCheckedChange={(checked) => checked && setTheme('light')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <Label htmlFor="theme-dark">Dark Mode</Label>
                </div>
                <Switch
                  id="theme-dark"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => checked && setTheme('dark')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <Label htmlFor="theme-system">System</Label>
                </div>
                <Switch
                  id="theme-system"
                  checked={theme === 'system'}
                  onCheckedChange={(checked) => checked && setTheme('system')}
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Management</h3>
            
            {/* Export Data */}
            <div className="space-y-2">
              <Label>Backup Data</Label>
              <p className="text-sm text-muted-foreground">
                Export all your transactions and categories as a JSON file
              </p>
              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Backup
              </Button>
            </div>

            {/* Import Data */}
            <div className="space-y-2">
              <Label htmlFor="import-file">Restore Data</Label>
              <p className="text-sm text-muted-foreground">
                Import a previously exported backup file
              </p>
              <div className="space-y-2">
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                <Button 
                  onClick={handleImportData} 
                  disabled={!importFile}
                  variant="outline" 
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Backup
                </Button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">About</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Expense Tracker v1.0</p>
              <p>Track your income, expenses, and lending activities</p>
              <p className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                All data is stored locally in your browser
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;