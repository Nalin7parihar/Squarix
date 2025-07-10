"use client";

import { useState, useEffect, useCallback } from "react";
import { useExpense } from "@/lib/expense-context";
import { useAuth } from "@/lib/auth-context"; // Import useAuth to get current user
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ExpenseSummaryDialog from "./expense-summary-dialog";

export default function ExpenseList() {
  const { expenses, loading, deleteExpense, fetchExpenses } = useExpense();
  const { user } = useAuth(); // Get current user to check if they're the sender
  const [searchTerm, setSearchTerm] = useState("");
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Separate loading state for the main list to avoid interference from summary dialog
  const [isMainListLoading, setIsMainListLoading] = useState(true);
  const [isSummaryOperationActive, setIsSummaryOperationActive] =
    useState(false);

  // Track when the context loading changes and determine if it's for main list or summary
  useEffect(() => {
    // If summary operation is active, don't update main list loading state
    if (!isSummaryOperationActive) {
      setIsMainListLoading(loading);
    }
    // If summary operation is active and context loading becomes false,
    // reset the summary operation flag
    else if (isSummaryOperationActive && !loading) {
      setIsSummaryOperationActive(false);
    }
  }, [loading, isSummaryOperationActive]);

  // Track when summary dialog operations start
  useEffect(() => {
    if (summaryDialogOpen && selectedExpense) {
      console.log(
        "ExpenseList: Summary dialog opened, marking summary operation as active"
      );
      setIsSummaryOperationActive(true);
    } else if (!summaryDialogOpen) {
      console.log("ExpenseList: Summary dialog closed");
      setTimeout(() => {
        setIsSummaryOperationActive(false);
      }, 100);
    }
  }, [summaryDialogOpen, selectedExpense]);

  // Helper function to check if current user is the sender of an expense
  const isCurrentUserSender = useCallback(
    (expense) => {
      if (!user || !expense) return false;

      // Handle both cases: senderId as string or as object with _id
      const expenseSenderId =
        typeof expense.senderId === "object"
          ? expense.senderId?._id
          : expense.senderId;

      const currentUserId = user.id || user._id;

      console.log("Checking sender:", {
        expenseSenderId,
        currentUserId,
        isSender: expenseSenderId === currentUserId,
      });

      return expenseSenderId === currentUserId;
    },
    [user]
  );

  // Helper function to get expense ID safely
  const getExpenseId = useCallback((expense) => {
    const id = expense._id || expense.id;
    console.log("Getting expense ID:", { expense: expense.title, id });
    return id;
  }, []);

  const handleShowSummary = useCallback(
    (expense) => {
      console.log(
        "ExpenseList: handleShowSummary called for expense:",
        expense?.title,
        "ID:",
        getExpenseId(expense)
      );
      setSelectedExpense(expense);
      setSummaryDialogOpen(true);
    },
    [getExpenseId]
  );

  const handleCloseSummary = useCallback(() => {
    console.log("ExpenseList: handleCloseSummary called");
    setSummaryDialogOpen(false);
    setSelectedExpense(null);
  }, []);

  const handleDeleteExpense = async (expense) => {
    const expenseId = getExpenseId(expense);
    const expenseTitle = expense.title || "Unknown Expense";

    if (!expenseId) {
      toast.error("Cannot delete expense: Invalid expense ID");
      console.error("Delete failed: No valid expense ID found", expense);
      return;
    }

    const toastId = toast.loading(`Deleting "${expenseTitle}"...`);
    try {
      const result = await deleteExpense(expenseId);
      if (result.success) {
        toast.success(`"${expenseTitle}" deleted successfully`, {
          id: toastId,
        });
      } else {
        toast.error(result.error || "Failed to delete expense", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred while deleting the expense.", {
        id: toastId,
      });
      console.error("Delete error:", error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing expenses...", { id: "refresh-toast" });
    try {
      const result = await fetchExpenses();
      if (result?.success) {
        toast.success("Expenses refreshed successfully", {
          id: "refresh-toast",
        });
      } else if (result?.error) {
        toast.error(result.error || "Failed to refresh expenses", {
          id: "refresh-toast",
        });
      } else {
        toast.info("Refresh attempt finished.", { id: "refresh-toast" });
      }
    } catch (error) {
      toast.error("Failed to refresh expenses.", { id: "refresh-toast" });
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter((expense) =>
    expense.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use the segregated loading state for main list display
  if (isMainListLoading && expenses.length === 0 && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses by title..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing || isMainListLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              isRefreshing || isMainListLoading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {filteredExpenses.length === 0 && !isMainListLoading ? (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No Expenses Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search."
              : "You haven't added any expenses yet."}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {" "}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => {
                const expenseId = getExpenseId(expense);
                const isSender = isCurrentUserSender(expense);
                return (
                  <TableRow key={expenseId || expense.title}>
                    <TableCell className="font-medium">
                      {expense.title}
                    </TableCell>
                    <TableCell>₹{expense.amount?.toFixed(2)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      {new Date(
                        expense.createdAt || expense.date
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isSender
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isSender ? "Sender" : "Participant"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Summary button - show for expenses with participants */}
                      {expense.participants &&
                        expense.participants.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShowSummary(expense)}
                            title="View Summary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      {isSender && expenseId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the expense &quot;
                                {expense.title}&quot; and all associated
                                transactions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteExpense(expense)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {/* Show message if user can't delete */}
                      {!isSender && (
                        <span className="text-xs text-muted-foreground">
                          Only sender can delete{" "}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedExpense && (
        <ExpenseSummaryDialog
          isOpen={summaryDialogOpen}
          onOpenChange={handleCloseSummary}
          expense={selectedExpense}
        />
      )}
    </div>
  );
}
