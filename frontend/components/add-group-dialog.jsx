"use client";

import { useState, useEffect } from "react";
import { useGroups } from "@/lib/group-context";
import { useFriends } from "@/lib/friend-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

export default function AddGroupDialog({ onGroupAdded }) {
  const [open, setOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { createGroup, loading } = useGroups();
  const { friends, fetchFriends } = useFriends();

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const handleMemberToggle = (friendId, checked) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, friendId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== friendId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const groupData = {
      name: formData.get("name"),
      description: formData.get("description"),
      members: selectedMembers, // Include selected friend IDs
    };
    try {
      const result = await createGroup(groupData);
      if (result.success) {
        toast.success("Success", {
          description: "Group created successfully",
        });
        setOpen(false);
        setSelectedMembers([]);
        e.target.reset();
        if (onGroupAdded) onGroupAdded();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to create group",
        });
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Error", {
        description: error.message || "Failed to create group",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to share expenses with friends.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter group name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What's this group for?"
              rows={3}
            />
          </div>

          {/* Friends Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Friends to Add to Group
            </Label>
            {friends.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No friends available</p>
                <p className="text-sm">
                  Add some friends first to create groups
                </p>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {friends.map((friendDoc) => {
                  const friend = friendDoc.friend || friendDoc;
                  const friendId = friend._id;
                  const friendName = friend.name || "Unknown Friend";
                  const friendAvatar = friend.avatar;

                  return (
                    <div key={friendId} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-${friendId}`}
                        checked={selectedMembers.includes(friendId)}
                        onCheckedChange={(checked) =>
                          handleMemberToggle(friendId, checked)
                        }
                      />
                      <Label
                        htmlFor={`member-${friendId}`}
                        className="text-sm flex items-center gap-2 flex-1 cursor-pointer"
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
                  );
                })}
              </div>
            )}
            {selectedMembers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected {selectedMembers.length} friend
                {selectedMembers.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedMembers([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
