import React from 'react'
import Link from 'next/link'
import {  ArrowLeftRight, Bell, CreditCard, DollarSign, Home, Menu,  Search, Settings, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from './ui/button';

const Header = () => {
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
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
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
    <div className="ml-auto flex items-center gap-4">
      <form className="relative hidden md:flex">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search expenses..."
          className="w-64 rounded-lg bg-background pl-8 transition-all duration-200 focus:w-80"
        />
      </form>
      <Button variant="outline" size="icon" className="relative transition-all duration-200 hover:bg-primary/10">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-in zoom-in-50 duration-300">
          3
        </span>
        <span className="sr-only">Notifications</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full transition-transform duration-200 hover:scale-110"
      >
        <Avatar>
          
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <span className="sr-only">Profile</span>
      </Button>
    </div>
  </header>
  )
}
export default Header