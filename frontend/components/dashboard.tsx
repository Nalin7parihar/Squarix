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


export function Dashboard() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("activity")
  

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleAddExpense = (data: any) => {
    setIsAddExpenseOpen(false)
    toast("Expense added",{
      description: `$${data.amount} for ${data.description} has been added.`,
      duration : 3000
    })
  }



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
                      <div className="text-2xl font-bold">$245.00</div>
                      <p className="text-xs text-muted-foreground">
                        You are owed <span className="text-green-500">$320.00</span> and you owe{" "}
                        <span className="text-red-500">$75.00</span>
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
                <ExpenseList isLoading={isLoading} />
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