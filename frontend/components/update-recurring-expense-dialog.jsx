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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  Users,
  UserX,
} from "lucide-react";
import { useRecurringExpense } from "@/lib/recurring-expense-context";
import { useFriends } from "@/lib/friend-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const CATEGORIES = [
  "food",
  "transportation",
  "entertainment",
  "utilities",
  "healthcare",
  "shopping",
  "education",
  "travel",
  "other",
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function UpdateRecurringExpenseDialog({
  open,
  onOpenChange,
  expense,
  onUpdate,
}) {
  const { updateRecurringExpense } = useRecurringExpense();
  const { friends, fetchFriends } = useFriends();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    frequency: "",
    nextDueDate: "",
    autoAdd: false,
    participants: [],
  });

  // Initialize form data when expense changes
  useEffect(() => {
    if (expense && open) {
      setFormData({
        title: expense.title || "",
        amount: expense.amount?.toString() || "",
        category: expense.category || "",
        description: expense.description || "",
        frequency: expense.frequency || "",
        nextDueDate: expense.nextDueDate
          ? new Date(expense.nextDueDate).toISOString().split("T")[0]
          : "",
        autoAdd: expense.autoAdd || false,
        participants: expense.participants || [],
      });
    }
  }, [expense, open]);

  // Fetch friends when dialog opens
  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParticipantToggle = (friend) => {
    setFormData((prev) => {
      const isSelected = prev.participants.some(
        (p) => (p._id || p) === (friend._id || friend)
      );

      if (isSelected) {
        return {
          ...prev,
          participants: prev.participants.filter(
            (p) => (p._id || p) !== (friend._id || friend)
          ),
        };
      } else {
        return {
          ...prev,
          participants: [...prev.participants, friend._id],
        };
      }
    });
  };

  const handleRemoveParticipant = (participantId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter(
        (p) => (p._id || p) !== participantId
      ),
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title?.trim()) {
      errors.push("Title is required");
    }

    if (
      !formData.amount ||
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      errors.push("Amount must be a positive number");
    }

    if (!formData.category) {
      errors.push("Category is required");
    }

    if (!formData.frequency) {
      errors.push("Frequency is required");
    }

    if (!formData.nextDueDate) {
      errors.push("Next due date is required");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating recurring expense...");

    try {
      const updateData = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        frequency: formData.frequency,
        nextDueDate: formData.nextDueDate,
        autoAdd: formData.autoAdd,
        participants: formData.participants,
      };

      const result = await updateRecurringExpense(expense._id, updateData);

      if (result.success) {
        toast.success("Recurring expense updated successfully", {
          id: toastId,
        });
        onUpdate?.();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update recurring expense", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred while updating the recurring expense", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getParticipantName = (participant) => {
    if (typeof participant === "object") {
      return participant.name || participant.email || "Unknown";
    }
    // Find friend by ID
    const friend = friends.find((f) => f._id === participant);
    return friend ? friend.name : "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Recurring Expense
          </DialogTitle>
          <DialogDescription>
            Update the details of your recurring expense
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter expense title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">
                Frequency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => handleInputChange("frequency", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Next Due Date and Auto Add */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">
                Next Due Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) =>
                    handleInputChange("nextDueDate", e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="autoAdd"
                  checked={formData.autoAdd}
                  onCheckedChange={(checked) =>
                    handleInputChange("autoAdd", checked)
                  }
                />
                <Label htmlFor="autoAdd" className="text-sm font-normal">
                  Automatically add expenses when due
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Participants Section */}
          <div className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Label className="text-base font-medium">
                  Split with Friends (Optional)
                </Label>
              </div>
              {/* Current Participants */}
              {formData.participants.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Current participants:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.participants.map((participant, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {getParticipantName(participant)}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveParticipant(
                              participant._id || participant
                            )
                          }
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}{" "}
              {/* Available Friends */}
              {(user || friends.length > 0) && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Add friends to split this expense:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                    {/* Current User */}
                    {user && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`friend-${user.id}`}
                          checked={formData.participants.some(
                            (p) => (p._id || p) === user.id
                          )}
                          onCheckedChange={() =>
                            handleParticipantToggle({
                              _id: user.id,
                              name: user.name,
                            })
                          }
                        />
                        <Label
                          htmlFor={`friend-${user.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {user.name} (You)
                        </Label>
                      </div>
                    )}

                    {/* Friends */}
                    {friends.map((friend) => {
                      const isSelected = formData.participants.some(
                        (p) => (p._id || p) === friend._id
                      );
                      return (
                        <div
                          key={friend._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`friend-${friend._id}`}
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleParticipantToggle(friend)
                            }
                          />
                          <Label
                            htmlFor={`friend-${friend._id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {friend.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {friends.length === 0 && (
                <div className="text-sm text-muted-foreground italic">
                  No friends available. Add friends first to split expenses.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
