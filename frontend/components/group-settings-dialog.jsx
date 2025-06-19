"use client";

import React, { useState } from "react";
import { useGroups } from "@/lib/group-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function GroupSettingsDialog({ group, children }) {
  const [open, setOpen] = useState(false);
  const { deleteGroup, loading } = useGroups();

  const handleDeleteGroup = async () => {
    const confirmMessage = `Are you sure you want to delete "${group.name}"?\n\nThis will permanently delete:\n- All group expenses\n- All group data\n- Remove all members\n\nThis action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteGroup(group._id);
        toast.success("Success", {
          description: "Group deleted successfully",
        });
        setOpen(false);
      } catch (error) {
        toast.error("Error", {
          description: error.message || "Failed to delete group",
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Group Settings - {group.name}
          </DialogTitle>
        </DialogHeader>{" "}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>{" "}
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total Members
                      </Label>
                      <p className="text-2xl font-bold">
                        {group.members?.length || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created Date
                      </Label>
                      <p className="text-sm">{formatDate(group.createdAt)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Group ID
                    </Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded border">
                      {group._id}
                    </p>
                  </div>

                  {group.updatedAt && group.updatedAt !== group.createdAt && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </Label>
                      <p className="text-sm">{formatDate(group.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 dark:text-red-100">
                        Delete Group
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Once you delete a group, there is no going back. Please
                        be certain. This will permanently delete:
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-300 mt-2 list-disc list-inside space-y-1">
                        <li>All group expenses and transactions</li>
                        <li>All group data and settings</li>
                        <li>Remove all members from the group</li>
                      </ul>
                      <Button
                        variant="destructive"
                        className="mt-3"
                        onClick={handleDeleteGroup}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {loading ? "Deleting..." : "Delete Group"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
