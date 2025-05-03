"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndianRupee, ArrowRight, ArrowLeft, CalendarIcon, Clock, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ExpenseDetailDialog } from "./expense-detail-dialog"
import { useAuth } from "@/contexts"

interface Expense {
  _id: string
  title: string
  amount: number
  category: string
  senderId: {
    _id: string
    name: string
    email: string
  }
  participants: Array<{
    user: {
      _id: string
      name: string
      email: string
    }
    share: number
    isSettled: boolean
  }>
  createdAt: string
  groupId?: {
    _id: string
    name: string
  }
  reciept?: string
  isGroupExpense?: boolean
}

interface FriendDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  friend: {
    id: string
    name: string
    email: string
    totalOwed: number
    totalOwes: number
  } | null
  onAddExpense?: () => void
  onSettleUp?: () => void
}

export function FriendDetailDialog({ 
  open, 
  onOpenChange, 
  friend, 
  onAddExpense,
  onSettleUp
}: FriendDetailProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("summary")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showExpenseDetail, setShowExpenseDetail] = useState(false)
  const [youOwe, setYouOwe] = useState(0)
  const [youAreOwed, setYouAreOwed] = useState(0)

  useEffect(() => {
    if (open && friend) {
      loadFriendExpenses(friend.id)
    }
  }, [open, friend])

  const loadFriendExpenses = async (friendId: string) => {
    setIsLoading(true)
    try {
      // First, let's get all expenses involving this friend
      const response = await fetch(`/api/friends/${friendId}/expenses`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
        
        // If the API provides balance information directly, use it
        if (data.balances) {
          setYouAreOwed(data.balances.friendOwes || 0)
          setYouOwe(data.balances.youOwe || 0)
        } else {
          // Otherwise, calculate balances from the expenses
          calculateBalancesFromExpenses(data.expenses || [])
        }
      } else {
        console.error('Failed to fetch friend expenses')
      }
    } catch (error) {
      console.error('Error loading friend expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate balances from the expense list
  const calculateBalancesFromExpenses = (expenseList: Expense[]) => {
    let calculatedYouOwe = 0
    let calculatedYouAreOwed = 0
    
    expenseList.forEach(expense => {
      // You paid for this expense (you should receive money)
      if (expense.senderId._id === user?._id) {
        // Find what the friend owes you from this expense
        const friendParticipant = expense.participants.find(
          p => p.user._id === friend?.id || 
               (typeof p.user === 'object' && p.user._id === friend?.id)
        )
        
        if (friendParticipant && !friendParticipant.isSettled) {
          calculatedYouAreOwed += friendParticipant.share
        }
      } 
      // Friend paid for this expense (you owe them)
      else if (expense.senderId._id === friend?.id) {
        // Find what you owe the friend from this expense
        const yourParticipant = expense.participants.find(
          p => p.user._id === user?._id || 
               (typeof p.user === 'object' && p.user._id === user?._id)
        )
        
        if (yourParticipant && !yourParticipant.isSettled) {
          calculatedYouOwe += yourParticipant.share
        }
      }
    })
    
    setYouOwe(calculatedYouOwe)
    setYouAreOwed(calculatedYouAreOwed)
    
    console.log("Calculated balances:", {
      youOwe: calculatedYouOwe,
      youAreOwed: calculatedYouAreOwed
    })
  }

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowExpenseDetail(true)
  }

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(expense => 
    expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  const netBalance = youAreOwed - youOwe

  if (!friend) return null
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{friend.name}</DialogTitle>
                <DialogDescription>{friend.email}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
              <TabsTrigger value="expenses" className="flex-1">Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <div className="grid gap-4">
                {/* Balance summary */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{Math.abs(netBalance).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {netBalance > 0 ? (
                        <>
                          <span className="font-medium text-green-500">{friend.name} owes you</span>
                        </>
                      ) : netBalance < 0 ? (
                        <>
                          <span className="font-medium text-red-500">You owe {friend.name}</span>
                        </>
                      ) : (
                        <>You're all settled up</>
                      )}
                    </p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* You're owed */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">You're owed</p>
                        <ArrowLeft className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-lg font-bold text-green-500">
                        ₹{youAreOwed.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* You owe */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">You owe</p>
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="text-lg font-bold text-red-500">
                        ₹{youOwe.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 mt-2">
                  <Button className="flex-1" onClick={onAddExpense}>
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                  {netBalance !== 0 && (
                    <Button className="flex-1" variant="outline" onClick={onSettleUp}>
                      Settle Up
                    </Button>
                  )}
                </div>
                
                {/* Recent activity */}
                <div className="mt-2">
                  <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <Card key={i} className="bg-muted/30 animate-pulse h-16"></Card>
                      ))}
                    </div>
                  ) : sortedExpenses.length > 0 ? (
                    <div className="space-y-2">
                      {sortedExpenses.slice(0, 3).map(expense => (
                        <Card 
                          key={expense._id} 
                          className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleExpenseClick(expense)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{expense.title}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(parseISO(expense.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₹{expense.amount.toFixed(2)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                      No expenses found with {friend.name}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-4">
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="bg-muted/30 animate-pulse h-16"></Card>
                    ))}
                  </div>
                ) : sortedExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {sortedExpenses.map(expense => {
                      // Determine if you paid or they paid
                      const youPaid = expense.senderId._id === user?._id
                      // Find the participant that represents the current user or friend
                      const relevantParticipant = expense.participants.find(
                        p => youPaid 
                          ? p.user._id === friend.id 
                          : p.user._id === user?._id
                      )
                      const amount = relevantParticipant?.share || 0
                      
                      return (
                        <Card 
                          key={expense._id} 
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleExpenseClick(expense)}
                        >
                          <div className="flex justify-between items-center p-3">
                            <div className="flex gap-3 items-center">
                              <div className={`p-2 rounded-full ${youPaid ? 'bg-green-100' : 'bg-red-100'}`}>
                                {youPaid ? (
                                  <ArrowLeft className={`h-4 w-4 text-green-600`} />
                                ) : (
                                  <ArrowRight className={`h-4 w-4 text-red-600`} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{expense.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                                  •
                                  <Badge variant="outline" className="text-xs">
                                    {expense.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${youPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {youPaid ? '+' : '-'}₹{amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                of ₹{expense.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <IndianRupee className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No expenses found with {friend.name}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={onAddExpense}
                    >
                      Add your first expense
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Expense Detail Dialog */}
      {selectedExpense && (
        <ExpenseDetailDialog
          open={showExpenseDetail}
          onOpenChange={setShowExpenseDetail}
          expense={selectedExpense}
          currentUserId={user?._id}
        />
      )}
    </>
  )
}