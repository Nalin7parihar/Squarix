import { Card, CardContent } from "./ui/card"
import { UserRound, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { useFriends } from "@/contexts"
import { useEffect, useState, useRef } from "react"
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

const FriendCard = ({ friend, onAddExpense, onSettleUp }: FriendCardProps) => {
  const { removeFriend } = useFriends()
  const { transactions } = useTransactions()
  const [isAllSettled, setIsAllSettled] = useState(friend.totalOwed === 0 && friend.totalOwes === 0)
  const hasCheckedStatus = useRef(false)

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

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserRound className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{friend.name}</h3>
              <p className="text-sm text-muted-foreground">{friend.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {friend.totalOwed > 0 && (
              <div className="text-sm font-medium text-green-500">
                Owes you ${friend.totalOwed.toFixed(2)}
              </div>
            )}
            {friend.totalOwes > 0 && (
              <div className="text-sm font-medium text-red-500">
                You owe ${friend.totalOwes.toFixed(2)}
              </div>
            )}
            {isAllSettled && friend.totalOwed === 0 && friend.totalOwes === 0 && (
              <div className="text-sm font-medium text-muted-foreground">
                All settled up
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddExpense}>Add Expense</DropdownMenuItem>
                <DropdownMenuItem onClick={onSettleUp}>Settle Up</DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleRemoveFriend}
                  className="text-red-500"
                >
                  Remove Friend
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FriendCard