"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  IndianRupee,
  Wallet,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Import components and functions from client.tsx
import SummaryCard from "@/components/SummaryCard";
import PeopleCard from "@/components/PeopleCard";
import { FriendBalances } from "@/components/friend-balances";
import { Friend, fetchTransactions, settleTransaction, requestPayment } from "./client";

type TimeFilter = "all" | "today" | "week" | "month" | "year" | "custom";
type SettleType = "you-owe" | "owed-to-you" | null;

export default function SettleUpPage() {
  // State for UI elements and interactions
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all-transactions");
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [settleType, setSettleType] = useState<SettleType>(null);

  // State for Filters
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // State to hold data received from backend
  const [displayedYouOwe, setDisplayedYouOwe] = useState<Friend[]>([]);
  const [displayedOwedToYou, setDisplayedOwedToYou] = useState<Friend[]>([]);
  const [totalYouOwe, setTotalYouOwe] = useState(0);
  const [totalOwedToYou, setTotalOwedToYou] = useState(0);

  // Fetch data from the API
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTransactions(
          activeTab, 
          timeFilter, 
          timeFilter === 'custom' ? customDate : undefined
        );
        
        setDisplayedYouOwe(data.youOwe);
        setDisplayedOwedToYou(data.owedToYou);
        setTotalYouOwe(data.youOweTotal);
        setTotalOwedToYou(data.owedToYouTotal);
      } catch (error) {
        console.error("Failed to load transactions:", error);
        toast.error("Error loading transactions");
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [activeTab, timeFilter, customDate]);

  const handleSettleUp = (friend: Friend, type: SettleType) => {
    setSelectedFriend(friend);
    setAmount(friend.balance.toString());
    setSettleType(type);
    setIsSettleDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedFriend?.transactionId) return;
    
    setIsLoading(true);
    try {
      await settleTransaction(selectedFriend.transactionId, paymentMethod);
      // Refresh data after successful payment
      const data = await fetchTransactions(
        activeTab, 
        timeFilter, 
        timeFilter === 'custom' ? customDate : undefined
      );
      
      setDisplayedYouOwe(data.youOwe);
      setDisplayedOwedToYou(data.owedToYou);
      setTotalYouOwe(data.youOweTotal);
      setTotalOwedToYou(data.owedToYouTotal);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsSettleDialogOpen(false);
      setSelectedFriend(null);
      setSettleType(null);
      setIsLoading(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!selectedFriend?.transactionId) return;
    
    setIsLoading(true);
    try {
      await requestPayment(selectedFriend.transactionId);
      // No need to refresh data as request doesn't change balances
    } catch (error) {
      console.error("Payment request failed:", error);
    } finally {
      setIsSettleDialogOpen(false);
      setSelectedFriend(null);
      setSettleType(null);
      setIsLoading(false);
    }
  };

  const clearTimeFilter = () => {
    setTimeFilter("all");
    setCustomDate(undefined);
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      case "custom": return customDate ? format(customDate, "MMM d, yyyy") : "Select Date";
      default: return "All Time";
    }
  };

  return (
    <div className="grid gap-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settle Up</h1>
          <p className="text-muted-foreground">Manage your pending payments and requests</p>
        </div>

        {/* Time Period Filter UI */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center justify-between w-48">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>{getTimeFilterLabel()}</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-2 border-b">
                <div className="grid grid-cols-1 gap-1">
                   {/* Buttons for predefined filters */}
                   {(["all", "today", "week", "month", "year"] as TimeFilter[]).map((filter) => (
                    <Button
                        key={filter}
                        variant={timeFilter === filter ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                            setTimeFilter(filter);
                            setCustomDate(undefined);
                            setShowCalendar(false);
                        }}
                    >
                        {filter === 'all' ? 'All Time' : `This ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                    </Button>
                   ))}
                  <Button
                    variant={timeFilter === "custom" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                        setTimeFilter("custom");
                    }}
                  >
                    Custom Date
                  </Button>
                </div>
              </div>

              {/* Calendar for Custom Date */}
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

          {/* Clear Time Filter Button */}
          {timeFilter !== "all" && (
            <Button variant="ghost" size="icon" onClick={clearTimeFilter} title="Clear time filter">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Clear time filter</span>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <SummaryCard
          title="You Owe"
          description="Total amount you currently owe"
          amount={totalYouOwe}
          gradient="from-red-500/10 to-red-600/7"
        />
        <SummaryCard
          title="You Are Owed"
          description="Total amount currently owed to you"
          amount={totalOwedToYou}
          gradient="from-green-500/10 to-green-600/7"
        />
      </div>

      {/* Tabs for viewing different categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-transactions">All</TabsTrigger>
          <TabsTrigger value="you-owe">You Owe ({isLoading ? '...' : displayedYouOwe.length})</TabsTrigger>
          <TabsTrigger value="owed-to-you">Owed to You ({isLoading ? '...' : displayedOwedToYou.length})</TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="all-transactions" className="mt-4 space-y-4">
          {/* Friend Balances component */}
          <FriendBalances isLoading={isLoading} />
          
          {!isLoading && displayedYouOwe.length === 0 && displayedOwedToYou.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
              <p className="text-muted-foreground">No transactions found for the current filter</p>
            </div>
          )}
           {isLoading && (
             <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
               <p className="text-muted-foreground">Loading transactions...</p>
             </div>
           )}
        </TabsContent>

        <TabsContent value="you-owe" className="mt-4 space-y-4">
          {displayedYouOwe.length > 0 ? (
            <PeopleCard
              title="People You Owe"
              description="Pay your friends back"
              isLoading={isLoading}
              friends={displayedYouOwe}
              type="you-owe"
              handleSettleUp={(friend: Friend) => handleSettleUp(friend, "you-owe")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
              <p className="text-muted-foreground">
                {isLoading ? "Loading..." : "No payments due matching the current filter"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="owed-to-you" className="mt-4 space-y-4">
          {displayedOwedToYou.length > 0 ? (
            <PeopleCard
              title="People Who Owe You"
              description="Request payments from your friends"
              isLoading={isLoading}
              friends={displayedOwedToYou}
              type="owed-to-you"
              handleSettleUp={(friend: Friend) => handleSettleUp(friend, "owed-to-you")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
               <p className="text-muted-foreground">
                {isLoading ? "Loading..." : "No payments due to you matching the current filter"}
               </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Settle Up Dialog */}
      <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {settleType === "you-owe" ? "Pay" : "Request from"} {selectedFriend?.name}
            </DialogTitle>
            <DialogDescription>
              {settleType === "you-owe"
                ? "Choose a payment method and amount to settle up."
                : "Enter the amount you want to request."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            {settleType === "you-owe" && (
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer"><CreditCard className="h-4 w-4 mr-2" /> Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center cursor-pointer"><Wallet className="h-4 w-4 mr-2" /> Wallet</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center cursor-pointer"><IndianRupee className="h-4 w-4 mr-2" /> Bank</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={settleType === "you-owe" ? handlePayment : handleRequestPayment}
              disabled={isLoading}
            >
              {settleType === "you-owe" ? "Pay" : "Request"} ₹{amount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}