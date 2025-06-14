"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Send } from "lucide-react";
import { toast } from "sonner";

export default function TransactionList({ onRefresh }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [onRefresh]);

  const fetchTransactions = async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Error", {
        description: "Failed to fetch transactions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettleTransaction = async (transactionId) => {
    try {
      await api.settleTransaction(transactionId);
      toast.success("Success", {
        description: "Transaction settled successfully",
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error settling transaction:", error);
      toast.error("Error", {
        description: "Failed to settle transaction",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "settled":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Settled
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {transaction.description}
                    </CardTitle>
                    <CardDescription>
                      {transaction.type === "owe" ? "You owe" : "You are owed"}{" "}
                      {transaction.otherUser}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
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
                    {transaction.status === "pending" &&
                      transaction.type === "owe" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSettleTransaction(transaction.id)
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Settle
                        </Button>
                      )}
                    {transaction.status === "pending" &&
                      transaction.type === "owed" && (
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Request
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
