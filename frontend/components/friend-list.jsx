"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function FriendList({ onRefresh }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, [onRefresh]);

  const fetchFriends = async () => {
    try {
      const data = await api.getFriends();
      setFriends(data.friends || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Error", {
        description: "Failed to fetch friends",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading friends...</div>;
  }

  return (
    <div className="space-y-4">
      {friends.length === 0 ? (
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
          {friends.map((friend) => (
            <Card key={friend.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {friend.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{friend.name}</CardTitle>
                      <CardDescription>{friend.email}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Shared expenses: ${friend.sharedExpenses || 0}
                  </div>
                  <Button variant="outline" size="sm">
                    View Expenses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
