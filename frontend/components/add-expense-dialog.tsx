"use client"

import { useState } from "react"
import { CalendarIcon, Receipt, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Sample data for friends
const friends = [
  { id: 1, name: "Alex Johnson" },
  { id: 2, name: "Taylor Smith" },
  { id: 3, name: "Jordan Lee" },
  { id: 4, name: "Casey Wilson" },
]

// Sample data for expense categories
const categories = [
  { id: 1, name: "Food & Drink" },
  { id: 2, name: "Groceries" },
  { id: 3, name: "Rent" },
  { id: 4, name: "Utilities" },
  { id: 5, name: "Entertainment" },
  { id: 6, name: "Transportation" },
  { id: 7, name: "Other" },
]

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: any) => void
}

export function AddExpenseDialog({ open, onOpenChange, onSave }: AddExpenseDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedFriends, setSelectedFriends] = useState<number[]>([1, 2])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("1")
  const [paidBy, setPaidBy] = useState("you")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleFriend = (friendId: number) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId))
    } else {
      setSelectedFriends([...selectedFriends, friendId])
    }
  }

  const handleSave = () => {
    if (!description || !amount) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const data = {
        description,
        amount,
        date,
        category: categories.find((c) => c.id.toString() === category)?.name,
        paidBy: paidBy === "you" ? "You" : friends.find((f) => f.id.toString() === paidBy)?.name,
        participants: selectedFriends.map((id) => friends.find((f) => f.id === id)?.name || ""),
      }

      if (onSave) onSave(data)

      // Reset form
      setDescription("")
      setAmount("")
      setDate(new Date())
      setCategory("1")
      setPaidBy("you")
      setSelectedFriends([1, 2])
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a new expense</DialogTitle>
          <DialogDescription>Enter the details of your shared expense</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                className="pl-7 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal transition-all duration-200 hover:bg-primary/10",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="transition-all duration-200 hover:bg-primary/10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Split with</Label>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {friends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-all duration-200",
                      selectedFriends.includes(friend.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-primary/5",
                    )}
                    onClick={() => toggleFriend(friend.id)}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={`/placeholder.svg?height=20&width=20`} alt={friend.name} />
                      <AvatarFallback className="text-[10px]">
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{friend.name}</span>
                    {selectedFriends.includes(friend.id) && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <X className="ml-1 h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="transition-all duration-200 hover:bg-primary/10">
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="you">You</SelectItem>
                {friends.map((friend) => (
                  <SelectItem key={friend.id} value={friend.id.toString()}>
                    {friend.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="receipt"
              className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label htmlFor="receipt" className="text-sm font-normal cursor-pointer">
              <div className="flex items-center gap-1">
                <Receipt className="h-4 w-4" />
                Add a receipt image
              </div>
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !description || !amount}
            className="relative bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 hover:shadow-md hover:shadow-primary/20"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Expense"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
