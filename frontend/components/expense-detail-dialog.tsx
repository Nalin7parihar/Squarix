"use client"

import {  useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Receipt, Users, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface Participant {
  user: {
    _id: string
    name: string
    email: string
    id?: string
  };
  share: number;
  isSettled: boolean;
  transactionId?: string;
}

interface ExpenseDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: {
    _id: string;
    title: string;
    amount: number;
    category: string;
    senderId: {
      _id: string
      name: string
      email: string
      id?: string
    } | string;
    participants: Participant[];
    createdAt: string;
    groupId?: {
      _id: string
      name: string
    } 
    reciept?: string;
    isGroupExpense?: boolean;
  } | null;
  currentUserId?: string;
}

export function ExpenseDetailDialog({ 
  open, 
  onOpenChange, 
  expense, 
  currentUserId 
}: ExpenseDetailProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  if (!expense) return null

  const date = new Date(expense.createdAt)
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Calculate total amount paid/owed by current user
  const currentUserParticipant = expense.participants.find(
    p => p.user._id === currentUserId || p.user.id === currentUserId
  )
  
  const isUserPayer = typeof expense.senderId === 'object' 
    ? expense.senderId._id === currentUserId
    : expense.senderId === currentUserId;
  
  const userShare = currentUserParticipant?.share || 0
  const userStatus = isUserPayer 
    ? `You paid ₹${expense.amount.toFixed(2)} and are owed ₹${(expense.amount - userShare).toFixed(2)}`
    : `You owe ₹${userShare.toFixed(2)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{expense.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate} ({timeAgo})</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {/* Amount and category */}
          <div className="mb-6">
            <div className="text-3xl font-bold mb-1">${expense.amount.toFixed(2)}</div>
            <Badge variant="outline" className="bg-primary/5">
              {expense.category}
            </Badge>
            {expense.isGroupExpense && expense.groupId && (
              <Badge variant="outline" className="ml-2 bg-secondary/20">
                <Users className="h-3 w-3 mr-1" />
                {expense.groupId.name}
              </Badge>
            )}
          </div>

          {/* User status */}
          <Card className="mb-4 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="font-medium">{userStatus}</p>
            </CardContent>
          </Card>

          {/* Paid by section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Paid by</h3>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10">
              <Avatar>
                <AvatarFallback>
                  {typeof expense.senderId === 'object' 
                    ? getInitials(expense.senderId.name || "User") 
                    : "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {isUserPayer 
                    ? "You" 
                    : (typeof expense.senderId === 'object' ? expense.senderId.name : "User")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {typeof expense.senderId === 'object' ? expense.senderId.email : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Split details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Split between</h3>
            <div className="space-y-2">
              {expense.participants.map((participant) => {
                const isCurrentUser = participant.user._id === currentUserId || participant.user.id === currentUserId;
const participantName = isCurrentUser ? "You" : (participant.user.name || "Unknown User");
                
                return (
                  <div 
                    key={participant.user._id || participant.user.id}
                    className="flex justify-between items-center p-2 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(participant.user.name || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {isCurrentUser ? "You" : participant.user.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">${participant.share.toFixed(2)}</span>
                      {participant.isSettled && (
                        <Badge className="ml-2 bg-green-500/10 text-green-600 border-green-200">
                          Settled
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Receipt image if available */}
          {expense.reciept && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Receipt className="h-4 w-4 mr-1" />
                Receipt
              </h3>
              <div className="cursor-pointer" onClick={() => setIsImageExpanded(true)}>
                <img 
                  src={expense.reciept} 
                  alt="Receipt" 
                  className="rounded-md border object-cover w-full max-h-40" 
                />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Click to view full size
                </p>
              </div>
            </div>
          )}
          
          {/* Warning for unsettled expenses */}
          {expense.participants.some(p => (!p.isSettled && (p.user._id === currentUserId || p.user.id === currentUserId))) && (
            <div className="rounded-md bg-yellow-50 p-3 mt-2 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Amount due</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This expense has not been fully settled yet. You can settle up from the transactions page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Expanded image modal */}
      {isImageExpanded && expense.reciept && (
        <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/90">
            <DialogHeader className="sr-only">
              <DialogTitle>Receipt Image</DialogTitle>
            </DialogHeader>
            <div className="flex justify-end p-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20" 
                onClick={() => setIsImageExpanded(false)}
              >
                ✕
              </Button>
            </div>
            <div className="flex items-center justify-center p-4">
              <img 
                src={expense.reciept} 
                alt="Receipt" 
                className="max-h-[80vh] max-w-full object-contain" 
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}