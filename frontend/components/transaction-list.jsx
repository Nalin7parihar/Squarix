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
import { CheckCircle, Clock, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import TransactionSummaryDialog from "./transaction-summary-dialog";
import AddTransactionDialog from "./add-transaction-dialog";
import { useTransaction } from "@/lib/transaction-context";
export default function TransactionList({ onRefresh }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const { fetchTransactions, settleTransaction, requestPayment } =
    useTransaction();
  useEffect(() => {
    getTransactions();
  }, [onRefresh]);
  const getTransactions = async () => {
    try {
      const data = await fetchTransactions();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Error", {
        description: "Failed to fetch transactions",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSettleTransaction = async (transactionId, event) => {
    event.stopPropagation(); // Prevent card click
    try {
      const result = await settleTransaction(transactionId);
      if (result.success) {
        toast.success("Success", {
          description: "Transaction settled successfully",
        });
        getTransactions();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to settle transaction",
        });
      }
    } catch (error) {
      console.error("Error settling transaction:", error);
      toast.error("Error", {
        description: "Failed to settle transaction",
      });
    }
  };

  const handleRequestPayment = async (transactionId, event) => {
    event.stopPropagation(); // Prevent card click
    try {
      const result = await requestPayment(transactionId, {
        message: "Payment request sent",
      });
      if (result.success) {
        toast.success("Success", {
          description: "Payment request sent successfully",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to send payment request",
        });
      }
    } catch (error) {
      console.error("Error requesting payment:", error);
      toast.error("Error", {
        description: "Failed to send payment request",
      });
    }
  };

  const handleCardClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowSummaryDialog(true);
  };

  const handleTransactionUpdate = () => {
    getTransactions();
  };
  const getStatusBadge = (isSettled) => {
    if (isSettled) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Settled
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <AddTransactionDialog onTransactionAdded={getTransactions} />
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction) => (
            <Card
              key={transaction._id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => handleCardClick(transaction)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {transaction.description}
                    </CardTitle>
                    <CardDescription>
                      {transaction.type === "owe"
                        ? "You owe"
                        : "You are owed by "}{" "}
                      {transaction.otherUser}
                      <span className="block text-xs text-muted-foreground mt-1">
                        Category: {transaction.category}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.isSettled)}
                    <span className="text-lg font-semibold">
                      ${transaction.amount}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(transaction);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>{" "}
                    {/* Show settle button only when user receives a transaction (user owes money) */}
                    {!transaction.isSettled && transaction.type === "owe" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) =>
                          handleSettleTransaction(transaction._id, e)
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Settle
                      </Button>
                    )}
                    {/* Show request payment button when user is owed money and transaction is not settled */}
                    {!transaction.isSettled && transaction.type === "owed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) =>
                          handleRequestPayment(transaction._id, e)
                        }
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Request Payment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TransactionSummaryDialog
        isOpen={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        transaction={selectedTransaction}
        onTransactionUpdate={handleTransactionUpdate}
      />
    </div>
  );
}
