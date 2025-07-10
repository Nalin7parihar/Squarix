"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Tag,
  FileText,
  Edit,
  RefreshCw,
} from "lucide-react";
import { useRecurringExpense } from "@/lib/recurring-expense-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import UpdateRecurringExpenseDialog from "@/components/update-recurring-expense-dialog";

export default function RecurringExpenseSummaryDialog({
  open,
  onOpenChange,
  expense: initialExpense,
  onUpdate,
}) {
  const { getRecurringExpenseById } = useRecurringExpense();
  const { user } = useAuth();
  const [expense, setExpense] = useState(initialExpense);
  const [loading, setLoading] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // Fetch fresh data when dialog opens
  useEffect(() => {
    if (open && initialExpense?._id) {
      fetchExpenseDetails();
    }
  }, [open, initialExpense?._id]);
  const fetchExpenseDetails = async () => {
    if (!initialExpense?._id) return;

    setLoading(true);
    try {
      const result = await getRecurringExpenseById(initialExpense._id);
      if (result.success && result.data) {
        setExpense(result.data);
      } else {
        toast.error("Failed to load expense details");
      }
    } catch (error) {
      console.error("Error fetching expense details:", error);
      toast.error("Error loading expense details");
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNextDueDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusText = "";
    let statusColor = "";

    if (diffDays < 0) {
      statusText = `Overdue by ${Math.abs(diffDays)} days`;
      statusColor = "text-red-500";
    } else if (diffDays === 0) {
      statusText = "Due Today";
      statusColor = "text-orange-500";
    } else if (diffDays === 1) {
      statusText = "Due Tomorrow";
      statusColor = "text-yellow-500";
    } else if (diffDays <= 7) {
      statusText = `Due in ${diffDays} days`;
      statusColor = "text-yellow-600";
    } else {
      statusText = `Due in ${diffDays} days`;
      statusColor = "text-green-600";
    }

    return (
      <div className="space-y-1">
        <div>{formatDate(dateString)}</div>
        <div className={`text-sm font-medium ${statusColor}`}>{statusText}</div>
      </div>
    );
  };

  const isCurrentUserSender = () => {
    return (
      expense?.senderId?._id === user?._id || expense?.senderId === user?._id
    );
  };

  const handleEdit = () => {
    setShowUpdateDialog(true);
  };

  const handleUpdateComplete = () => {
    setShowUpdateDialog(false);
    fetchExpenseDetails(); // Refresh the data
    onUpdate?.();
  };

  if (!expense) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recurring Expense Details
            </DialogTitle>
            <DialogDescription>
              View details and manage your recurring expense
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{expense.title}</h3>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold text-primary">
                        ₹{expense.amount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getFrequencyBadge(expense.frequency)}
                    {expense.autoAdd && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-add enabled
                      </Badge>
                    )}
                    <Badge
                      variant={isCurrentUserSender() ? "default" : "secondary"}
                    >
                      {isCurrentUserSender() ? "You pay" : "Participant"}
                    </Badge>
                  </div>
                </div>

                {expense.description && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Description</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {expense.description}
                    </p>
                  </div>
                )}
              </div>
              <Separator />
              {/* Schedule Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Next Due Date</span>
                  </div>
                  <div className="pl-6">
                    {formatNextDueDate(expense.nextDueDate)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Frequency</span>
                  </div>
                  <div className="pl-6">
                    <span className="capitalize">{expense.frequency}</span>
                  </div>
                </div>
              </div>
              {/* Category and Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Category</span>
                  </div>
                  <div className="pl-6">
                    <Badge variant="outline" className="capitalize">
                      {expense.category}
                    </Badge>
                  </div>
                </div>

                {expense.groupId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Group</span>
                    </div>
                    <div className="pl-6">
                      <span className="text-sm">
                        {typeof expense.groupId === "object"
                          ? expense.groupId.name
                          : "Group expense"}
                      </span>
                    </div>
                  </div>
                )}
              </div>{" "}
              {/* Participants */}
              {expense.participants && expense.participants.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Participants ({expense.participants.length})
                    </span>
                  </div>
                  <div className="pl-6 space-y-2">
                    {" "}
                    {expense.participants.map((participant, index) => {
                      const userName =
                        participant.user?.name ||
                        participant.name ||
                        "Unknown User";
                      const userEmail =
                        participant.user?.email || participant.email;
                      const shareAmount = participant.share || 0;

                      return (
                        <div
                          key={
                            participant.user?._id || participant._id || index
                          }
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {userName}
                            </span>
                            {userEmail && (
                              <span className="text-xs text-muted-foreground">
                                {userEmail}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ₹{shareAmount.toFixed(2)}
                            </span>
                            {participant.isSettled && (
                              <Badge variant="outline" className="text-xs">
                                Settled
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Metadata */}
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created: {formatDate(expense.createdAt)}</div>
                {expense.updatedAt &&
                  expense.updatedAt !== expense.createdAt && (
                    <div>Updated: {formatDate(expense.updatedAt)}</div>
                  )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isCurrentUserSender() && (
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      {showUpdateDialog && (
        <UpdateRecurringExpenseDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          expense={expense}
          onUpdate={handleUpdateComplete}
        />
      )}
    </>
  );
}
