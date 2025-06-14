"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import FriendList from "@/components/friend-list";
import AddFriendDialog from "@/components/add-friend-dialog";
import { useState } from "react";

export default function FriendsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFriendAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-muted-foreground">
              Manage your friends and shared expenses
            </p>
          </div>
          <AddFriendDialog onFriendAdded={handleFriendAdded} />
        </div>
        <FriendList onRefresh={refreshKey} />
      </div>
    </div>
  );
}
