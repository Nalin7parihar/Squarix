"use client"

import { useState, useEffect } from "react" // Keep useEffect for potential client-side only logic if needed later
import { ArrowLeftRight, LogOut, Plus, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseList } from "./expense-list"
import { FriendBalances } from "./friend-balances"
import { AddExpenseDialog } from "./add-expense-dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
// Removed useExpenses import as we rely on initialData
// import { useExpenses } from "@/contexts"

// Define the props with initial data from server-side rendering
type DashboardProps = {
  initialData?: {
    expenses: any[]; // These are the first 5 expenses for the dashboard list
    balances: { youOwe: number; youAreOwed: number };
    recentActivity: any[]; // These are the first 10 expenses (potentially for Activity page context)
  }
}

export function Dashboard({ initialData }: DashboardProps) {
  // Removed useExpenses context usage here
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  // isLoading is true only if initialData is NOT provided initially
  const [isLoading, setIsLoading] = useState(!initialData)
  const [activeTab, setActiveTab] = useState("activity")

  // Use initialData directly if available, otherwise default
  const balances = initialData?.balances || { youOwe: 0, youAreOwed: 0 }
  // Use the specific 'expenses' slice meant for the dashboard list
  const dashboardExpenses = initialData?.expenses || []
  // recentActivity might be used elsewhere or passed to context if needed
  // const recentActivity = initialData?.recentActivity || []

  // Removed the useEffect hooks that fetched data or recalculated state from context

  const handleAddExpense = (data: any) => {
    setIsAddExpenseOpen(false)
    toast("Expense added", {
      description: `$${data.amount} for ${data.description} has been added.`,
      duration: 3000
    })
    // TODO: Consider triggering a data refresh mechanism here if needed
    // e.g., router.refresh() or updating a context state
  }

  // Calculate total balance from the provided/defaulted balances
  const totalBalance = balances.youAreOwed - balances.youOwe

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ... Header/Sidebar if any ... */}


      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-6">
            {/* ... Top section with title and Add Expense button ... */}
             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Track and manage your shared expenses</p>
              </div>
              <Button
                onClick={() => setIsAddExpenseOpen(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
            {/* ... Balance cards ... */}
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <>
                  {/* ... Skeleton Cards ... */}
                   <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* ... Actual Balance Cards using 'balances' state ... */}
                   <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        You are owed <span className="text-green-500">${balances.youAreOwed.toFixed(2)}</span> and you owe{" "}
                        <span className="text-red-500">${balances.youOwe.toFixed(2)}</span>
                      </p>
                    </CardContent>
                  </Card>
                  {/* ... Other cards (using placeholders for now) ... */}
                   <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$0.00</div> {/* Placeholder - Needs data */} 
                      <p className="text-xs text-muted-foreground">
                        {/* Placeholder - Needs data */} 
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div> {/* Placeholder - Needs data */} 
                      <p className="text-xs text-muted-foreground">
                         {/* Placeholder - Needs data */} 
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            {/* ... Tabs ... */}
            <Tabs
              defaultValue="activity"
              value={activeTab}
              onValueChange={setActiveTab}
              className="animate-in fade-in duration-500"
            >
              {/* ... TabsList ... */}
               <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="activity" className="transition-all duration-200">
                    Recent Activity
                  </TabsTrigger>
                  <TabsTrigger value="balances" className="transition-all duration-200">
                    Friend Balances
                  </TabsTrigger>
                </TabsList>
                {/* ... Settle Up Button ... */}
                 <div className="hidden items-center gap-2 md:flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                    // TODO: Add onClick handler for Settle Up
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Settle Up
                  </Button>
                </div>
              </div>
              <TabsContent value="activity" className="mt-4 animate-in slide-in-from-left-4 duration-300">
                {/* Pass the specific dashboard expenses and loading state */}
                <ExpenseList
                  isLoading={isLoading}
                  initialExpenses={dashboardExpenses} // Pass the specific expenses for dashboard
                  title="Recent Activity"
                  description="Your latest shared expenses" // Simplified description
                />
              </TabsContent>
              <TabsContent value="balances" className="mt-4 animate-in slide-in-from-right-4 duration-300">
                {/* FriendBalances might need initialData.balances or fetch its own */}
                <FriendBalances isLoading={isLoading} /* Pass necessary props, maybe initialData.balances? */ />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen} onSave={handleAddExpense} />
    </div>
  )
}