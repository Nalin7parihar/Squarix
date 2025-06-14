"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import GroupList from "@/components/group-list";
import AddGroupDialog from "@/components/add-group-dialog";
import { useState } from "react";

export default function GroupsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGroupAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground">
              Manage your expense sharing groups
            </p>
          </div>
          <AddGroupDialog onGroupAdded={handleGroupAdded} />
        </div>
        <GroupList onRefresh={refreshKey} />
      </div>
    </div>
  );
}
