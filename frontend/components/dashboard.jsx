"use client";

import { useState, useEffect } from "react";
import { useExpense } from "@/lib/expense-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import ExpenseSummaryDialog from "@/components/expense-summary-dialog";
import RecurringExpenseList from "@/components/recurring-expense-list";
import AddExpenseDialog from "@/components/add-expense-dialog";
import {
  Receipt,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { expenses } = useExpense();
  const [recentActivity, setRecentActivity] = useState([]);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchRecentActivity();
  }, [expenses]);

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setSummaryDialogOpen(true);
  };

  const fetchRecentActivity = () => {
    // Get recent expenses from context (no API call needed)
    const recentExpenses = expenses.slice(0, 5) || [];
    setRecentActivity(recentExpenses);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        {" "}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <AddExpenseDialog />
          </div>
          <p className="text-muted-foreground">
            Overview of your expenses and financial activity
          </p>
        </div>
        {/* Recurring Expenses Section */}
        <div className="mb-8">
          <RecurringExpenseList />
        </div>
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                    onClick={() => handleExpenseClick(item)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">
                          {item.title || item.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.createdAt || item.date
                            ? new Date(
                                item.createdAt || item.date
                              ).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.amount}</p>
                      {item.category && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.category}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity</p>
                  <p className="text-sm">Start by adding your first expense!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Expense Summary Dialog */}
        <ExpenseSummaryDialog
          isOpen={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
          expense={selectedExpense}
        />
      </div>
    </div>
  );
}
