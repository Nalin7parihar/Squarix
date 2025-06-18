"use client";

import { useState, useEffect } from "react";
import { useFriends } from "@/lib/friend-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Trash2,
  Eye,
  RefreshCw,
  Receipt,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function FriendList({ onRefresh, onFriendAdded }) {
  const {
    friends,
    loading,
    fetchFriends,
    deleteFriend,
    getFriendExpenses,
    addFriend,
  } = useFriends();
  const [friendExpenses, setFriendExpenses] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [expensesDialogOpen, setExpensesDialogOpen] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  useEffect(() => {
    // Fetch friends on component mount
    fetchFriends();
  }, []);

  useEffect(() => {
    // Fetch friends when onRefresh prop changes
    if (onRefresh) {
      fetchFriends();
    }
  }, [onRefresh]);

  const handleRefresh = async () => {
    try {
      const result = await fetchFriends();
      if (result.success) {
        toast.success("Success", {
          description: "Friends list refreshed",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to refresh friends",
        });
      }
    } catch (error) {
      console.error("Error refreshing friends:", error);
      toast.error("Error", {
        description: "Failed to refresh friends",
      });
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail.trim()) {
      toast.error("Error", {
        description: "Please enter a friend's email address",
      });
      return;
    }

    try {
      setAddFriendLoading(true);
      const result = await addFriend({ email: friendEmail.trim() });
      if (result.success) {
        toast.success("Success", {
          description: "Friend added successfully",
        });
        setFriendEmail("");
        setAddFriendDialogOpen(false);
        // Call the onFriendAdded callback if provided
        if (onFriendAdded) {
          onFriendAdded();
        }
      } else {
        toast.error("Error", {
          description: result.error || "Failed to add friend",
        });
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Error", {
        description: "Failed to add friend",
      });
    } finally {
      setAddFriendLoading(false);
    }
  };

  const handleDeleteFriend = async (friendId, friendName) => {
    if (
      !confirm(
        `Are you sure you want to remove ${friendName} from your friends?`
      )
    ) {
      return;
    }

    try {
      const result = await deleteFriend(friendId);
      if (result.success) {
        toast.success("Success", {
          description: "Friend removed successfully",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to remove friend",
        });
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Error", {
        description: "Failed to remove friend",
      });
    }
  };
  const handleViewExpenses = async (friendId, friendName) => {
    try {
      setExpensesLoading(true);
      setSelectedFriend({ id: friendId, name: friendName });
      setExpensesDialogOpen(true);

      const result = await getFriendExpenses(friendId);
      if (result.success) {
        setFriendExpenses((prev) => ({ ...prev, [friendId]: result.expenses }));
        toast.success("Success", {
          description: `Loaded expenses with ${friendName}`,
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to fetch friend expenses",
        });
        setExpensesDialogOpen(false);
      }
    } catch (error) {
      console.error("Error fetching friend expenses:", error);
      toast.error("Error", {
        description: "Failed to fetch friend expenses",
      });
      setExpensesDialogOpen(false);
    } finally {
      setExpensesLoading(false);
    }
  };
  if (loading) {
    return <div className="text-center py-8">Loading friends...</div>;
  }

  // Ensure friends is always an array
  const friendsArray = Array.isArray(friends) ? friends : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Friends</h2>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setAddFriendDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>
      {!friendsArray || friendsArray.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No friends added yet</p>
            <p className="text-sm text-muted-foreground">
              Add friends to start sharing expenses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {friendsArray.map((friendRelation) => (
            <Card key={friendRelation._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          friendRelation.friend?.avatar || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        {friendRelation.friend?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {friendRelation.friend?.name || "Unknown"}
                      </CardTitle>
                      <CardDescription>
                        {friendRelation.friend?.email || "No email"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDeleteFriend(
                        friendRelation._id,
                        friendRelation.friend?.name || "Unknown"
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Transactions: {friendRelation.transactions?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Friends since:{" "}
                      {new Date(friendRelation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleViewExpenses(
                        friendRelation.friend?._id,
                        friendRelation.friend?.name || "Unknown"
                      )
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Expenses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}{" "}
        </div>
      )}
      {/* Add Friend Dialog */}
      <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Friend</DialogTitle>
            <DialogDescription>
              Enter your friend's email address to add them to your friends list
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddFriend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="friendEmail">Friend's Email</Label>
              <Input
                id="friendEmail"
                type="email"
                placeholder="friend@example.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddFriendDialogOpen(false);
                  setFriendEmail("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addFriendLoading}
                className="flex-1"
              >
                {addFriendLoading ? "Adding..." : "Add Friend"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Friend Expenses Dialog */}
      <Dialog open={expensesDialogOpen} onOpenChange={setExpensesDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Expenses with {selectedFriend?.name || "Friend"}
            </DialogTitle>
            <DialogDescription>
              Shared expenses and transactions with this friend
            </DialogDescription>
          </DialogHeader>

          {expensesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading expenses...</p>
            </div>
          ) : selectedFriend && friendExpenses[selectedFriend.id] ? (
            <div className="space-y-4">
              {friendExpenses[selectedFriend.id].length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No shared expenses found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start adding expenses with {selectedFriend.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friendExpenses[selectedFriend.id].map((expense) => (
                    <Card key={expense._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <Receipt className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{expense.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {expense.category}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    expense.date || expense.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              ${expense.amount}
                            </p>
                            <Badge
                              variant={
                                expense.isGroupExpense ? "secondary" : "default"
                              }
                              className="text-xs"
                            >
                              {expense.isGroupExpense ? "Group" : "Personal"}
                            </Badge>
                          </div>
                        </div>

                        {expense.participants &&
                          expense.participants.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground mb-2">
                                Participants:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {" "}
                                {expense.participants.map(
                                  (participant, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {participant.user?.name ||
                                        `Participant ${index + 1}`}
                                      {participant.share !== undefined &&
                                        participant.share !== null &&
                                        ` - $${participant.share}`}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
