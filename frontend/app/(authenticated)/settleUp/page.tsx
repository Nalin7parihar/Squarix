"use client";
import { useState, useEffect } from "react"
import { CreditCard, DollarSign, Wallet, Filter, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { toast } from "sonner"
import SummaryCard from "@/components/SummaryCard"
import PeopleCard from "@/components/PeopleCard"

interface Friend {
  id: number
  name: string
  email: string
  balance: number
  date: string
}

const friendsWhoOweYou: Friend[] = [
  { id: 1, name: "Alex Johnson", email: "alex.johnson@example.com", balance: 245.5, date: "2025-04-10" },
  { id: 3, name: "Jordan Lee", email: "jordan.lee@example.com", balance: 32.25, date: "2025-04-15" },
]

const friendsYouOwe: Friend[] = [
  { id: 2, name: "Taylor Smith", email: "taylor.smith@example.com", balance: 75.0, date: "2025-04-05" },
]

type TimeFilter = "all" | "today" | "week" | "month" | "year" | "custom";

export default function SettleUpPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all-transactions")
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [amount, setAmount] = useState("")

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSettleUp = (friend: Friend) => {
    setSelectedFriend(friend)
    setAmount(friend.balance.toString())
    setIsSettleDialogOpen(true)
  }

  const handlePayment = () => {
    if (!selectedFriend) return
    toast("Payment successful", {
      description: `You paid $${amount} to ${selectedFriend.name}.`,
      duration: 3000,
    })
    setIsSettleDialogOpen(false)
  }

  const handleRequestPayment = () => {
    if (!selectedFriend) return
    toast("Payment request sent", {
      description: `You requested $${amount} from ${selectedFriend.name}.`,
      duration: 3000,
    })
    setIsSettleDialogOpen(false)
  }

  const clearFilters = () => {
    setTimeFilter("all")
    setCustomDate(undefined)
  }

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      case "custom": return customDate ? format(customDate, "MMM d, yyyy") : "Select Date";
      default: return "All Time";
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settle Up</h1>
          <p className="text-muted-foreground">Pay your friends or request payments</p>
        </div>

        {/* Time Period Filter */}
        <div className="flex gap-2 mt-4 md:mt-0">
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center justify-between w-48">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>{getTimeFilterLabel()}</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-2 border-b">
                <div className="grid grid-cols-1 gap-1">
                  <Button 
                    variant={timeFilter === "all" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      setTimeFilter("all");
                      setShowCalendar(false);
                    }}
                  >
                    All Time
                  </Button>
                  <Button 
                    variant={timeFilter === "today" ? "default" : "ghost"}
                    className="justify-start" 
                    onClick={() => {
                      setTimeFilter("today");
                      setShowCalendar(false);
                    }}
                  >
                    Today
                  </Button>
                  <Button 
                    variant={timeFilter === "week" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      setTimeFilter("week");
                      setShowCalendar(false);
                    }}
                  >
                    This Week
                  </Button>
                  <Button 
                    variant={timeFilter === "month" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      setTimeFilter("month");
                      setShowCalendar(false);
                    }}
                  >
                    This Month
                  </Button>
                  <Button 
                    variant={timeFilter === "year" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      setTimeFilter("year");
                      setShowCalendar(false);
                    }}
                  >
                    This Year
                  </Button>
                  <Button 
                    variant={timeFilter === "custom" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setTimeFilter("custom")}
                  >
                    Custom Date
                  </Button>
                </div>
              </div>
              
              {timeFilter === "custom" && (
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={(date) => {
                    setCustomDate(date);
                    setShowCalendar(false);
                  }}
                  initialFocus
                />
              )}
            </PopoverContent>
          </Popover>
          
          {timeFilter !== "all" && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SummaryCard
          title="You Owe"
          description="Total amount you owe to friends"
          amount={friendsYouOwe.reduce((sum, f) => sum + f.balance, 0)}
          gradient="from-red-500/10 to-red-600/7"
        />
        <SummaryCard
          title="You Are Owed"
          description="Total amount owed to you"
          amount={friendsWhoOweYou.reduce((sum, f) => sum + f.balance, 0)}
          gradient="from-green-500/10 to-green-600/7"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="you-owe">You Owe</TabsTrigger>
          <TabsTrigger value="owed-to-you">Owed to You</TabsTrigger>
        </TabsList>

        <TabsContent value="all-transactions" className="mt-4 space-y-4">
          {friendsYouOwe.length > 0 && (
            <PeopleCard
              title="People You Owe"
              description="Your pending payments"
              isLoading={isLoading}
              friends={friendsYouOwe}
              type="you-owe"
              handleSettleUp={handleSettleUp}
            />
          )}
          {friendsWhoOweYou.length > 0 && (
            <PeopleCard
              title="People Who Owe You"
              description="Pending payments to receive"
              isLoading={isLoading}
              friends={friendsWhoOweYou}
              type="owed-to-you"
              handleSettleUp={handleSettleUp}
            />
          )}
          {friendsYouOwe.length === 0 && friendsWhoOweYou.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="you-owe" className="mt-4 space-y-4">
          {friendsYouOwe.length > 0 ? (
            <PeopleCard
              title="People You Owe"
              description="Pay your friends back"
              isLoading={isLoading}
              friends={friendsYouOwe}
              type="you-owe"
              handleSettleUp={handleSettleUp}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
              <p className="text-muted-foreground">No payments due</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="owed-to-you" className="mt-4 space-y-4">
          {friendsWhoOweYou.length > 0 ? (
            <PeopleCard
              title="People Who Owe You"
              description="Request payments from your friends"
              isLoading={isLoading}
              friends={friendsWhoOweYou}
              type="owed-to-you"
              handleSettleUp={handleSettleUp}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
              <p className="text-muted-foreground">No payments due to you</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "you-owe" ? "Pay" : "Request from"} {selectedFriend?.name}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "you-owe"
                ? "Choose a payment method and amount to settle up."
                : "Enter the amount you want to request."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            {activeTab === "you-owe" && (
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center"><CreditCard className="h-4 w-4 mr-2" /> Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center"><Wallet className="h-4 w-4 mr-2" /> Wallet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Bank</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={activeTab === "you-owe" ? handlePayment : handleRequestPayment}>
              {activeTab === "you-owe" ? "Pay" : "Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}