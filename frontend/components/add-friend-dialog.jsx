"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AddFriendDialog({ onFriendAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const friendData = {
      email: formData.get("email"),
    };

    try {
      await api.addFriend(friendData);
      toast.success("Success", {
        description: "Friend added successfully",
      });
      setOpen(false);
      e.target.reset(); // Reset form
      if (onFriendAdded) onFriendAdded();
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Error", {
        description: "Failed to add friend",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Friend</DialogTitle>
          <DialogDescription>
            Add a friend by their email address to start sharing expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend's Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter friend's email"
              required
            />
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
              {loading ? "Adding..." : "Add Friend"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
