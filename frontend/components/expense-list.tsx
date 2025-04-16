"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Coffee, Home, ShoppingBag, Utensils } from "lucide-react"
import { motion } from "framer-motion"

// Sample data for expenses
const expenses = [
  {
    id: 1,
    title: "Dinner at Olive Garden",
    date: "Today at 8:30 PM",
    amount: 86.25,
    paidBy: "You",
    participants: ["Alex", "Taylor"],
    icon: Utensils,
    youOwe: 0,
    youAreOwed: 57.5,
  },
  {
    id: 2,
    title: "Grocery shopping",
    date: "Yesterday at 2:15 PM",
    amount: 124.35,
    paidBy: "Alex",
    participants: ["You", "Taylor"],
    icon: ShoppingBag,
    youOwe: 41.45,
    youAreOwed: 0,
  },
  {
    id: 3,
    title: "Coffee run",
    date: "Apr 14, 2025",
    amount: 18.75,
    paidBy: "You",
    participants: ["Alex", "Jordan", "Taylor"],
    icon: Coffee,
    youOwe: 0,
    youAreOwed: 14.06,
  },
  {
    id: 4,
    title: "Rent payment",
    date: "Apr 1, 2025",
    amount: 1800.0,
    paidBy: "You",
    participants: ["Alex", "Taylor"],
    icon: Home,
    youOwe: 0,
    youAreOwed: 1200.0,
  },
]

interface ExpenseListProps {
  isLoading?: boolean
}

export function ExpenseList({ isLoading = false }: ExpenseListProps) {
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

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your latest shared expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense, index) => (
            <motion.div
              key={expense.id}
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
                      <span className="text-sm font-medium text-red-500">You owe ${expense.youOwe.toFixed(2)}</span>
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
                    <span>Paid by {expense.paidBy}</span>
                    <span>•</span>
                    <span>${expense.amount.toFixed(2)}</span>
                  </div>
                  <span>{expense.date}</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {expense.participants.map((participant, index) => (
                    <Avatar
                      key={index}
                      className="h-6 w-6 border border-background transition-transform duration-200 hover:scale-125 hover:z-10"
                    >
                      <AvatarImage src={`/placeholder.svg?height=24&width=24`} alt={participant} />
                      <AvatarFallback className="text-[10px]">
                        {participant.substring(0, 2).toUpperCase()}
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
