"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRecurringExpense } from "@/lib/recurring-expense-context";
import { useAuth } from "@/lib/auth-context";

export default function RecurringExpenseList() {
  const {
    recurringExpenses,
    loading,
    fetchRecurringExpenses,
    deleteRecurringExpense,
  } = useRecurringExpense();
  const { user } = useAuth();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing recurring expenses...", { id: "refresh-toast" });
    try {
      const result = await fetchRecurringExpenses();
      if (result?.success) {
        toast.success("Recurring expenses refreshed successfully", {
          id: "refresh-toast",
        });
      } else if (result?.error) {
        toast.error(result.error || "Failed to refresh recurring expenses", {
          id: "refresh-toast",
        });
      }
    } catch (error) {
      toast.error("Failed to refresh recurring expenses.", {
        id: "refresh-toast",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (
      !window.confirm(`Are you sure you want to delete "${expense.title}"?`)
    ) {
      return;
    }

    const toastId = toast.loading(`Deleting "${expense.title}"...`);
    try {
      const result = await deleteRecurringExpense(expense._id);
      if (result.success) {
        toast.success(`"${expense.title}" deleted successfully`, {
          id: toastId,
        });
      } else {
        toast.error(result.error || "Failed to delete recurring expense", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred while deleting the recurring expense.", {
        id: toastId,
      });
      console.error("Delete error:", error);
    }
  };

  const handleShowSummary = (expense) => {
    setSelectedExpense(expense);
    setShowSummaryDialog(true);
  };

  const handleShowUpdate = (expense) => {
    setSelectedExpense(expense);
    setShowUpdateDialog(true);
  };

  const getFrequencyBadge = (frequency) => {
    const colors = {
      daily: "bg-blue-500",
      weekly: "bg-green-500",
      monthly: "bg-purple-500",
    };
    return (
      <Badge className={colors[frequency]}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  const formatNextDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-red-500">
          Overdue by {Math.abs(diffDays)} days
        </span>
      );
    } else if (diffDays === 0) {
      return <span className="text-orange-500">Due Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-yellow-500">Due Tomorrow</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600">Due in {diffDays} days</span>;
    } else {
      return <span className="text-green-600">Due in {diffDays} days</span>;
    }
  };

  const isCurrentUserSender = (expense) => {
    return expense.senderId._id === user?._id || expense.senderId === user?._id;
  };

  if (loading && recurringExpenses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">
          Loading recurring expenses...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recurring Expenses</h2>
          <p className="text-muted-foreground">
            Manage your automatic recurring payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing || loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isRefreshing || loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>{" "}
      {recurringExpenses.length === 0 && !loading ? (
        <Card className="p-12">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                Get Started with Recurring Expenses
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Set up automatic recurring payments to never miss a bill again.
                Create your first recurring expense to get started.
              </p>
            </div>
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => {
                // Trigger the Add Expense dialog
                document
                  .querySelector('[data-testid="add-expense-button"]')
                  ?.click();
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Recurring Expense
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringExpenses.map((expense) => (
            <Card
              key={expense._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{expense.title}</CardTitle>
                    <CardDescription className="mt-1">
                      ${expense.amount?.toFixed(2)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getFrequencyBadge(expense.frequency)}
                    {expense.autoAdd && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-add
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next Due:</span>
                    {formatNextDueDate(expense.nextDueDate)}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span className="capitalize">{expense.category}</span>
                  </div>

                  {expense.participants && expense.participants.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Split with {expense.participants.length} participant(s)
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isCurrentUserSender(expense)
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isCurrentUserSender(expense) ? "You pay" : "Participant"}
                    </span>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShowSummary(expense)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {isCurrentUserSender(expense) && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShowUpdate(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteExpense(expense)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Summary Dialog */}
      {selectedExpense && (
        <RecurringExpenseSummaryDialog
          open={showSummaryDialog}
          onOpenChange={setShowSummaryDialog}
          expense={selectedExpense}
        />
      )}
      {/* Update Dialog */}
      {selectedExpense && (
        <UpdateRecurringExpenseDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          expense={selectedExpense}
          onUpdate={() => {
            setSelectedExpense(null);
            setShowUpdateDialog(false);
          }}
        />
      )}
    </div>
  );
}
