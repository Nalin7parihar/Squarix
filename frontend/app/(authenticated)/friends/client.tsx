"use client"

import { useState, useEffect } from "react"
import { UserRound, UserPlus, Search, Users, UserCog, DollarSign, ArrowRight, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFriends } from "@/contexts"
import FriendCard from "@/components/FriendCard"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts"

interface Friend {
  id: string
  name: string
  email: string
  totalOwed: number
  totalOwes: number
}

interface Group {
  id: string
  name: string
  description?: string
  members: string[]
  expenses?: GroupExpense[]
  totalExpenses?: number
}

interface GroupExpense {
  id: string
  description: string
  amount: number
  paidBy: string
  date: string
  splitBetween: string[]
}

interface FriendsPageClientProps {
  initialData: {
    friends: Friend[]
    groups: Group[]
  }
}

export default function FriendsPageClient({ initialData }: FriendsPageClientProps) {
  const [activeTab, setActiveTab] = useState("friends")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const [newFriendEmail, setNewFriendEmail] = useState("")
  const { friends, groups, isLoading, addFriend, getFriends, createGroup, getGroups } = useFriends()
  const { user } = useAuth()

  // Add these new state variables for expense management
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [selectedFriendForExpense, setSelectedFriendForExpense] = useState<string | null>(null)
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState<string | null>(null)

  // Add state for create group dialog
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<string[]>([])
  
  // Initialize friends and groups from context if empty or use the initialData
  const [localFriends, setLocalFriends] = useState<Friend[]>(
    friends.length > 0 ? friends : initialData.friends
  )
  const [localGroups, setLocalGroups] = useState<Group[]>(
    groups.length > 0 ? groups : initialData.groups
  )

  // Update local state when context state changes
  useEffect(() => {
    if (friends.length > 0) setLocalFriends(friends)
  }, [friends])

  useEffect(() => {
    if (groups.length > 0) setLocalGroups(groups)
  }, [groups])
  
  const filteredFriends = localFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredGroups = localGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddFriend = async () => {
    if (!newFriendEmail) return
    
    try {
      await addFriend("", newFriendEmail)
      await getFriends()
      setNewFriendEmail("")
      setShowAddFriendDialog(false)
      toast.success("Friend request sent", {
        description: "They'll need to accept your request to start sharing expenses.",
      })
    } catch (error) {
      toast.error("Failed to add friend", {
        description: "Please check the email and try again.",
      })
    }
  }

  // New function to handle adding expense with a specific friend
  const handleAddExpense = (friendId: string) => {
    setSelectedFriendForExpense(friendId)
    setSelectedGroupForExpense(null) // Reset group selection
    setShowAddExpenseDialog(true)
  }
  
  // New function to handle adding expense to a group
  const handleAddGroupExpense = (groupId: string) => {
    setSelectedGroupForExpense(groupId)
    setSelectedFriendForExpense(null) // Reset friend selection
    setShowAddExpenseDialog(true)
  }
  
  // Handle successful expense creation
  const handleExpenseSaved = (data: any) => {
    setShowAddExpenseDialog(false)
    setSelectedFriendForExpense(null)
    setSelectedGroupForExpense(null)
    toast.success("Expense added", {
      description: `$${data.amount} for ${data.description} has been added.`,
    })
    
    // Refresh groups data to show updated expenses
    getGroups()
  }

  // Handle creating a new group
  const handleCreateGroup = async () => {
    if (!newGroupName) return
    
    try {
      await createGroup(newGroupName, newGroupDescription, selectedFriendsForGroup)
      
      // Reset form
      setNewGroupName("")
      setNewGroupDescription("")
      setSelectedFriendsForGroup([])
      setShowCreateGroupDialog(false)
      
      // Refresh groups
      await getGroups()
      
      toast.success("Group created", {
        description: `Group "${newGroupName}" has been created.`
      })
    } catch (error) {
      toast.error("Failed to create group", {
        description: "Please try again."
      })
    }
  }

  // Toggle friend selection for group creation
  const toggleFriendForGroup = (friendId: string) => {
    if (selectedFriendsForGroup.includes(friendId)) {
      setSelectedFriendsForGroup(selectedFriendsForGroup.filter((id) => id !== friendId))
    } else {
      setSelectedFriendsForGroup([...selectedFriendsForGroup, friendId])
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
          <p className="text-muted-foreground">Manage your friends and groups</p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === "friends" ? (
            <Button onClick={() => setShowAddFriendDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          ) : (
            <Button onClick={() => setShowCreateGroupDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="friends">
            <UserRound className="h-4 w-4 mr-2" />
            Friends ({isLoading ? "..." : filteredFriends.length})
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Groups ({isLoading ? "..." : filteredGroups.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends" className="mt-4 grid gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredFriends.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {filteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onAddExpense={() => handleAddExpense(friend.id)}
                  onSettleUp={() => {
                    // TODO: Implement settle up
                  }}
                />
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
              <UserCog className="h-8 w-8 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No friends found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? "No friends match your search. Try a different query."
                  : "Add friends to start sharing expenses with them."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowAddFriendDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Friend
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredGroups.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-col p-4 border rounded-lg mb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length} members • {group.totalExpenses ? `$${group.totalExpenses.toFixed(2)}` : '$0'} total
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAddGroupExpense(group.id)}
                        variant="outline" 
                        size="sm"
                        className="text-sm"
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        Add Expense
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {group.description && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {group.description}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Members:</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((memberId) => {
                        const member = localFriends.find(f => f.id === memberId)
                        // Include current user
                        const isCurrentUser = user && user._id === memberId
                        const displayName = isCurrentUser ? 'You' : (member ? member.name : 'Unknown')
                        
                        return (
                          <span 
                            key={memberId} 
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                          >
                            {displayName}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
              <Users className="h-8 w-8 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create a group to share expenses with multiple friends at once.
              </p>
              <Button onClick={() => setShowCreateGroupDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create a Group
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a friend</DialogTitle>
            <DialogDescription>
              Enter your friend's email to send them a friend request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="friend@example.com"
                type="email"
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddFriend} disabled={!newFriendEmail}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a new group</DialogTitle>
            <DialogDescription>
              Create a group to share expenses with multiple friends at once.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Vacation, Apartment, etc."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group-description">Description (optional)</Label>
              <Textarea
                id="group-description"
                placeholder="Add some details about this group..."
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Add Friends to Group</Label>
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                {localFriends.length > 0 ? (
                  localFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-2 py-2">
                      <Checkbox 
                        id={`friend-${friend.id}`} 
                        checked={selectedFriendsForGroup.includes(friend.id)}
                        onCheckedChange={() => toggleFriendForGroup(friend.id)}
                      />
                      <Label htmlFor={`friend-${friend.id}`} className="cursor-pointer">
                        {friend.name} ({friend.email})
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-2">
                    You don't have any friends yet. Add some first!
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGroupDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup} 
              disabled={!newGroupName || selectedFriendsForGroup.length === 0}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      {showAddExpenseDialog && (
        <AddExpenseDialog
          open={showAddExpenseDialog}
          onOpenChange={setShowAddExpenseDialog}
          onSave={handleExpenseSaved}
          initialSelectedFriends={selectedFriendForExpense ? [selectedFriendForExpense] : []}
          selectedGroupId={selectedGroupForExpense}
        />
      )}
    </div>
  )
}