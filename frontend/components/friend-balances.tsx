"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftRight } from "lucide-react"
import { motion } from "framer-motion"

// Sample data for friend balances
const friends = [
  {
    id: 1,
    name: "Alex Johnson",
    balance: 245.5,
    isOwed: true,
  },
  {
    id: 2,
    name: "Taylor Smith",
    balance: 75.0,
    isOwed: false,
  },
  {
    id: 3,
    name: "Jordan Lee",
    balance: 32.25,
    isOwed: true,
  },
  {
    id: 4,
    name: "Casey Wilson",
    balance: 0,
    isOwed: true,
  },
]

interface FriendBalancesProps {
  isLoading?: boolean
}

export function FriendBalances({ isLoading = false }: FriendBalancesProps) {
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
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
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
        <CardTitle>Friend Balances</CardTitle>
        <CardDescription>Your current balances with friends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              className="flex items-center justify-between rounded-lg p-2 transition-all duration-200 hover:bg-muted/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="transition-transform duration-200 hover:scale-110">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={friend.name} />
                  <AvatarFallback>
                    {friend.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friend.name}</p>
                  {friend.balance > 0 ? (
                    <p className={`text-sm ${friend.isOwed ? "text-green-500" : "text-red-500"}`}>
                      {friend.isOwed
                        ? `Owes you $${friend.balance.toFixed(2)}`
                        : `You owe $${friend.balance.toFixed(2)}`}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">All settled up</p>
                  )}
                </div>
              </div>
              {friend.balance > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105"
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Settle
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
