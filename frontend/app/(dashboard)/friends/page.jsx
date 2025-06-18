"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import FriendList from "@/components/friend-list";
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Friends</h1>
          <p className="text-muted-foreground">
            Manage your friends and shared expenses
          </p>
        </div>
        <FriendList onRefresh={refreshKey} onFriendAdded={handleFriendAdded} />
      </div>
    </div>
  );
}
