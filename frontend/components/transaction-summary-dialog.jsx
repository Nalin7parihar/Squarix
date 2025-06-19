"use client";

import { useState } from "react";
import { useTransaction } from "@/lib/transaction-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Send,
  Edit,
  Trash2,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export default function TransactionSummaryDialog({
  isOpen,
  onOpenChange,
  transaction,
  onTransactionUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    description: "",
    note: "",
  });
  const { updateTransaction, settleTransaction, requestPayment } =
    useTransaction();
  const [loading, setLoading] = useState(false);

  const currentUserId = 1; // This should come from auth context
  const handleEdit = () => {
    setEditForm({
      description: transaction?.description || "",
      note: transaction?.note || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      const updateData = {
        description: editForm.description,
        note: editForm.note,
      }; // Update transaction using context
      const result = await updateTransaction(transaction.id, updateData);

      if (result.success) {
        toast.success("Success", {
          description: "Transaction updated successfully",
        });

        setIsEditing(false);
        onTransactionUpdate?.();
        onOpenChange(false);
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update transaction",
        });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Error", {
        description: "Failed to update transaction",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      setLoading(true);

      // TODO: Implement deleteTransaction endpoint in backend
      // await deleteTransaction(transaction.id);

      toast.error("Error", {
        description: "Delete functionality not implemented yet",
      });

      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Error", {
        description: "Failed to delete transaction",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      const result = await settleTransaction(transaction.id);

      if (result.success) {
        toast.success("Success", {
          description: "Transaction settled successfully",
        });

        onTransactionUpdate?.();
        onOpenChange(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      const result = await requestPayment(transaction.id, {
        message: `Payment request for: ${transaction.description}`,
      });

      if (result.success) {
        toast.success("Success", {
          description: "Payment request sent successfully",
        });

        onTransactionUpdate?.();
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
    } finally {
      setLoading(false);
    }
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
  if (!transaction) return null;

  const isUserOwed = transaction.type === "owed";
  const isUserOwes = transaction.type === "owe";
  const canSettle = !transaction.isSettled && isUserOwes;
  const canRequestPayment = !transaction.isSettled && isUserOwed;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edit transaction details"
                : "View transaction summary and manage payment"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Description
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Transaction description"
                  />
                ) : (
                  <p className="font-medium">{transaction.description}</p>
                )}
              </div>{" "}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Amount
                </Label>
                <p className="text-2xl font-bold text-primary">
                  ${transaction.amount}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {isUserOwed ? "Owes You" : "You Owe"}
                </Label>
                <p className="font-medium">{transaction.otherUser}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date
                </Label>
                <p>{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
            </div>{" "}
            {/* Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <div className="mt-1">
                  {getStatusBadge(transaction.isSettled)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {isUserOwed ? "You are owed money" : "You owe money"}
              </div>
            </div>
            {/* Note */}
            {(isEditing || transaction.note) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Note
                </Label>
                {isEditing ? (
                  <Textarea
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm({ ...editForm, note: e.target.value })
                    }
                    placeholder="Add a note (optional)"
                    rows={3}
                  />
                ) : transaction.note ? (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {transaction.note}
                  </p>
                ) : null}
              </div>
            )}
            <Separator />
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  {/* Primary Actions */}
                  <div className="flex gap-2">
                    {canSettle && (
                      <Button
                        onClick={handleSettle}
                        disabled={loading}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {loading ? "Settling..." : "Settle Payment"}
                      </Button>
                    )}
                    {canRequestPayment && (
                      <Button
                        onClick={handleRequestPayment}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? "Sending..." : "Request Payment"}
                      </Button>
                    )}
                  </div>{" "}
                  {/* Secondary Actions */}
                  {!transaction.isSettled && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleEdit}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={loading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
