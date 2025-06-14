"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import TransactionList from "@/components/transaction-list";
import { useState } from "react";

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage your payment transactions
            </p>
          </div>
        </div>
        <TransactionList onRefresh={refreshKey} />
      </div>
    </div>
  );
}
