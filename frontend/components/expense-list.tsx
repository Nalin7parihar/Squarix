"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Coffee, Home, ShoppingBag, Utensils, Package, Users, Car, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useExpenses } from "@/contexts"
import { Badge } from "@/components/ui/badge"

// Helper function to get icon based on expense category
const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: any } = {
    'Food & Drink': Utensils,
    'Groceries': ShoppingBag,
    'Rent': Home,
    'Utilities': Home,
    'Entertainment': Users,
    'Transportation': Car,
    'Other': FileText,
  }
  return icons[category] || Package
}

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    // If date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
    }

    // If date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (error) {
    return dateString || 'Unknown date'
  }
}

interface ExpenseListProps {
  isLoading?: boolean
  initialExpenses?: any[]
  title?: string
  description?: string
}
export function ExpenseList({
  isLoading = false,
  initialExpenses,
  title = "Recent Expenses",
  description = "Your latest shared expenses"
}: ExpenseListProps) {
  const { expenses: contextExpenses, getExpenses } = useExpenses()
  // Initialize with initialExpenses if provided, otherwise empty array
  const [displayExpenses, setDisplayExpenses] = useState(initialExpenses || [])

  // Effect to potentially use context or fetch if initial data is missing
  useEffect(() => {
    // If initialExpenses were NOT provided...
    if (!initialExpenses) {
      // And context is empty, try fetching
      if (contextExpenses.length === 0) {
        getExpenses()
      }
      // And context has data, use it
      else {
        setDisplayExpenses(contextExpenses)
      }
    }
    // If initialExpenses were provided, setDisplayExpenses with it.
    // This handles cases where initialExpenses might update.
    else {
        setDisplayExpenses(initialExpenses);
    }
  }, [initialExpenses, contextExpenses, getExpenses]) // Rerun if initialExpenses changes

  // Process expenses for display (using displayExpenses state)
  const processedExpenses = displayExpenses.map(expense => {
      // Helper function to determine if a user is the current user
      const isCurrentUser = (user: any) => {
        if (!user) return false;
        // Handle both string and object representations
        return user === 'you' || 
               user._id === 'you' || 
               (typeof user === 'object' && user.name === 'You');
      };
      
      // Calculate what the user owes or is owed
      let youOwe = 0;
      let youAreOwed = 0;
      
      // Define participant interface to satisfy TypeScript
      interface Participant {
        user: any;
        share: number;
        isSettled: boolean;
        transactionId: string | null;
      }
      
      // If the sender is someone else, you might owe money
      if (!isCurrentUser(expense.senderId)) {
        const yourParticipation = expense.participants.find((p: Participant) => isCurrentUser(p.user));
        // Ensure yourParticipation and share exist before adding
        if (yourParticipation && typeof yourParticipation.share === 'number') {
          youOwe = yourParticipation.share;
        }
      } 
      // If you're the sender, others might owe you
      else {
        expense.participants.forEach((participant: Participant) => {
          // Ensure participant user is not current user and share exists
          if (!isCurrentUser(participant.user) && typeof participant.share === 'number') {
            youAreOwed += participant.share;
          }
        });
      }
      
      return {
        ...expense,
        icon: getCategoryIcon(expense.category),
        formattedDate: formatDate(expense.createdAt),
        youOwe,
        youAreOwed
      };
    })

  // Show loading skeleton FIRST if isLoading is true
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Adjust skeleton count based on typical number of items (e.g., 5 for dashboard) */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If NOT loading and no expenses, show the "No expenses found" message
  if (!processedExpenses.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[200px] items-center justify-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No expenses found</p>
              <p className="text-xs text-muted-foreground/70">When you add expenses, they will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If NOT loading and expenses EXIST, render the list
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedExpenses.map((expense, index) => (
            <motion.div
              key={expense._id}
              className="flex items-start gap-4 rounded-lg p-2 transition-all duration-200 hover:bg-muted/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary/20">
                <expense.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{expense.title}</p>
                  <div className="flex items-center gap-2">
                    {expense.isSettled && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Settled
                      </Badge>
                    )}
                    {expense.youOwe > 0 && !expense.isSettled && (
                      <span className="text-sm font-medium text-red-500">
                        You owe ${expense.youOwe.toFixed(2)}
                      </span>
                    )}
                    {expense.youAreOwed > 0 && (
                      <span className="text-sm font-medium text-green-500">
                        You are owed ${expense.youAreOwed.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {/* Ensure senderId is an object with a name property or handle appropriately */}
                    <span>Paid by {typeof expense.senderId === 'object' && expense.senderId?.name ? expense.senderId.name : 'You'}</span>
                    <span>•</span>
                    {/* Ensure amount is a number */}
                    <span>${typeof expense.amount === 'number' ? expense.amount.toFixed(2) : '0.00'}</span>
                  </div>
                  <span>{expense.formattedDate}</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {/* Ensure participants is an array before mapping */}
                  {Array.isArray(expense.participants) && expense.participants.map((participant: any, index: number) => (
                    <Avatar
                      key={participant.user?._id || index} // Use optional chaining and provide fallback key
                      className="h-6 w-6 border border-background transition-transform duration-200 hover:scale-125 hover:z-10"
                    >
                      <AvatarFallback className="text-[10px]">
                        {/* Ensure participant.user exists and has a name */}
                        {(participant.user?.name || '??').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
