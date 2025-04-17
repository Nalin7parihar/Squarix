"use client"


import {useState, useEffect } from "react"
import {  UserRound, UserPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
interface Friend {
  id : number,
  name : string,
  email : string,
  totalOwed : number,
  totalOwes : number
}
// Sample friend data
const friendsData = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", totalOwed: 125.50, totalOwes: 0 },
  { id: 2, name: "Jamie Smith", email: "jamie@example.com", totalOwed: 0, totalOwes: 75.00 },
  { id: 3, name: "Taylor Wilson", email: "taylor@example.com", totalOwed: 45.75, totalOwes: 0 },
  { id: 4, name: "Morgan Lee", email: "morgan@example.com", totalOwed: 0, totalOwes: 12.25 },
  { id: 5, name: "Casey Brooks", email: "casey@example.com", totalOwed: 195.00, totalOwes: 0 },
]

 function FriendsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [friends, setFriends] = useState<Friend[]>(friendsData)
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const [newFriend, setNewFriend] = useState<Omit<Friend, "id" | "totalOwed" | "totalOwes">>({ name: "", email: "" })

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddFriend = () => {
    if (newFriend.name && newFriend.email) {
      const newFriendEntry = {
        id: friends.length + 1,
        name: newFriend.name,
        email: newFriend.email,
        totalOwed: 0,
        totalOwes: 0
      }
      
      setFriends([...friends, newFriendEntry])
      setNewFriend({ name: "", email: "" })
      setIsAddFriendOpen(false)
      
      toast("Friend added", {
        description: `${newFriend.name} has been added to your friends.`,
        duration: 3000
      })
    }
  }



  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
              <p className="text-muted-foreground">Manage your friends and view balances</p>
            </div>
            <Button
              onClick={() => setIsAddFriendOpen(true)}
              className="w-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 md:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </div>

          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search friends..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
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
              filteredFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} />
              ))
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
        </div>
      </main>

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
    </div>
  )
}

export default FriendsPage;