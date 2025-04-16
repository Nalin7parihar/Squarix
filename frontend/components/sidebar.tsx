import React from 'react'
import Link from 'next/link'
import { Home,Users,ArrowLeftRight,CreditCard,Settings } from 'lucide-react'
const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/friends"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </Link>
            <Link
              href="/activity"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Activity</span>
            </Link>
            <Link
              href="/settleUp"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              <CreditCard className="h-4 w-4" />
              <span>Settle Up</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>
  )
}

export default Sidebar