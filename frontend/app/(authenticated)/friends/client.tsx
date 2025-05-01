"use client"

import { useState, useEffect } from "react"
import { UserRound, UserPlus, Search, Users, UserCog, DollarSign, ArrowRight } from "lucide-react"
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
  members: string[]  // Changed from Friend[] to string[]
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
  const { friends, groups, isLoading, addFriend, getFriends } = useFriends()
  
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
          <Button onClick={() => setShowAddFriendDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
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
                  onAddExpense={() => {
                    // TODO: Implement add expense
                  }}
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
                  className="flex items-center justify-between p-4 border rounded-lg mb-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Create a Group
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  )
}