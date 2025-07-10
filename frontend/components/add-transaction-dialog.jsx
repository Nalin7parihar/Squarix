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
import { useFriends } from "@/lib/friend-context";
import { useAuth } from "@/lib/auth-context";

export default function AddTransactionDialog({ onTransactionAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addTransaction } = useTransaction();
  const { expenses, loading: expensesLoading } = useExpense();
  const { friends, loading: friendsLoading } = useFriends();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    receiverId: "",
    expenseId: "",
    transactionType: "payment", // "payment" or "request"
  });
  useEffect(() => {
    if (open) {
      // No need to fetch expenses - they're already available from context
    } else {
      // Clear form state when dialog closes
      setFormData({
        amount: "",
        category: "",
        receiverId: "",
        expenseId: "",
        transactionType: "payment",
      });
    }
  }, [open]);
  useEffect(() => {
    // Only run auto-fill logic if we have all required data
    if (
      formData.expenseId &&
      formData.transactionType === "payment" &&
      user?._id &&
      expenses &&
      !expensesLoading
    ) {
      autoFillReceiver();
      autoFillUserShare();
    } else {
      // Reset receiver and amount when expense changes or transaction type changes
      setFormData((prev) => ({ ...prev, receiverId: "", amount: "" }));
    }
  }, [
    formData.expenseId,
    formData.transactionType,
    user?._id,
    expenses,
    expensesLoading,
  ]);
  const autoFillReceiver = () => {
    const selectedExpense = expenses?.find((e) => e._id === formData.expenseId);

    console.log("Selected expense:", selectedExpense);
    console.log("Expense senderId:", selectedExpense?.senderId);

    if (selectedExpense?.senderId) {
      const senderId = selectedExpense.senderId._id || selectedExpense.senderId;
      if (senderId) {
        // Auto-fill receiver as the expense sender (the person who paid and is owed money)
        setFormData((prev) => ({
          ...prev,
          receiverId: senderId.toString(),
          category: prev.category || selectedExpense.category, // Also auto-fill category from expense
        }));
      }
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
  const autoFillUserShare = () => {
    const selectedExpense = expenses?.find((e) => e._id === formData.expenseId);

    if (selectedExpense && user?._id) {
      if (formData.transactionType === "payment") {
        // Find the current user's share in the expense participants
        const userParticipant = selectedExpense.participants?.find(
          (participant) => {
            if (!participant?.user) return false;
            const participantId = participant.user?._id || participant.user;
            return participantId?.toString() === user._id?.toString();
          }
        );

        console.log("User participant found:", userParticipant);

        if (userParticipant?.share) {
          // Auto-fill amount with user's share
          setFormData((prev) => ({
            ...prev,
            amount: userParticipant.share.toString(),
          }));
          console.log(
            `Auto-filled amount with user's share: ${userParticipant.share}`
          );
        } else {
          console.log("Could not find user's share in expense participants");
        }
      }
      // For request type, we don't auto-fill amount as the user can request any amount
    }
  }; // Get participants for request transactions (people who owe money for the expense)
  const getExpenseParticipants = () => {
    if (!formData.expenseId || formData.transactionType !== "request") {
      return [];
    }

    const selectedExpense = expenses?.find((e) => e._id === formData.expenseId);
    if (!selectedExpense?.participants) return [];

    console.log("Selected expense for participants:", selectedExpense);
    console.log("Participants:", selectedExpense.participants);

    // Return participants who haven't fully settled their share
    return (
      selectedExpense.participants?.filter(
        (participant) =>
          participant && !participant.isSettled && participant.user
      ) || []
    );
  };
  const getReceiverName = () => {
    if (!formData.expenseId) {
      return "Select an expense first";
    }

    const selectedExpense = expenses?.find(
      (e) => e._id.toString() === formData.expenseId
    );

    console.log("Selected expense for receiver name:", selectedExpense);

    if (selectedExpense?.senderId) {
      const senderName =
        selectedExpense.senderId.name || selectedExpense.senderId;
      console.log("Sender name:", senderName);
      return senderName || "Unknown sender";
    }

    return "Loading...";
  }; // Filter expenses based on transaction type
  const getEligibleExpenses = () => {
    // Add comprehensive checks for all required data
    if (!user?._id || !expenses || expenses.length === 0 || expensesLoading) {
      console.log("Data not ready:", {
        hasUser: !!user?._id,
        hasExpenses: !!expenses,
        expensesLength: expenses?.length || 0,
        expensesLoading,
      });
      return [];
    }

    console.log(
      "Filtering expenses for user:",
      user._id,
      "Transaction type:",
      formData.transactionType
    );
    console.log("Total expenses:", expenses.length);

    if (formData.transactionType === "payment") {
      // For payments: show expenses where current user owes money
      const eligibleExpenses = expenses.filter((expense) => {
        // Ensure expense has required properties
        if (!expense?.senderId || !expense?.participants) {
          console.log(
            `Expense "${expense?.title || "unknown"}" missing required data:`,
            expense
          );
          return false;
        }

        const senderId = expense.senderId?._id || expense.senderId;
        const isNotSender = senderId?.toString() !== user._id?.toString();
        const isParticipant = expense.participants?.some((participant) => {
          if (!participant?.user) return false;
          const participantId = participant.user?._id || participant.user;
          return participantId?.toString() === user._id?.toString();
        });

        console.log(`Expense "${expense.title}":`, {
          senderId: senderId,
          isNotSender,
          participants:
            expense.participants?.map((p) => p.user?._id || p.user) || [],
          isParticipant,
          eligible: isNotSender && isParticipant,
        });

        return isNotSender && isParticipant;
      });

      console.log("Eligible payment expenses:", eligibleExpenses.length);
      return eligibleExpenses;
    } else {
      // For requests: show expenses where current user is the sender (owed money)
      const eligibleExpenses = expenses.filter((expense) => {
        // Ensure expense has required properties
        if (!expense?.senderId) {
          console.log(
            `Expense "${expense?.title || "unknown"}" missing senderId:`,
            expense
          );
          return false;
        }

        const senderId = expense.senderId?._id || expense.senderId;
        const isSender = senderId?.toString() === user._id?.toString();
        console.log(
          `Expense "${expense.title}": senderId=${senderId}, userId=${user._id}, isSender=${isSender}`
        );
        return isSender;
      });

      console.log("Eligible request expenses:", eligibleExpenses.length);
      return eligibleExpenses;
    }
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

    // Different validation based on transaction type
    if (formData.transactionType === "payment") {
      if (!formData.amount || !formData.receiverId || !formData.expenseId) {
        toast.error("Error", {
          description: "Please fill in all required fields",
        });
        return;
      }
    } else {
      // For requests, expense is optional
      if (!formData.amount || !formData.receiverId) {
        toast.error("Error", {
          description: "Please fill in amount and select who owes you money",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const selectedExpense = expenses.find(
        (e) => e._id.toString() === formData.expenseId
      );

      let description;
      if (formData.transactionType === "payment") {
        description = selectedExpense ? selectedExpense.title : "Payment";
      } else {
        description = selectedExpense
          ? `Request for ${selectedExpense.title}`
          : "Money Request";
      }

      // For request transactions, the current user is the sender, receiverId becomes the person who owes money
      const transactionData = {
        amount: parseFloat(formData.amount),
        description: description,
        category: formData.category || selectedExpense?.category || "general",
      };

      if (formData.transactionType === "payment") {
        // User is paying someone (user is sender, selected person is receiver)
        transactionData.receiverId = formData.receiverId;
      } else {
        // User is requesting money (user is sender, selected person is receiver but they owe money)
        transactionData.receiverId = formData.receiverId;
      }

      if (formData.expenseId) {
        transactionData.expenseId = formData.expenseId;
      }

      const result = await addTransaction(transactionData);

      if (result.success) {
        toast.success("Success", {
          description:
            formData.transactionType === "payment"
              ? "Payment transaction added successfully"
              : "Money request sent successfully",
        });
        // Reset form
        setFormData({
          amount: "",
          category: "",
          receiverId: "",
          expenseId: "",
          transactionType: "payment",
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
      </DialogTrigger>{" "}
      <DialogContent className="sm:max-w-[425px]">
        {" "}
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Create a payment transaction or request money from a friend.
            Optionally link it to an existing expense.
          </DialogDescription>
        </DialogHeader>
        {/* Show loading state if data isn't ready */}
        {expensesLoading || friendsLoading || !user?._id ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {" "}
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={formData.transactionType}
                onValueChange={(value) =>
                  handleInputChange("transactionType", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">
                    Payment (I'm paying someone)
                  </SelectItem>
                  <SelectItem value="request">
                    Request (Someone owes me money)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount *{" "}
                {formData.expenseId &&
                  formData.transactionType === "payment" &&
                  "(Auto-filled with your share)"}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
              {formData.expenseId && formData.transactionType === "payment" && (
                <p className="text-xs text-muted-foreground">
                  Amount is automatically set to your share of the selected
                  expense. You can adjust it if needed.
                </p>
              )}
            </div>{" "}
            <div className="space-y-2">
              <Label htmlFor="expense">
                Related Expense{" "}
                {formData.transactionType === "payment" ? "*" : "(Optional)"}
              </Label>
              <Select
                value={formData.expenseId}
                onValueChange={(value) => handleInputChange("expenseId", value)}
                required={formData.transactionType === "payment"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense" />
                </SelectTrigger>{" "}
                <SelectContent>
                  {getEligibleExpenses().map((expense) => (
                    <SelectItem
                      key={expense._id}
                      value={expense._id.toString()}
                    >
                      {expense.title} - ₹{expense.amount}
                    </SelectItem>
                  ))}
                  {getEligibleExpenses().length === 0 && (
                    <SelectItem disabled value="no-expenses">
                      {formData.transactionType === "payment"
                        ? "No expenses where you owe money"
                        : "No expenses where you are owed money"}
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
              </Select>{" "}
            </div>{" "}
            <div className="space-y-2">
              <Label htmlFor="receiver">
                {formData.transactionType === "payment"
                  ? "Pay To"
                  : "Request From"}{" "}
                *
              </Label>
              {formData.expenseId && formData.transactionType === "payment" ? (
                // Auto-filled for expense payments
                <>
                  <Input
                    value={getReceiverName()}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically set to the person who paid for the expense.
                  </p>
                </>
              ) : (
                // Manual selection for requests or payments without expenses
                <Select
                  value={formData.receiverId}
                  onValueChange={(value) =>
                    handleInputChange("receiverId", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.transactionType === "payment"
                          ? "Select who you're paying"
                          : "Select who owes you money"
                      }
                    />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {formData.transactionType === "request" &&
                    formData.expenseId ? (
                      // Show expense participants for request transactions
                      getExpenseParticipants().length > 0 ? (
                        getExpenseParticipants()
                          .map((participant) => {
                            const userId =
                              participant.user?._id || participant.user;
                            const userName =
                              participant.user?.name || "Unknown User";
                            return userId ? (
                              <SelectItem key={userId} value={userId}>
                                {userName} (Owes: ₹{participant.share || 0})
                              </SelectItem>
                            ) : null;
                          })
                          .filter(Boolean)
                      ) : (
                        <SelectItem disabled value="no-participants">
                          All participants have settled their shares
                        </SelectItem>
                      )
                    ) : // Show friends for other cases
                    friends && friends.length > 0 ? (
                      friends.map((friend) => (
                        <SelectItem key={friend._id} value={friend._id}>
                          {friend.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="no-friends">
                        No friends added yet
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
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
              </Button>{" "}
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? "Processing..."
                  : formData.transactionType === "payment"
                  ? "Add Payment"
                  : "Send Request"}
              </Button>{" "}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
