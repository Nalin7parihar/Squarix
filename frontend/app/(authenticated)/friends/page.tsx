"use client"

import { useState, useEffect } from "react"
import { UserRound, UserPlus, Search, Users, UserCog, DollarSign, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import FriendCard from "@/components/FriendCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Friend {
  id: number
  name: string
  email: string
  totalOwed: number
  totalOwes: number
}

interface GroupExpense {
  id: number
  description: string
  amount: number
  paidBy: number // Friend ID who paid
  date: string
  splitBetween: number[] // Friend IDs
}

interface GroupBalance {
  fromId: number
  toId: number
  amount: number
}

interface Group {
  id: number
  name: string
  description: string
  members: number[] // Friend IDs
  expenses: GroupExpense[]
  totalExpenses: number
}

// Sample friend data
const friendsData = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", totalOwed: 125.5, totalOwes: 0 },
  { id: 2, name: "Jamie Smith", email: "jamie@example.com", totalOwed: 0, totalOwes: 75.0 },
  { id: 3, name: "Taylor Wilson", email: "taylor@example.com", totalOwed: 45.75, totalOwes: 0 },
  { id: 4, name: "Morgan Lee", email: "morgan@example.com", totalOwed: 0, totalOwes: 12.25 },
  { id: 5, name: "Casey Brooks", email: "casey@example.com", totalOwed: 195.0, totalOwes: 0 },
]

// Sample group data with expenses
const groupsData = [
  {
    id: 1,
    name: "Roommates",
    description: "Apartment expenses",
    members: [1, 3, 4],
    expenses: [
      {
        id: 1,
        description: "Rent - May",
        amount: 1500,
        paidBy: 1,
        date: "2023-05-01",
        splitBetween: [1, 3, 4],
      },
      {
        id: 2,
        description: "Groceries",
        amount: 120,
        paidBy: 3,
        date: "2023-05-10",
        splitBetween: [1, 3, 4],
      },
      {
        id: 3,
        description: "Utilities",
        amount: 90,
        paidBy: 4,
        date: "2023-05-15",
        splitBetween: [1, 3, 4],
      },
    ],
    totalExpenses: 1710,
  },
  {
    id: 2,
    name: "Trip to NYC",
    description: "Vacation expenses",
    members: [2, 5],
    expenses: [
      {
        id: 1,
        description: "Hotel",
        amount: 800,
        paidBy: 5,
        date: "2023-06-01",
        splitBetween: [2, 5],
      },
      {
        id: 2,
        description: "Dinner",
        amount: 150,
        paidBy: 2,
        date: "2023-06-02",
        splitBetween: [2, 5],
      },
    ],
    totalExpenses: 950,
  },
]

function FriendsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("friends")
  const [friends, setFriends] = useState<Friend[]>(friendsData)
  const [groups, setGroups] = useState<Group[]>(groupsData)

  // Dialog states
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [isAddToGroupOpen, setIsAddToGroupOpen] = useState(false)

  // Form states
  const [newFriend, setNewFriend] = useState<Omit<Friend, "id" | "totalOwed" | "totalOwes">>({ name: "", email: "" })
  const [newGroup, setNewGroup] = useState<Omit<Group, "id" | "members" | "expenses" | "totalExpenses">>({
    name: "",
    description: "",
  })
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([])

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Filter friends based on search term
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter groups based on search term
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddFriend = () => {
    if (newFriend.name && newFriend.email) {
      const newFriendEntry = {
        id: friends.length + 1,
        name: newFriend.name,
        email: newFriend.email,
        totalOwed: 0,
        totalOwes: 0,
      }

      setFriends([...friends, newFriendEntry])
      setNewFriend({ name: "", email: "" })
      setIsAddFriendOpen(false)

      toast("Friend added", {
        description: `${newFriend.name} has been added to your friends.`,
        duration: 3000,
      })
    }
  }

  const handleAddGroup = () => {
    if (newGroup.name) {
      const newGroupEntry = {
        id: groups.length + 1,
        name: newGroup.name,
        description: newGroup.description,
        members: [],
        expenses: [],
        totalExpenses: 0,
      }

      setGroups([...groups, newGroupEntry])
      setNewGroup({ name: "", description: "" })
      setIsAddGroupOpen(false)

      toast("Group created", {
        description: `${newGroup.name} has been created.`,
        duration: 3000,
      })
    }
  }

  const handleAddToGroup = () => {
    if (selectedGroupId && selectedFriendIds.length > 0) {
      const updatedGroups = groups.map((group) => {
        if (group.id === selectedGroupId) {
          // Add only new members that aren't already in the group
          const updatedMembers = [...new Set([...group.members, ...selectedFriendIds])]
          return { ...group, members: updatedMembers }
        }
        return group
      })

      setGroups(updatedGroups)
      setSelectedGroupId(null)
      setSelectedFriendIds([])
      setIsAddToGroupOpen(false)

      const groupName = groups.find((g) => g.id === selectedGroupId)?.name
      toast("Members added", {
        description: `${selectedFriendIds.length} member(s) added to ${groupName}.`,
        duration: 3000,
      })
    }
  }

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId],
    )
  }

  const openAddToGroupDialog = () => {
    setSelectedFriendIds([])
    setSelectedGroupId(groups.length > 0 ? groups[0].id : null)
    setIsAddToGroupOpen(true)
  }

  const getFriendById = (id: number) => {
    return friends.find((friend) => friend.id === id)
  }

  // Calculate balances for a group
  const calculateGroupBalances = (group: Group): GroupBalance[] => {
    // Create a map to track how much each person has paid and owes
    const balances = new Map<number, number>()

    // Initialize balances for all members
    group.members.forEach((memberId) => {
      balances.set(memberId, 0)
    })

    // Calculate net balance for each member
    group.expenses.forEach((expense) => {
      const payer = expense.paidBy
      const splitCount = expense.splitBetween.length
      const amountPerPerson = expense.amount / splitCount

      // Add the full amount to the payer
      balances.set(payer, (balances.get(payer) || 0) + expense.amount)

      // Subtract each person's share
      expense.splitBetween.forEach((memberId) => {
        balances.set(memberId, (balances.get(memberId) || 0) - amountPerPerson)
      })
    })

    // Convert to a list of who owes whom
    const result: GroupBalance[] = []

    // Create a list of members with negative balances (they owe money)
    const debtors = Array.from(balances.entries())
      .filter(([_, balance]) => balance < 0)
      .map(([id, balance]) => ({ id, balance: Math.abs(balance) }))

    // Create a list of members with positive balances (they are owed money)
    const creditors = Array.from(balances.entries())
      .filter(([_, balance]) => balance > 0)
      .map(([id, balance]) => ({ id, balance }))

    // Match debtors with creditors
    debtors.forEach((debtor) => {
      let remainingDebt = debtor.balance

      for (let i = 0; i < creditors.length && remainingDebt > 0.01; i++) {
        const creditor = creditors[i]

        if (creditor.balance > 0.01) {
          // Calculate how much of this debt can be settled with this creditor
          const amount = Math.min(remainingDebt, creditor.balance)

          // Add to result
          result.push({
            fromId: debtor.id,
            toId: creditor.id,
            amount: Number.parseFloat(amount.toFixed(2)),
          })

          // Update remaining amounts
          remainingDebt -= amount
          creditors[i].balance -= amount
        }
      }
    })

    return result
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Friends & Groups</h1>
              <p className="text-muted-foreground">Manage your friends, groups and view balances</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => setIsAddFriendOpen(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 md:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
              <Button onClick={() => setIsAddGroupOpen(true)} variant="outline" className="w-full md:w-auto">
                <Users className="mr-2 h-4 w-4" />
                Create Group
              </Button>
              {groups.length > 0 && (
                <Button onClick={openAddToGroupDialog} variant="secondary" className="w-full md:w-auto">
                  <UserCog className="mr-2 h-4 w-4" />
                  Add to Group
                </Button>
              )}
            </div>
          </div>

          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4">
              <div className="grid gap-4">
                {isLoading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => <FriendCard key={friend.id} friend={friend} />)
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center text-center">
                      <UserRound className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No friends found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm ? "Try a different search term" : "Add friends to get started"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              <div className="grid gap-4">
                {isLoading ? (
                  Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-40" />
                              </div>
                            </div>
                            <Skeleton className="h-20 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => {
                    const groupBalances = calculateGroupBalances(group)

                    return (
                      <Card key={group.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium">{group.name}</h3>
                                  <p className="text-sm text-muted-foreground">{group.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>Total: {formatCurrency(group.totalExpenses)}</span>
                                </Badge>
                                <span className="text-sm text-muted-foreground mt-1">
                                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                                </span>
                              </div>
                            </div>

                            <div className="rounded-md border p-4">
                              <h4 className="mb-2 text-sm font-medium">Members</h4>
                              {group.members.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {group.members.map((memberId) => {
                                    const member = getFriendById(memberId)
                                    return member ? (
                                      <div
                                        key={memberId}
                                        className="flex items-center rounded-full bg-secondary px-3 py-1 text-xs"
                                      >
                                        <span>{member.name}</span>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No members yet</p>
                              )}
                            </div>

                            {groupBalances.length > 0 && (
                              <div className="rounded-md border p-4">
                                <h4 className="mb-2 text-sm font-medium">Balances</h4>
                                <div className="space-y-2">
                                  {groupBalances.map((balance, index) => {
                                    const from = getFriendById(balance.fromId)
                                    const to = getFriendById(balance.toId)

                                    return from && to ? (
                                      <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{from.name}</span>
                                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                          <span className="font-medium">{to.name}</span>
                                        </div>
                                        <Badge variant="secondary">{formatCurrency(balance.amount)}</Badge>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}

                            {group.expenses.length > 0 && (
                              <div className="rounded-md border p-4">
                                <h4 className="mb-2 text-sm font-medium">Recent Expenses</h4>
                                <div className="space-y-2">
                                  {group.expenses.slice(0, 3).map((expense) => {
                                    const paidBy = getFriendById(expense.paidBy)

                                    return (
                                      <div key={expense.id} className="flex items-center justify-between text-sm">
                                        <div>
                                          <span className="font-medium">{expense.description}</span>
                                          <div className="text-xs text-muted-foreground">
                                            Paid by {paidBy?.name} • {new Date(expense.date).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <Badge>{formatCurrency(expense.amount)}</Badge>
                                      </div>
                                    )
                                  })}
                                  {group.expenses.length > 3 && (
                                    <Button variant="link" className="text-xs p-0 h-auto">
                                      View all {group.expenses.length} expenses
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed">
                    <div className="flex flex-col items-center text-center">
                      <Users className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No groups found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {searchTerm ? "Try a different search term" : "Create a group to get started"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Friend Dialog */}
      <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
            <DialogDescription>
              Enter your friend's details to add them to your expense sharing network.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Enter friend's name"
                value={newFriend.name}
                onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter friend's email"
                value={newFriend.email}
                onChange={(e) => setNewFriend({ ...newFriend, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFriendOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFriend}>Add Friend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
            <DialogDescription>Create a new group to manage shared expenses with multiple friends.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="group-name" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="group-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                id="group-description"
                placeholder="Enter group description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Group Dialog */}
      <Dialog open={isAddToGroupOpen} onOpenChange={setIsAddToGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Group</DialogTitle>
            <DialogDescription>Select friends to add to a group.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="select-group" className="text-sm font-medium">
                Select Group
              </label>
              <Select
                value={selectedGroupId?.toString() || ""}
                onValueChange={(value) => setSelectedGroupId(Number.parseInt(value))}
              >
                <SelectTrigger id="select-group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Friends</label>
              <ScrollArea className="h-60 rounded-md border p-4">
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`friend-${friend.id}`}
                        checked={selectedFriendIds.includes(friend.id)}
                        onCheckedChange={() => toggleFriendSelection(friend.id)}
                      />
                      <label
                        htmlFor={`friend-${friend.id}`}
                        className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                      >
                        <span>{friend.name}</span>
                        <span className="text-muted-foreground">{friend.email}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddToGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToGroup} disabled={!selectedGroupId || selectedFriendIds.length === 0}>
              Add to Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FriendsPage
