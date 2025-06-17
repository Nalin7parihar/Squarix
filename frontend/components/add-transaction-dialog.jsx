"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTransaction } from "@/lib/transaction-context";
import { useExpense } from "@/lib/expense-context";
import { useAuth } from "@/lib/auth-context";

export default function AddTransactionDialog({ onTransactionAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addTransaction } = useTransaction();
  const { expenses } = useExpense();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    receiverId: "",
    expenseId: "",
  });
  useEffect(() => {
    if (open) {
      // No need to fetch expenses - they're already available from context
      console.log("Available expenses from context:", expenses);
    } else {
      // Clear form state when dialog closes
      setFormData({
        amount: "",
        category: "",
        receiverId: "",
        expenseId: "",
      });
    }
  }, [open]);
  useEffect(() => {
    if (formData.expenseId) {
      autoFillReceiver();
    } else {
      // Reset receiver when expense changes
      setFormData((prev) => ({ ...prev, receiverId: "" }));
    }
  }, [formData.expenseId]);

  const autoFillReceiver = () => {
    const selectedExpense = expenses.find(
      (e) => e._id.toString() === formData.expenseId
    );

    console.log("Selected expense:", selectedExpense);
    console.log("Expense senderId:", selectedExpense?.senderId);

    if (
      selectedExpense &&
      selectedExpense.senderId &&
      selectedExpense.senderId._id
    ) {
      // Auto-fill receiver as the expense sender (the person who paid and is owed money)
      setFormData((prev) => ({
        ...prev,
        receiverId: selectedExpense.senderId._id.toString(),
        category: prev.category || selectedExpense.category, // Also auto-fill category from expense
      }));
    } else {
      console.log(
        "Could not auto-fill receiver - expense or senderId not found"
      );
      // Clear receiverId if expense sender is not available
      setFormData((prev) => ({
        ...prev,
        receiverId: "",
      }));
    }
  };
  const getReceiverName = () => {
    if (!formData.expenseId) {
      return "Select an expense first";
    }

    const selectedExpense = expenses.find(
      (e) => e._id.toString() === formData.expenseId
    );
    if (
      selectedExpense &&
      selectedExpense.senderId &&
      selectedExpense.senderId.name
    ) {
      return selectedExpense.senderId.name;
    }

    return "Loading...";
  };

  // Filter expenses to only show those where the current user owes money
  const getEligibleExpenses = () => {
    if (!user || !expenses) return [];

    return expenses.filter((expense) => {
      // Only show expenses where:
      // 1. Current user is NOT the sender (person who paid)
      // 2. Current user IS a participant (owes money)
      const isNotSender = expense.senderId._id !== user._id;
      const isParticipant = expense.participants.some(
        (participant) => participant.user._id === user._id
      );

      console.log(`Expense "${expense.title}":`, {
        isNotSender,
        isParticipant,
        shouldShow: isNotSender && isParticipant,
        senderId: expense.senderId._id,
        currentUserId: user._id,
        participants: expense.participants.map((p) => p.user._id),
      });

      return isNotSender && isParticipant;
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleDialogClose = () => {
    setOpen(false);
    // Form will be cleared by the useEffect when open becomes false
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    // The useEffect will handle clearing form when isOpen becomes false
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.receiverId || !formData.expenseId) {
      toast.error("Error", {
        description: "Please fill in all required fields",
      });
      return;
    }
    setLoading(true);
    try {
      const selectedExpense = expenses.find(
        (e) => e._id.toString() === formData.expenseId
      );
      const description = selectedExpense
        ? selectedExpense.title
        : "Transaction";

      const result = await addTransaction({
        amount: parseFloat(formData.amount),
        description: description,
        category: formData.category || selectedExpense?.category || "general",
        receiverId: formData.receiverId,
        expenseId: formData.expenseId,
      });

      if (result.success) {
        toast.success("Success", {
          description: "Transaction added successfully",
        });
        // Reset form
        setFormData({
          amount: "",
          category: "",
          receiverId: "",
          expenseId: "",
        });
        setOpen(false);
        onTransactionAdded?.();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to add transaction",
        });
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Error", {
        description: "Failed to add transaction",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {" "}
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction for an existing expense between you and a
            friend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense">Related Expense *</Label>
            <Select
              value={formData.expenseId}
              onValueChange={(value) => handleInputChange("expenseId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expense" />
              </SelectTrigger>{" "}
              <SelectContent>
                {getEligibleExpenses().map((expense) => (
                  <SelectItem key={expense._id} value={expense._id.toString()}>
                    {expense.title} - ${expense.amount}
                  </SelectItem>
                ))}
                {getEligibleExpenses().length === 0 && (
                  <SelectItem disabled value="no-expenses">
                    No expenses where you owe money
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="rent">Rent & Housing</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>{" "}
          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver (Auto-filled)</Label>
            <Input value={getReceiverName()} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              The receiver is automatically set to the person who paid for the
              expense.
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            {" "}
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
