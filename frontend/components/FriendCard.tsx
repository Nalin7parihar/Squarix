"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, DollarSign, UserRound, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import { AddExpenseDialog } from "./add-expense-dialog"
import { FriendDetailDialog } from "./friend-detail-dialog"
import { Card, CardContent } from "./ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu"
import { useFriends } from "@/contexts"
import { useTransactions } from "@/contexts/TransactionContext"

interface Friend {
  id: string
  name: string
  email: string
  totalOwed: number
  totalOwes: number
}

interface FriendCardProps {
  friend: Friend
  onAddExpense?: () => void
  onSettleUp?: () => void
}

export default function FriendCard({ friend, onAddExpense, onSettleUp }: FriendCardProps) {
  const { removeFriend } = useFriends()
  const { transactions } = useTransactions()
  const [isAllSettled, setIsAllSettled] = useState(friend.totalOwed === 0 && friend.totalOwes === 0)
  const hasCheckedStatus = useRef(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showFriendDetail, setShowFriendDetail] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)

  // Check if there are any unsettled transactions with this friend
  useEffect(() => {
    // Only check if we have transactions data and haven't checked yet
    if (transactions.length > 0 && !hasCheckedStatus.current) {
      // Check if there are any unsettled transactions with this friend
      const unsettledWithFriend = transactions.some(tx => 
        // Friend is either sender or receiver
        ((tx.senderId.id === friend.id || tx.receiverId.id === friend.id)) && 
        // Transaction is not settled
        !tx.isSettled
      )
      
      // Update settlement status
      setIsAllSettled(!unsettledWithFriend)
      hasCheckedStatus.current = true
    }
  }, [friend.id, transactions])
  
  const handleRemoveFriend = async () => {
    try {
      await removeFriend(friend.id)
    } catch (error) {
      console.error('Failed to remove friend:', error)
    }
  }

  const handleAddExpense = () => {
    setSelectedFriend(friend.id)
    setShowAddExpense(true)
    if (onAddExpense) onAddExpense()
  }

  const handleCardClick = () => {
    setShowFriendDetail(true)
  }

  const handleExpenseSaved = () => {
    setShowAddExpense(false)
    setSelectedFriend(null)
  }

  const balanceText = friend.totalOwed > friend.totalOwes
    ? `${friend.name} owes you $${(friend.totalOwed - friend.totalOwes).toFixed(2)}`
    : friend.totalOwed < friend.totalOwes
    ? `You owe ${friend.name} $${(friend.totalOwes - friend.totalOwed).toFixed(2)}`
    : "You're all settled up"

  const isPositiveBalance = friend.totalOwed > friend.totalOwes
  const isNegativeBalance = friend.totalOwed < friend.totalOwes
  const hasBalance = isPositiveBalance || isNegativeBalance

  return (
    <>
      <div 
        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent/20 transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <Avatar>
            <AvatarFallback>
              {friend.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{friend.name}</h3>
            <p className="text-sm text-muted-foreground">{friend.email}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <div className="md:mr-8 text-sm mb-2 md:mb-0 md:text-right w-full md:w-auto">
            {hasBalance ? (
              <span
                className={
                  isPositiveBalance
                    ? "text-green-500 font-medium"
                    : "text-red-500 font-medium"
                }
              >
                {balanceText}
              </span>
            ) : (
              <span className="text-muted-foreground">{balanceText}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddExpense();
              }}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              Add expense
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              variant="ghost"
              size="sm"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Expense Dialog */}
      {showAddExpense && (
        <AddExpenseDialog
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
          onSave={handleExpenseSaved}
          initialSelectedFriends={selectedFriend ? [selectedFriend] : []}
        />
      )}

      {/* Friend Detail Dialog */}
      <FriendDetailDialog 
        open={showFriendDetail}
        onOpenChange={setShowFriendDetail}
        friend={friend}
        onAddExpense={handleAddExpense}
        onSettleUp={onSettleUp}
      />
    </>
  )
}