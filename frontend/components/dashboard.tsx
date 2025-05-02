"use client"

import { useState, useEffect } from "react" // Keep useEffect for potential client-side only logic if needed later
import { ArrowLeftRight, LogOut, Plus, User } from "lucide-react"
import { useRouter } from "next/navigation" // Changed from next/router to next/navigation
import { useTransactions } from "@/contexts/TransactionContext" // Added the useTransactions hook

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
  
  // Import useRouter and useTransactions for necessary functionality
  const router = useRouter()
  const { summary, getTransactionSummary } = useTransactions()

  // Use initialData directly if available, otherwise use summary from context
  // This ensures consistent data source across the entire app
  const balances = initialData?.balances || 
    (summary ? { 
      youOwe: summary.totalYouOwe || 0, 
      youAreOwed: summary.totalYouAreOwed || 0 
    } : { 
      youOwe: 0, 
      youAreOwed: 0 
    })
    
  // Use the specific 'expenses' slice meant for the dashboard list
  const dashboardExpenses = initialData?.expenses || []
  
  // Load transaction data if needed
  useEffect(() => {
    if (!initialData) {
      const loadData = async () => {
        try {
          await getTransactionSummary()
          setIsLoading(false)
        } catch (error) {
          console.error("Failed to load transaction summary", error)
          setIsLoading(false)
        }
      }
      
      loadData()
    }
  }, [initialData, getTransactionSummary])

  const handleAddExpense = (data: any) => {
    setIsAddExpenseOpen(false)
    toast("Expense added", {
      description: `$${data.amount} for ${data.description} has been added.`,
      duration: 3000
    })
    // Refresh data after adding an expense
    getTransactionSummary().catch(error => 
      console.error("Failed to refresh data", error)
    )
  }

  // Handle navigation to the Settle Up page
  const handleSettleUp = () => {
    router.push('/settleUp')
  }

  // Calculate total balance from the provided/defaulted balances
  const totalBalance = balances.youAreOwed - balances.youOwe

  // Prepare friendBalances for the FriendBalances component
  const [friendBalances, setFriendBalances] = useState<Array<{id: string, name: string, balance: number}>>([])
  
  useEffect(() => {
    if (summary?.friendBalances) {
      // Map the data to ensure all required properties are present
      setFriendBalances(summary.friendBalances.map(friend => ({
        id: 'id' in friend ? (friend as any).id : String(Math.random()), // Safely handle missing id
        name: friend.name,
        balance: friend.balance
      })))
    }
  }, [summary])

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
                      <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${totalBalance.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You are owed <span className="text-green-500">${balances.youAreOwed.toFixed(2)}</span> and you owe{" "}
                        <span className="text-red-500">${balances.youOwe.toFixed(2)}</span>
                      </p>
                    </CardContent>
                  </Card>
                  {/* Amount Owed To You Card */}
                   <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Amount Owed To You</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">${balances.youAreOwed.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        Total amount currently owed to you
                      </p>
                    </CardContent>
                  </Card>
                  {/* Amount You Owe Card */}
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Amount You Owe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">${balances.youOwe.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        Total amount you currently owe
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
                    onClick={handleSettleUp}
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
                {/* Pass the friendBalances to the component using the correct prop name */}
                <FriendBalances isLoading={isLoading} initialBalances={friendBalances} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen} onSave={handleAddExpense} />
    </div>
  )
}