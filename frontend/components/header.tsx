"use client";
import React from 'react'
import Link from 'next/link'
import {  ArrowLeftRight, CreditCard, DollarSign, Home, Menu, Settings, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts"; // Import useAuth
import { useRouter } from "next/navigation";


const Header = () => {
  const { user, logout, isLoading } = useAuth(); // Use the hook
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // Redirect handled within logout function in AuthContext
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm transition-all duration-200 md:px-6">
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <nav className="grid gap-6 text-lg font-medium">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-6 w-6" />
            <span>Squarix</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/friends"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Users className="h-5 w-5" />
            <span>Friends</span>
          </Link>
          <Link
            href="/activity"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>Activity</span>
          </Link>
          <Link
            href="/settleUp"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <CreditCard className="h-5 w-5" />
            <span>Settle Up</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
      <DollarSign className="h-6 w-6 text-primary" />
      <span>Squarix</span>
    </Link>
    
    {/* Quote display */}
    <div className="hidden md:flex items-center mx-auto">
      <p className="text-sm italic text-muted-foreground">
        "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make."
      </p>
    </div>
    
    <div className="ml-auto flex items-center gap-4">
      <div className="flex items-center space-x-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* Add AvatarImage if user has profile picture URL */}
                  {/* <AvatarImage src={user.profilePictureUrl} alt={user.name} /> */}
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                {isLoading ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  </header>
  )
}
export default Header