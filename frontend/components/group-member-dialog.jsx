"use client";

import React, { useState, useEffect } from "react";
import { useGroups } from "@/lib/group-context";
import { useFriends } from "@/lib/friend-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Check,
  X,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function GroupMemberDialog({ group, children }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addMemberToGroup, removeMemberFromGroup, loading } = useGroups();
  const { friends, fetchFriends } = useFriends();

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  const handleAddMember = async (memberId) => {
    try {
      await addMemberToGroup(group._id, memberId);
      toast.success("Success", {
        description: "Member added to group successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: error.message || "Failed to add member",
      });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this member from the group?"
      )
    ) {
      try {
        await removeMemberFromGroup(group._id, memberId);
        toast.success("Success", {
          description: "Member removed from group successfully",
        });
      } catch (error) {
        toast.error("Error", {
          description: error.message || "Failed to remove member",
        });
      }
    }
  };

  const isUserInGroup = (userId) => {
    return group?.members?.some((member) => member._id === userId);
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMembers = group?.members || [];

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Group Members - {group.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Members</TabsTrigger>
            <TabsTrigger value="current">Current Members</TabsTrigger>
          </TabsList>

          {/* Add Members Tab */}
          <TabsContent value="add" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Friends</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Available Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No friends found</p>
                    <p className="text-sm">
                      {searchQuery
                        ? "Try a different search term"
                        : "Add some friends first"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {" "}
                    {filteredFriends.map((friendDoc) => {
                      const friend = friendDoc.friend || friendDoc;
                      const friendId = friend._id;
                      const friendName = friend.name || "Unknown Friend";
                      const friendEmail = friend.email || "No email";

                      return (
                        <div
                          key={friendDoc._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(friendName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{friendName}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {friendEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUserInGroup(friendId) ? (
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                In Group
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAddMember(friendId)}
                                disabled={loading}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Members Tab */}
          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Current Members ({currentMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No members in this group</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member._id === group.createdBy ? (
                            <Badge variant="default">Admin</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member._id)}
                              disabled={loading}
                              className="text-red-500 hover:text-red-700"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
