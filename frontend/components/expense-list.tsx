"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Coffee, Home, ShoppingBag, Utensils, Package, Users, Car, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useExpenses } from "@/contexts"

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
  const [displayExpenses, setDisplayExpenses] = useState(initialExpenses || [])
  
  // Use context expenses if initialExpenses wasn't provided
  useEffect(() => {
    if (!initialExpenses && contextExpenses.length === 0) {
      getExpenses()
    } else if (!initialExpenses && contextExpenses.length > 0) {
      setDisplayExpenses(contextExpenses)
    }
  }, [initialExpenses, contextExpenses, getExpenses])

  // Process expenses for display
  const processedExpenses = displayExpenses.length > 0 
    ? displayExpenses.map(expense => ({
        ...expense,
        icon: getCategoryIcon(expense.category),
        formattedDate: formatDate(expense.createdAt),
        youOwe: expense.senderId !== 'you' ? expense.participants.find((p: any) => p.user === 'you')?.share || 0 : 0,
        youAreOwed: expense.senderId === 'you' ? expense.participants.reduce((sum: number, p: any) => sum + p.share, 0) : 0
      }))
    : []

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
            {[1, 2, 3, 4].map((i) => (
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

  if (!processedExpenses.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No expenses found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
                    {expense.youOwe > 0 && (
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
                    <span>Paid by {expense.senderId.name || 'You'}</span>
                    <span>•</span>
                    <span>${expense.amount.toFixed(2)}</span>
                  </div>
                  <span>{expense.formattedDate}</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {expense.participants.map((participant: any, index: number) => (
                    <Avatar
                      key={participant.user._id || index}
                      className="h-6 w-6 border border-background transition-transform duration-200 hover:scale-125 hover:z-10"
                    >
                      <AvatarFallback className="text-[10px]">
                        {(participant.user.name || participant.user).substring(0, 2).toUpperCase()}
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
