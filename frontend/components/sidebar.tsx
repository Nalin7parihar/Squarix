"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home,Users,ArrowLeftRight,CreditCard,Settings } from 'lucide-react'
const Sidebar = () => {
  const pathName = usePathname();
  return (
    <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg  px-3 py-2 ${pathName === '/' ? ' bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors duration-200  hover:bg-accent hover:text-accent-foreground`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/friends"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${pathName === '/friends' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors duration-200 hover:bg-accent hover:text-accent-foreground`}
            >
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </Link>
            <Link
              href="/activity"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${pathName === '/activity' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors duration-200 hover:bg-accent hover:text-accent-foreground`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Activity</span>
            </Link>
            <Link
              href="/settleUp"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${pathName === '/settleUp' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors duration-200 hover:bg-accent hover:text-accent-foreground`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Settle Up</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${pathName === '/settings' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'} transition-colors duration-200 hover:bg-accent hover:text-accent-foreground`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>
  )
}

export default Sidebar