"use client"

import { useState, useEffect } from "react"
import { ArrowLeftRight, LogOut, Plus, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseList } from "./expense-list"
import { FriendBalances } from "./friend-balances"
import { AddExpenseDialog } from "./add-expense-dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useExpenses } from "@/contexts"

// Define the props with initial data from server-side rendering
type DashboardProps = {
  initialData?: {
    expenses: any[];
    balances: { youOwe: number; youAreOwed: number };
    recentActivity: any[];
  }
}

export function Dashboard({ initialData }: DashboardProps) {
  const { getExpenses, getExpenseSummary } = useExpenses()
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [activeTab, setActiveTab] = useState("activity")
  
  // Server-provided or local state for balances
  const [balances, setBalances] = useState(initialData?.balances || { youOwe: 0, youAreOwed: 0 })
  // Server-provided or local state for recent expenses
  const [recentExpenses, setRecentExpenses] = useState(initialData?.expenses || [])
  // Server-provided or local state for activity
  const [recentActivity, setRecentActivity] = useState(initialData?.recentActivity || [])

  // If we don't have initial data, fetch it on the client
  useEffect(() => {
    const fetchData = async () => {
      if (!initialData) {
        // Fetch data if it wasn't provided from the server
        try {
          // Fetch expenses and summary
          await getExpenses()
          const summary = await getExpenseSummary()
          setBalances(summary)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
        } finally {
          // Done loading either way
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [initialData, getExpenses, getExpenseSummary])

  const handleAddExpense = (data: any) => {
    setIsAddExpenseOpen(false)
    toast("Expense added",{
      description: `$${data.amount} for ${data.description} has been added.`,
      duration : 3000
    })
  }

  // Calculate total balance
  const totalBalance = balances.youAreOwed - balances.youOwe

  return (
    <div className="flex min-h-screen flex-col bg-background">
     
     
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-6">
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <>
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
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$1,240.56</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-500">+12%</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-amber-500">2 friends</span> need to settle up
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            <Tabs
              defaultValue="activity"
              value={activeTab}
              onValueChange={setActiveTab}
              className="animate-in fade-in duration-500"
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="activity" className="transition-all duration-200">
                    Recent Activity
                  </TabsTrigger>
                  <TabsTrigger value="balances" className="transition-all duration-200">
                    Friend Balances
                  </TabsTrigger>
                </TabsList>
                <div className="hidden items-center gap-2 md:flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Settle Up
                  </Button>
                </div>
              </div>
              <TabsContent value="activity" className="mt-4 animate-in slide-in-from-left-4 duration-300">
                <ExpenseList isLoading={isLoading} initialExpenses={initialData?.expenses} />
              </TabsContent>
              <TabsContent value="balances" className="mt-4 animate-in slide-in-from-right-4 duration-300">
                <FriendBalances isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen} onSave={handleAddExpense} />
    </div>
  )
}