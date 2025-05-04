"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, DollarSign, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import { AddExpenseDialog } from "./add-expense-dialog"
import { FriendDetailDialog } from "./friend-detail-dialog"
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

// Helper function to consistently get user IDs regardless of data structure
const getUserId = (user: any): string | undefined => {
  if (!user) return undefined;
  
  // Handle string ID
  if (typeof user === 'string') return user;
  
  // Handle object with _id
  if (typeof user === 'object' && user._id) return user._id.toString();
  
  // Handle object with id
  if (typeof user === 'object' && user.id) return user.id.toString();
  
  return undefined;
};

export default function FriendCard({ friend, onAddExpense, onSettleUp }: FriendCardProps) {
  const { removeFriend } = useFriends()
  const { transactions } = useTransactions()
  const [isAllSettled, setIsAllSettled] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showFriendDetail, setShowFriendDetail] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [calculatedYouOwe, setCalculatedYouOwe] = useState(0)
  const [calculatedYouAreOwed, setCalculatedYouAreOwed] = useState(0)

  // Calculate actual balances with this friend from the transactions
  useEffect(() => {
    if (transactions.length > 0) {
      let youOwe = 0
      let youAreOwed = 0
      let hasUnsettledTransactions = false
      
      // Find all transactions involving this friend
      const friendTransactions = transactions.filter(tx => {
        const isFriendSender = getUserId(tx.senderId) === friend.id
        const isFriendReceiver = getUserId(tx.receiverId) === friend.id
        return (isFriendSender || isFriendReceiver) && !tx.isSettled
      })
      
      // For each transaction, determine if you owe or are owed
      friendTransactions.forEach(tx => {
        if (getUserId(tx.senderId) === friend.id) {
          // Friend is sender, you are receiver - you owe them
          youOwe += tx.amount
          hasUnsettledTransactions = true
        } else if (getUserId(tx.receiverId) === friend.id) {
          // You are sender, friend is receiver - they owe you
          youAreOwed += tx.amount
          hasUnsettledTransactions = true
        }
      })
      
      setCalculatedYouOwe(youOwe)
      setCalculatedYouAreOwed(youAreOwed)
      setIsAllSettled(!hasUnsettledTransactions)
      
      console.log(`Balance with ${friend.name}: You owe $${youOwe}, You are owed $${youAreOwed}`)
    }
  }, [friend.id, friend.name, transactions])
  
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

  // Use the calculated balances instead of the static totalOwed/totalOwes
  const netBalance = calculatedYouAreOwed - calculatedYouOwe
  
  const balanceText = netBalance > 0
    ? `${friend.name} owes you $${netBalance.toFixed(2)}`
    : netBalance < 0
    ? `You owe ${friend.name} $${Math.abs(netBalance).toFixed(2)}`
    : ""

  const isPositiveBalance = netBalance > 0
  const isNegativeBalance = netBalance < 0
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
        friend={{
          ...friend,
          // Pass the accurately calculated balances to the dialog
          totalOwed: calculatedYouAreOwed,
          totalOwes: calculatedYouOwe
        }}
        onAddExpense={handleAddExpense}
        onSettleUp={onSettleUp}
      />
    </>
  )
}