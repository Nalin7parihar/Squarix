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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useExpense } from "@/lib/expense-context";
import { useRecurringExpense } from "@/lib/recurring-expense-context";
import { useGroups } from "@/lib/group-context";
import { useFriends } from "@/lib/friend-context";
import { useAuth } from "@/lib/auth-context";

export default function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState("none");
  const [isRecurring, setIsRecurring] = useState(false);
  const [friendShares, setFriendShares] = useState({});
  const [groupShares, setGroupShares] = useState({});
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const { addExpense } = useExpense();
  const { addRecurringExpense } = useRecurringExpense();
  const { groups, fetchGroups } = useGroups();
  const { friends, fetchFriends } = useFriends();
  const { user } = useAuth();
  useEffect(() => {
    if (open) {
      fetchGroupsAndFriends();
    }
  }, [open]);
  const fetchGroupsAndFriends = async () => {
    try {
      await Promise.all([fetchGroups(), fetchFriends()]);
    } catch (error) {
      console.error("Error fetching groups and friends:", error);
    }
  };

  // Helper function to calculate equal shares
  const calculateEqualShares = (amount, count) => {
    return count > 0 ? (amount / count).toFixed(2) : "0.00";
  };

  // Helper function to auto-fill equal shares for friends
  const autoFillFriendShares = (amount) => {
    if (selectedFriends.length > 0) {
      const sharePerFriend = calculateEqualShares(
        amount,
        selectedFriends.length
      );
      const newShares = {};
      selectedFriends.forEach((friendId) => {
        newShares[friendId] = sharePerFriend;
      });
      setFriendShares(newShares);
    }
  };
  // Helper function to auto-fill equal shares for group
  const autoFillGroupShares = (amount, groupId) => {
    const group = groups.find((g) => g._id === groupId);
    if (group && group.members) {
      const sharePerMember = calculateEqualShares(amount, group.members.length);
      const newShares = {};
      group.members.forEach((member) => {
        const memberId = member._id || member;
        newShares[memberId] = sharePerMember;
      });
      setGroupShares(newShares);
    }
  };

  // Handle friend selection change
  const handleFriendToggle = (friendId, checked, currentAmount) => {
    let newSelectedFriends;
    if (checked) {
      newSelectedFriends = [...selectedFriends, friendId];
    } else {
      newSelectedFriends = selectedFriends.filter((id) => id !== friendId);
      // Remove share for unselected friend
      const newShares = { ...friendShares };
      delete newShares[friendId];
      setFriendShares(newShares);
    }
    setSelectedFriends(newSelectedFriends);

    // Auto-fill shares if amount is available
    if (currentAmount && newSelectedFriends.length > 0) {
      const sharePerFriend = calculateEqualShares(
        currentAmount,
        newSelectedFriends.length
      );
      const newShares = {};
      newSelectedFriends.forEach((id) => {
        newShares[id] = sharePerFriend;
      });
      setFriendShares(newShares);
    }
  };

  // Handle group selection change
  const handleGroupChange = (groupId, currentAmount) => {
    setSelectedGroup(groupId);
    if (groupId && currentAmount) {
      autoFillGroupShares(currentAmount, groupId);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const amount = Number.parseFloat(formData.get("amount"));

    // Prepare participants array based on split type
    let participants = [];
    if (splitType === "friends" && selectedFriends.length > 0) {
      participants = selectedFriends.map((friendId) => ({
        user: friendId,
        share: parseFloat(friendShares[friendId] || 0),
        isSettled: false,
        transactionId: null,
      }));
    } else if (splitType === "group" && selectedGroup) {
      const group = groups.find((g) => g._id === selectedGroup);
      if (group && group.members) {
        participants = group.members.map((member) => {
          const memberId = member._id || member;
          return {
            user: memberId,
            share: parseFloat(groupShares[memberId] || 0),
            isSettled: false,
            transactionId: null,
          };
        });
      }
    }

    // Validate total shares
    if (participants.length > 0) {
      const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
      if (Math.abs(totalShares - amount) > 0.01) {
        // Allow small rounding differences
        toast.error("Error", {
          description: `Total shares (₹${totalShares.toFixed(
            2
          )}) must equal the expense amount (₹${amount.toFixed(2)})`,
        });
        setLoading(false);
        return;
      }
    }
    const baseExpenseData = {
      title: formData.get("description"), // Backend expects 'title'
      amount: amount,
      category: formData.get("category"),
      participants: participants,
      groupId: splitType === "group" ? selectedGroup : null,
      receipt: formData.get("receipt"), // File object
    };

    try {
      let result;
      let successMessage;
      if (isRecurring) {
        // Add recurring expense specific fields
        const recurringExpenseData = {
          ...baseExpenseData,
          frequency: formData.get("frequency"),
          nextDueDate: formData.get("nextDueDate"),
          autoAdd: formData.get("autoAdd") === "on" || false,
        };

        // Validate required recurring fields
        if (
          !recurringExpenseData.frequency ||
          !recurringExpenseData.nextDueDate
        ) {
          toast.error("Error", {
            description: "Please fill in all recurring expense fields",
          });
          setLoading(false);
          return;
        }

        result = await addRecurringExpense(recurringExpenseData);
        successMessage = "Recurring expense created successfully";
      } else {
        // Add regular expense
        result = await addExpense(baseExpenseData);
        successMessage = "Expense added successfully";
      }
      if (result.success) {
        if (splitType === "group") {
          const groupName = groups.find((g) => g._id === selectedGroup)?.name;
          successMessage += ` and split with ${groupName} group`;
        } else if (splitType === "friends" && selectedFriends.length > 0) {
          successMessage += ` and split with ${selectedFriends.length} friend(s)`;
        }

        toast.success("Success", {
          description: successMessage,
        });

        setOpen(false);
        setSplitType("none");
        setIsRecurring(false);
        setSelectedFriends([]);
        setSelectedGroup("");
        setFriendShares({});
        setGroupShares({});
        e.target.reset();
      } else {
        toast.error("Error", {
          description:
            result.error ||
            `Failed to add ${isRecurring ? "recurring " : ""}expense`,
        });
      }
    } catch (error) {
      console.error(
        `Error adding ${isRecurring ? "recurring " : ""}expense:`,
        error
      );
      toast.error("Error", {
        description: `Failed to add ${isRecurring ? "recurring " : ""}expense`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-expense-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to track your spending.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="What did you spend on?"
              required
            />
          </div>{" "}
          <div className="grid grid-cols-2 gap-4">
            {" "}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                onChange={(e) => {
                  const amount = parseFloat(e.target.value);
                  if (amount && !isNaN(amount)) {
                    if (splitType === "friends" && selectedFriends.length > 0) {
                      autoFillFriendShares(amount);
                    } else if (splitType === "group" && selectedGroup) {
                      autoFillGroupShares(amount, selectedGroup);
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Recurring Expense Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="isRecurring" className="text-sm font-medium">
              Make this a recurring expense
            </Label>
          </div>{" "}
          {/* Recurring Expense Fields */}
          {isRecurring && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50 dark:bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select name="frequency" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>{" "}
                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Next Due Date</Label>
                  <Input
                    id="nextDueDate"
                    name="nextDueDate"
                    type="date"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="autoAdd" name="autoAdd" />
                <Label htmlFor="autoAdd" className="text-sm">
                  Automatically add to expenses when due
                </Label>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="splitType">Split With</Label>
            <Select
              name="splitType"
              onValueChange={setSplitType}
              value={splitType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose how to split" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  No splitting (personal expense)
                </SelectItem>
                <SelectItem value="group">Split with a group</SelectItem>
                <SelectItem value="friends">Split with friends</SelectItem>
              </SelectContent>
            </Select>
          </div>{" "}
          {splitType === "group" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectedGroup">Select Group</Label>
                <Select
                  value={selectedGroup}
                  onValueChange={(value) => {
                    const currentAmount = document.querySelector(
                      'input[name="amount"]'
                    )?.value;
                    handleGroupChange(value, currentAmount);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name} ({group.members?.length || 0} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGroup && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Member Shares</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const amount = document.querySelector(
                          'input[name="amount"]'
                        )?.value;
                        if (amount)
                          autoFillGroupShares(
                            parseFloat(amount),
                            selectedGroup
                          );
                      }}
                    >
                      Split Equally
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                    {" "}
                    {groups
                      .find((g) => g._id === selectedGroup)
                      ?.members?.map((member) => {
                        // member is a populated user object with _id, name, email
                        const memberId = member._id || member;
                        const memberIdString = String(memberId);
                        const memberName =
                          member.name || `Member ${memberIdString.slice(-4)}`;
                        const memberAvatar = member.avatar;
                        const memberInitial = memberName
                          .charAt(0)
                          .toUpperCase();

                        return (
                          <div
                            key={memberIdString}
                            className="flex items-center justify-between space-x-2"
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={memberAvatar || "/placeholder.svg"}
                                />
                                <AvatarFallback className="text-xs">
                                  {memberInitial}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{memberName}</span>
                            </div>{" "}
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">₹</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="w-20 h-8"
                                value={groupShares[memberId] || ""}
                                onChange={(e) => {
                                  setGroupShares((prev) => ({
                                    ...prev,
                                    [memberId]: e.target.value,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}{" "}
          {splitType === "friends" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Select Friends</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const amount = document.querySelector(
                        'input[name="amount"]'
                      )?.value;
                      if (amount) autoFillFriendShares(parseFloat(amount));
                    }}
                  >
                    Split Equally
                  </Button>
                </div>{" "}
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                  {/* Current User */}
                  {user && (
                    <div key={user.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`friend-${user.id}`}
                          checked={selectedFriends.includes(user.id)}
                          onCheckedChange={(checked) => {
                            const currentAmount = document.querySelector(
                              'input[name="amount"]'
                            )?.value;
                            handleFriendToggle(user.id, checked, currentAmount);
                          }}
                        />
                        <Label
                          htmlFor={`friend-${user.id}`}
                          className="text-sm flex items-center gap-2 flex-1"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {user.name} (You)
                        </Label>
                      </div>

                      {selectedFriends.includes(user.id) && (
                        <div className="flex items-center space-x-2 ml-6">
                          <span className="text-sm">Share: ₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="w-24 h-8"
                            value={friendShares[user.id] || ""}
                            onChange={(e) => {
                              setFriendShares((prev) => ({
                                ...prev,
                                [user.id]: e.target.value,
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Separator between current user and friends */}
                  {user && friends.length > 0 && (
                    <div className="border-t my-2"></div>
                  )}

                  {/* Friends */}
                  {friends.map((friendDoc) => {
                    // friendDoc.friend contains the actual user data
                    const friend = friendDoc.friend || friendDoc;
                    const friendId = friend._id;
                    const friendName = friend.name || "Unknown Friend";
                    const friendAvatar = friend.avatar;

                    return (
                      <div key={friendId} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`friend-${friendId}`}
                            checked={selectedFriends.includes(friendId)}
                            onCheckedChange={(checked) => {
                              const currentAmount = document.querySelector(
                                'input[name="amount"]'
                              )?.value;
                              handleFriendToggle(
                                friendId,
                                checked,
                                currentAmount
                              );
                            }}
                          />
                          <Label
                            htmlFor={`friend-${friendId}`}
                            className="text-sm flex items-center gap-2 flex-1"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={friendAvatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="text-xs">
                                {friendName.charAt(0)?.toUpperCase() || "F"}
                              </AvatarFallback>
                            </Avatar>
                            {friendName}
                          </Label>
                        </div>

                        {selectedFriends.includes(friendId) && (
                          <div className="flex items-center space-x-2 ml-6">
                            <span className="text-sm">Share:₹</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="w-24 h-8"
                              value={friendShares[friendId] || ""}
                              onChange={(e) => {
                                setFriendShares((prev) => ({
                                  ...prev,
                                  [friendId]: e.target.value,
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}{" "}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (optional)</Label>
            <Input id="receipt" name="receipt" type="file" accept="image/*" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
