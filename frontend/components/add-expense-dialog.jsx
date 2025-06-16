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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useExpense } from "@/lib/expense-context";

export default function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState("none");
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const { addExpense } = useExpense();
  useEffect(() => {
    if (open) {
      fetchGroupsAndFriends();
    }
  }, [open]);

  const fetchGroupsAndFriends = async () => {
    try {
      const [groupsData, friendsData] = await Promise.all([
        api.getGroups(),
        api.getFriends(),
      ]);
      setGroups(groupsData.groups || []);
      setFriends(friendsData.friends || []);
    } catch (error) {
      console.error("Error fetching groups and friends:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const selectedFriends = formData.getAll("selectedFriends");
    const amount = Number.parseFloat(formData.get("amount"));

    // Prepare participants array based on split type
    let participants = [];
    if (splitType === "friends" && selectedFriends.length > 0) {
      const sharePerFriend = amount / (selectedFriends.length + 1); // +1 for the current user
      participants = selectedFriends.map((friendId) => ({
        user: friendId,
        share: sharePerFriend,
        isSettled: false,
      }));
    } else if (splitType === "group" && formData.get("selectedGroup")) {
      // For group expenses, you might want to fetch group members and split equally
      // For now, we'll let the backend handle this
      participants = [];
    }

    const expenseData = {
      title: formData.get("description"), // Backend expects 'title'
      amount: amount,
      category: formData.get("category"),
      participants: participants,
      groupId: splitType === "group" ? formData.get("selectedGroup") : null,
      receipt: formData.get("receipt"), // File object
    };

    try {
      const result = await addExpense(expenseData);

      if (result.success) {
        let successMessage = "Expense added successfully";
        if (splitType === "group") {
          const groupName = groups.find(
            (g) => g.id.toString() === formData.get("selectedGroup")
          )?.name;
          successMessage = `Expense added and split with ${groupName} group`;
        } else if (splitType === "friends" && selectedFriends.length > 0) {
          successMessage = `Expense added and split with ${selectedFriends.length} friend(s)`;
        }

        toast.success("Success", {
          description: successMessage,
        });

        setOpen(false);
        setSplitType("none");
        e.target.reset();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to add expense",
        });
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Error", {
        description: "Failed to add expense",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
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
          </div>

          {splitType === "group" && (
            <div className="space-y-2">
              <Label htmlFor="selectedGroup">Select Group</Label>
              <Select name="selectedGroup">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name} ({group.memberCount} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {splitType === "friends" && (
            <div className="space-y-2">
              <Label>Select Friends</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`friend-${friend.id}`}
                      name="selectedFriends"
                      value={friend.id}
                      className="rounded"
                    />
                    <Label
                      htmlFor={`friend-${friend.id}`}
                      className="text-sm flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={friend.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {friend.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {friend.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
