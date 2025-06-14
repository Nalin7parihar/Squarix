"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import ExpenseList from "@/components/expense-list";
import AddExpenseDialog from "@/components/add-expense-dialog";
import { useState } from "react";

export default function ExpensesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your expenses
            </p>
          </div>
          <AddExpenseDialog onExpenseAdded={handleExpenseAdded} />
        </div>
        <ExpenseList onRefresh={refreshKey} />
      </div>
    </div>
  );
}
