'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import  Sidebar  from '@/components/sidebar';
import  Header  from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and user is not authenticated, redirect to auth page
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <main className="flex-1 p-6">
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  // If authenticated, render the layout with sidebar, header, and children
  if (isAuthenticated && user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback (should ideally not be reached if logic is correct)
  return null;
}