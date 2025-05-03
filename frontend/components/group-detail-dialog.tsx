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
import { IndianRupee, Users, CalendarIcon, Clock, Search, UsersRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ExpenseDetailDialog } from "./expense-detail-dialog"
import { useAuth } from "@/contexts"
import { toast } from "sonner"

interface GroupExpense {
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
  groupId: {
    _id: string
    name: string
  }
  reciept?: string
  isGroupExpense: boolean
}

interface GroupMember {
  _id: string
  name: string
  email: string
}

interface GroupDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: {
    id: string
    name: string
    members: string[]
    totalExpenses?: number
  } | null
  onAddExpense?: () => void
  friendsList: Array<{
    id: string
    name: string
    email: string
  }>
}

export function GroupDetailDialog({ 
  open, 
  onOpenChange, 
  group, 
  onAddExpense,
  friendsList
}: GroupDetailProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("summary")
  const [expenses, setExpenses] = useState<GroupExpense[]>([])
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpense, setSelectedExpense] = useState<GroupExpense | null>(null)
  const [showExpenseDetail, setShowExpenseDetail] = useState(false)
  const [groupDetails, setGroupDetails] = useState<any>(null)

  useEffect(() => {
    if (open && group) {
      // No need to load group details separately anymore
      loadGroupExpenses(group.id)
      
      // Use the group data that was passed to the component
      // Initialize group members from the group members data
      if (group.members && group.members.length > 0) {
        const memberIds = group.members
        setGroupMembers(
          friendsList
            .filter(friend => memberIds.includes(friend.id))
            .map(friend => ({
              _id: friend.id,
              name: friend.name,
              email: friend.email
            }))
        )
      }

      setGroupDetails({
        ...group,
        totalExpense: group.totalExpenses || 0
      })
      setIsLoading(false)
    }
  }, [open, group, friendsList])

  const loadGroupExpenses = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
      } else {
        console.error('Failed to fetch group expenses')
      }
    } catch (error) {
      console.error('Error loading group expenses:', error)
    }
  }

  const handleExpenseClick = (expense: GroupExpense) => {
    setSelectedExpense(expense)
    setShowExpenseDetail(true)
  }

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(expense => 
    expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.senderId.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Get member name from ID
  const getMemberName = (memberId: string): string => {
    if (user && user._id === memberId) return 'You'
    
    // First check in groupMembers (if available)
    const groupMember = groupMembers.find(m => m._id === memberId)
    if (groupMember) return groupMember.name
    
    // Fall back to friendsList
    const friend = friendsList.find(f => f.id === memberId)
    if (friend) return friend.name
    
    return 'Unknown Member'
  }

  if (!group) return null
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{group.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  {group.members.length} members • {group.totalExpenses ? `₹${group.totalExpenses.toFixed(2)}` : '₹0'} total expenses
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
              <TabsTrigger value="expenses" className="flex-1">Expenses</TabsTrigger>
              <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <div className="grid gap-4">
                {/* Total expenses */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{groupDetails?.totalExpense?.toFixed(2) || (group.totalExpenses?.toFixed(2) || '0.00')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shared across {group.members.length} members
                    </p>
                  </CardContent>
                </Card>
                
                {/* Action button */}
                <Button className="mt-2" onClick={onAddExpense}>
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Add Group Expense
                </Button>
                
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
                                <span>•</span>
                                <span>Paid by {getMemberName(expense.senderId._id)}</span>
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
                      No expenses found for this group
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
                      const youPaid = expense.senderId._id === user?._id
                      
                      // Find the participant that represents the current user
                      const yourParticipation = expense.participants.find(
                        p => p.user._id === user?._id
                      )
                      
                      // Your share to pay or receive
                      const yourShare = yourParticipation?.share || 0
                      
                      return (
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
                                <span>•</span>
                                <span>Paid by {getMemberName(expense.senderId._id)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₹{expense.amount.toFixed(2)}
                              </p>
                              {youPaid ? (
                                <span className="text-xs text-green-600">You paid</span>
                              ) : (
                                <span className="text-xs">
                                  Your share: ₹{yourShare.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <IndianRupee className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No expenses found for this group</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={onAddExpense}
                    >
                      Add your first group expense
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="members" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="bg-muted/30 animate-pulse h-16"></Card>
                    ))
                  ) : group.members.length > 0 ? (
                    group.members.map(memberId => {
                      // Find member from groupMembers or friendsList
                      const isCurrentUser = user && user._id === memberId
                      const memberName = getMemberName(memberId)
                      
                      // Get email from either source
                      let memberEmail = ""
                      const groupMember = groupMembers.find(m => m._id === memberId)
                      if (groupMember) memberEmail = groupMember.email
                      else {
                        const friend = friendsList.find(f => f.id === memberId)
                        if (friend) memberEmail = friend.email
                      }
                      
                      return (
                        <Card key={memberId} className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {memberName.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {memberName} {isCurrentUser && "(You)"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {memberEmail}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      No members found
                    </div>
                  )}
                </div>
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