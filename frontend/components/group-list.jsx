"use client";

import { useState, useEffect } from "react";
import { useGroups } from "@/lib/group-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Settings, Eye } from "lucide-react";
import { toast } from "sonner";
import GroupDetailsDialog from "./group-details-dialog";
import GroupMemberDialog from "./group-member-dialog";
import GroupSettingsDialog from "./group-settings-dialog";

export default function GroupList({ onRefresh }) {
  const { groups, loading, error, fetchGroups, deleteGroup } = useGroups();

  useEffect(() => {
    if (onRefresh) {
      fetchGroups();
    }
  }, [onRefresh]);

  const handleDeleteGroup = async (groupId, groupName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${groupName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteGroup(groupId);
        toast.success("Success", {
          description: "Group deleted successfully",
        });
      } catch (error) {
        toast.error("Error", {
          description: error.message || "Failed to delete group",
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading groups...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading groups: {error}</p>
        <Button onClick={() => fetchGroups()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No groups found</p>
            <p className="text-sm text-muted-foreground">
              Create a group to start sharing expenses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {group.name}
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>{" "}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {group.members?.length || 0} members
                    </Badge>
                    <GroupMemberDialog group={group}>
                      <Button variant="outline" size="sm" title="Add Member">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </GroupMemberDialog>
                    <GroupSettingsDialog group={group}>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Group Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </GroupSettingsDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGroup(group._id, group.name)}
                      title="Delete Group"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created:{" "}
                    {group.createdAt
                      ? new Date(group.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <GroupDetailsDialog group={group}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </GroupDetailsDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
