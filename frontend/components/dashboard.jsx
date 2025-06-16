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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your expenses and financial activity
          </p>
        </div>{" "}
        {/* Expense Summary Dialog */}
        <ExpenseSummaryDialog
          isOpen={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
          expense={selectedExpense}
        />
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/expenses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Plus className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="font-medium">Add Expense</p>
                  <p className="text-sm text-muted-foreground">
                    Track new spending
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>{" "}
          <Link href="/expenses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="font-medium">View Expenses</p>
                  <p className="text-sm text-muted-foreground">
                    See all expenses
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/groups">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="font-medium">Create Group</p>
                  <p className="text-sm text-muted-foreground">
                    Share with friends
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/friends">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <UserPlus className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="font-medium">Add Friend</p>
                  <p className="text-sm text-muted-foreground">
                    Expand your network
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
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
          </CardContent>{" "}
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
