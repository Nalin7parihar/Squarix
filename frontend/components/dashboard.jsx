"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
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
  const [summary, setSummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchRecentActivity();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await api.getExpenseSummary();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [expensesData, transactionsData] = await Promise.all([
        api.getExpenses(),
        api.getTransactions(),
      ]);

      // Combine and sort recent activity
      const expenses = expensesData.expenses?.slice(0, 3) || [];
      const transactions = transactionsData.transactions?.slice(0, 2) || [];

      setRecentActivity([...expenses, ...transactions]);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
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
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary.totalExpenses || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">You Owe</CardTitle>
                <ArrowLeftRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  ${summary.youOwe || 0}
                </div>
                <p className="text-xs text-muted-foreground">Across 3 people</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  You're Owed
                </CardTitle>
                <ArrowLeftRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ${summary.youAreOwed || 0}
                </div>
                <p className="text-xs text-muted-foreground">From 2 people</p>
              </CardContent>
            </Card>
          </div>
        )}

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

          <Link href="/transactions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Track spending trends
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
              {recentActivity.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
