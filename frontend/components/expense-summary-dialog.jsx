"use client";

import { useState, useEffect } from "react";
import { useExpense } from "@/lib/expense-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt, ArrowLeftRight } from "lucide-react";

export default function ExpenseSummaryDialog({
  isOpen,
  onOpenChange,
  expense,
}) {
  const { getExpenseSummary } = useExpense();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (expenseData) => {
    if (!expenseData) return;

    try {
      setLoading(true);
      setSummary(null);

      // Prepare summary data for this specific expense only
      const summaryData = {
        amount: expenseData.amount,
        participants: expenseData.participants || [],
        senderId: expenseData.senderId,
      };

      console.log("Getting summary for specific expense:", expenseData.title);
      console.log("Participants count:", summaryData.participants.length);

      const result = await getExpenseSummary(summaryData);
      if (result.success) {
        setSummary(result.summary);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch summary when dialog opens and expense changes
  useEffect(() => {
    if (isOpen && expense) {
      fetchSummary(expense);
    }
  }, [isOpen, expense?._id]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? expense.title : "Expense Summary"}
          </DialogTitle>
          <DialogDescription>
            Breakdown of participants and their shares
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading summary...</p>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Sender Information */}
            {summary.senderName && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Paid By</h4>
                <p className="text-blue-800">{summary.senderName}</p>
                <p className="text-xs text-blue-600">{summary.senderEmail}</p>
              </div>
            )}
            {/* Summary Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${summary.totalAmount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Expense total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Amount Owed to {summary.senderName || "Sender"}
                  </CardTitle>
                  <ArrowLeftRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    ${summary.totalAmountOwedToSender || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total pending</p>
                </CardContent>
              </Card>
            </div>{" "}
            {/* Participants List */}
            <div>
              <h4 className="font-medium mb-3">
                Who Owes Money to {summary.senderName || "the Sender"}
              </h4>
              <div className="space-y-2">
                {summary.participants &&
                  summary.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {participant.userName || `Participant ${index + 1}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {participant.isSettled
                            ? "✅ Paid to " + (summary.senderName || "sender")
                            : "⏳ Owes " + (summary.senderName || "sender")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ${participant.share}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Share amount
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No summary data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
