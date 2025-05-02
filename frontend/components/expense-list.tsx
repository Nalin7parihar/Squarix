"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Split, Users, UserRound, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Empty } from "./ui/empty"
import { useExpenses } from "@/contexts/ExpenseContext"
import { useAuth } from "@/contexts"
import { ExpenseDetailDialog } from "./expense-detail-dialog"

// Define Expense type to match your backend model
interface Participant {
  user: {
    _id: string;
    name: string;
    email: string;
    id?: string;
  };
  share: number;
  isSettled: boolean;
  transactionId?: string;
}

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    id?: string;
  } 
  participants: Participant[];
  createdAt: string;
  groupId?: {
    _id: string;
    name: string;
  } 
  reciept?: string;
  isGroupExpense?: boolean;
}

interface ExpenseListProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
  initialExpenses?: Expense[];
  limit?: number;
  showSearch?: boolean;
}

export function ExpenseList({ 
  title = "Expenses", 
  description = "Your recent expenses and shared payments",
  isLoading: propIsLoading, 
  initialExpenses = [], 
  limit, 
  showSearch = true 
}: ExpenseListProps) {
  const { expenses } = useExpenses()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showExpenseDetail, setShowExpenseDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Use the loading state from props if provided
  useEffect(() => {
    if (propIsLoading !== undefined) {
      setIsLoading(propIsLoading)
    }
  }, [propIsLoading])
  
  // Use initialExpenses if provided, otherwise use context expenses
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>(initialExpenses)
  
  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return "??"
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
  }
  
  // Update displayedExpenses when expenses from context changes
  useEffect(() => {
    if (!initialExpenses.length && expenses?.length) {
      // Filter expenses based on title to determine if we're in the settled tab
      if (title === "Settled Expenses") {
        // Only show expenses where the current user's participation is settled
        const settledExpenses = expenses.filter((expense: any) => {
          const userParticipant = expense.participants?.find(
            (p: Participant) => p.user._id === user?._id || p.user.id === user?._id
          );
          return userParticipant?.isSettled === true;
        });
        setDisplayedExpenses(settledExpenses as unknown as Expense[]);
      } else if (title === "Expenses You Owe") {
        // Only show expenses where the current user owes money
        const owedExpenses = expenses.filter((expense: any) => {
          const senderId = typeof expense.senderId === 'object' 
            ? expense.senderId._id 
            : expense.senderId;
          
          // Current user is not the payer
          if (senderId === user?._id) return false;
          
          // Find if current user is a participant who hasn't settled
          const userParticipant = expense.participants?.find(
            (p: Participant) => (p.user._id === user?._id || p.user.id === user?._id) && !p.isSettled
          );
          
          return !!userParticipant;
        });
        setDisplayedExpenses(owedExpenses as unknown as Expense[]);
      } else if (title === "Expenses Owed To You") {
        // Only show expenses where others owe money to the current user
        const owedToUserExpenses = expenses.filter((expense: any) => {
          const senderId = typeof expense.senderId === 'object' 
            ? expense.senderId._id 
            : expense.senderId;
          
          // Current user must be the payer
          if (senderId !== user?._id) return false;
          
          // At least one participant hasn't settled
          return expense.participants?.some(
            (p: Participant) => (p.user._id !== user?._id && p.user.id !== user?._id) && !p.isSettled
          );
        });
        setDisplayedExpenses(owedToUserExpenses as unknown as Expense[]);
      } else {
        setDisplayedExpenses(expenses as unknown as Expense[]);
      }
    }
  }, [expenses, initialExpenses.length, title, user?._id])
  
  // Filter expenses based on search query
  const filteredExpenses = displayedExpenses.filter(expense =>
    expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Apply limit if specified
  const limitedExpenses = limit ? filteredExpenses.slice(0, limit) : filteredExpenses
  
  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowExpenseDetail(true)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showSearch && (
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
  
          <ScrollArea className="max-h-[400px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="space-y-4 mt-2">
                {/* Loading Skeletons */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : limitedExpenses.length > 0 ? (
              <div className="space-y-2 mt-2 w-full">
                {limitedExpenses.map((expense) => {
                  // Handle if the expense is a group expense
                  const isGroupExpense = expense.isGroupExpense || expense.groupId;
                  
                  // Get sender ID based on different possible formats
                  const senderIdValue = typeof expense.senderId === 'object' 
                    ? expense.senderId._id || expense.senderId.id
                    : expense.senderId;
                  
                  // Determine if the current user is the payer
                  const isPayer = senderIdValue === user?._id;
                  
                  // Find the participant entry for the current user
                  const userParticipant = expense.participants?.find(
                    (p: Participant) => {
                      return p.user._id === user?._id || p.user.id === user?._id;
                    }
                  );
                  
                  // Calculate the user's amount in this expense
                  let userAmount = 0;
                  if (isPayer) {
                    // If user is payer, they paid the whole amount
                    userAmount = expense.amount;
                    // Subtract what they owe themselves
                    if (userParticipant) {
                      userAmount -= userParticipant.share;
                    }
                  } else if (userParticipant) {
                    // If user is not payer but is a participant, they owe this amount
                    userAmount = -userParticipant.share;
                  }
                  
                  // Is the expense settled for this user
                  const isSettled = userParticipant?.isSettled || false;
                  
                  // Format the date
                  let timeAgo = "";
                  try {
                    const date = parseISO(expense.createdAt);
                    timeAgo = formatDistanceToNow(date, { addSuffix: true });
                  } catch (e) {
                    timeAgo = "recent";
                  }

                  // Get sender name
                  const senderName = typeof expense.senderId === 'object' 
                    ? expense.senderId.name 
                    : "";

                  // Get participant's name
                  const participantName = expense.participants && expense.participants.length > 0
                    ? expense.participants[0].user.name || ""
                    : "";

                  return (
                    <div
                      key={expense._id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors w-full mb-2"
                      onClick={() => handleExpenseClick(expense)}
                    >
                      {/* Left Avatar - Either group icon or person avatar */}
                      {isGroupExpense ? (
                        <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      ) : (
                        <Avatar className="flex-shrink-0 h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(
                              isPayer 
                                ? (participantName || "??") 
                                : (senderName || "??")
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
  
                      {/* Middle content - Title, time, and participants */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="font-medium truncate">{expense.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>{timeAgo}</span>
                          {isGroupExpense && expense.groupId && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <Badge variant="outline" className="bg-secondary/20 text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {typeof expense.groupId === 'object' ? expense.groupId.name : 'Group'}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
  
                      {/* Right content - Amount and category */}
                      <div className="text-right flex-shrink-0">
                        <div className={`font-medium ${userAmount > 0 ? 'text-green-600' : userAmount < 0 ? 'text-red-600' : ''}`}>
                          {userAmount > 0 ? '+' : userAmount < 0 ? '-' : ''}${Math.abs(userAmount).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 justify-end flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {expense.category}
                          </Badge>
                          {isSettled && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                              Settled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                icon={Split}
                title="No expenses found"
                description={searchQuery ? "Try a different search term" : "Add your first expense to get started"}
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>

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
  );
}
