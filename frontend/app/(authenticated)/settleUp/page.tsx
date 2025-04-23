"use client";

import { useState, useEffect } from "react"; // Removed useMemo
import {
  CreditCard,
  DollarSign,
  Wallet,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { format, parseISO } from "date-fns"; // Keep format for display, parseISO might be needed if data needs initial parsing
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

// Assuming these components exist and accept the props shown
import SummaryCard from "@/components/SummaryCard";
import PeopleCard from "@/components/PeopleCard"; // Assuming PeopleCard takes Friend[]

// Define the Friend type clearly
interface Friend {
  id: number;
  name: string;
  email: string;
  balance: number;
  date: string; // Expecting ISO string format (YYYY-MM-DD) from backend eventually
}

// Example Static Data (Representing data that *would* come from the backend)
// In a real app, these would likely be fetched and stored in state.
const friendsWhoOweYouData: Friend[] = [
  { id: 1, name: "Alex Johnson", email: "alex.johnson@example.com", balance: 245.5, date: "2025-04-10" },
  { id: 3, name: "Jordan Lee", email: "jordan.lee@example.com", balance: 32.25, date: "2025-04-22" },
  { id: 4, name: "Casey Doe", email: "casey.doe@example.com", balance: 15.0, date: format(new Date(), 'yyyy-MM-dd') },
];

const friendsYouOweData: Friend[] = [
  { id: 2, name: "Taylor Smith", email: "taylor.smith@example.com", balance: 75.0, date: "2025-03-15" },
  { id: 5, name: "Morgan Riley", email: "morgan.riley@example.com", balance: 50.0, date: "2024-12-20" },
];

type TimeFilter = "all" | "today" | "week" | "month" | "year" | "custom";
type SettleType = "you-owe" | "owed-to-you" | null;

export default function SettleUpPage() {
  // State for UI elements and interactions
  const [isLoading, setIsLoading] = useState(true); // For loading indicators
  const [activeTab, setActiveTab] = useState("all-transactions"); // Controls which tab is visible
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [settleType, setSettleType] = useState<SettleType>(null);

  // State for Filters (to be sent to backend)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // State to hold data received from backend (initially empty or with static data for demo)
  // We use the static data directly for now, but this shows where fetched data would go.
  const [displayedYouOwe, setDisplayedYouOwe] = useState<Friend[]>(friendsYouOweData);
  const [displayedOwedToYou, setDisplayedOwedToYou] = useState<Friend[]>(friendsWhoOweYouData);


  // --- TODO: Backend Data Fetching ---
  // This useEffect would trigger when filters change.
  // It would call an API endpoint with the current filter values
  // and update displayedYouOwe/displayedOwedToYou state with the response.
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log("Fetching data with filters:", { activeTab, timeFilter, customDate: customDate ? format(customDate, 'yyyy-MM-dd') : null });

      // --- Replace with actual API call ---
      // Example: const response = await fetch(`/api/settle-up?tab=${activeTab}&time=${timeFilter}&date=${customDate ? format(customDate, 'yyyy-MM-dd') : ''}`);
      // const data = await response.json();
      // setDisplayedYouOwe(data.youOwe);
      // setDisplayedOwedToYou(data.owedToYou);
      // --- End Replace ---

      // Simulate API delay and use static data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demonstration, we just reset to the static data.
      // In reality, the backend would return filtered data based on the console log above.
      setDisplayedYouOwe(friendsYouOweData);
      setDisplayedOwedToYou(friendsWhoOweYouData);

      setIsLoading(false);
    };

    fetchData();
  // Dependencies: Fetch data when activeTab or time filters change
  }, [activeTab, timeFilter, customDate]);
  // --- End Backend Data Fetching ---


  const handleSettleUp = (friend: Friend, type: SettleType) => {
    setSelectedFriend(friend);
    setAmount(friend.balance.toString());
    setSettleType(type);
    setIsSettleDialogOpen(true);
  };

  const handlePayment = () => {
    if (!selectedFriend) return;
    // TODO: Add actual API call to backend to process payment
    console.log("Processing payment:", { friend: selectedFriend.id, amount, paymentMethod });
    toast("Payment successful (Simulation)", {
      description: `You paid $${amount} to ${selectedFriend.name}.`,
      duration: 3000,
    });
    // TODO: Refetch data or update state locally after successful payment
    setIsSettleDialogOpen(false);
    setSelectedFriend(null);
    setSettleType(null);
  };

  const handleRequestPayment = () => {
    if (!selectedFriend) return;
     // TODO: Add actual API call to backend to send payment request
    console.log("Sending request:", { friend: selectedFriend.id, amount });
    toast("Payment request sent (Simulation)", {
      description: `You requested $${amount} from ${selectedFriend.name}.`,
      duration: 3000,
    });
    // TODO: Refetch data or update state locally after successful request
    setIsSettleDialogOpen(false);
    setSelectedFriend(null);
    setSettleType(null);
  };

  const clearTimeFilter = () => {
    setTimeFilter("all");
    setCustomDate(undefined);
    // Data fetching useEffect will trigger automatically due to state change
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      case "custom": return customDate ? format(customDate, "MMM d,opencamerastudio") : "Select Date";
      default: return "All Time";
    }
  };

  // Calculate summary totals based on the *currently displayed* data
  // (which, for now, is the static data until backend integration)
  const totalYouOwe = displayedYouOwe.reduce((sum, f) => sum + f.balance, 0);
  const totalOwedToYou = displayedOwedToYou.reduce((sum, f) => sum + f.balance, 0);

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
                            setTimeFilter(filter); // Set filter state
                            setCustomDate(undefined);
                            setShowCalendar(false);
                            // Data fetching useEffect will trigger
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
                        // Keep calendar open for date selection
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
                    setCustomDate(date); // Set filter state
                    setShowCalendar(false);
                    // Data fetching useEffect will trigger
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

      {/* Summary Cards - Display totals based on 'displayed' data */}
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
      <Tabs value={activeTab} onValueChange={setActiveTab /* Fetching useEffect depends on this */}>
        <TabsList className="grid w-full grid-cols-3">
           {/* Counts show length of currently displayed data */}
          <TabsTrigger value="all-transactions">All</TabsTrigger>
          <TabsTrigger value="you-owe">You Owe ({isLoading ? '...' : displayedYouOwe.length})</TabsTrigger>
          <TabsTrigger value="owed-to-you">Owed to You ({isLoading ? '...' : displayedOwedToYou.length})</TabsTrigger>
        </TabsList>

        {/* Tab Content - Display data from 'displayed' state */}
        <TabsContent value="all-transactions" className="mt-4 space-y-4">
          {displayedYouOwe.length > 0 && (
            <PeopleCard
              title="People You Owe"
              description="Your pending payments"
              isLoading={isLoading}
              friends={displayedYouOwe} // Use state variable
              type="you-owe"
              // Fix: Explicitly type 'friend' parameter here
              handleSettleUp={(friend: Friend) => handleSettleUp(friend, "you-owe")}
            />
          )}
          {displayedOwedToYou.length > 0 && (
            <PeopleCard
              title="People Who Owe You"
              description="Pending payments to receive"
              isLoading={isLoading}
              friends={displayedOwedToYou} // Use state variable
              type="owed-to-you"
               // Fix: Explicitly type 'friend' parameter here
              handleSettleUp={(friend: Friend) => handleSettleUp(friend, "owed-to-you")}
            />
          )}
          {!isLoading && displayedYouOwe.length === 0 && displayedOwedToYou.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 border rounded-lg">
              <p className="text-muted-foreground">No transactions found for the current filter</p>
            </div>
          )}
           {isLoading && ( // Optional: Show a loading state for the whole section
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
              friends={displayedYouOwe} // Use state variable
              type="you-owe"
               // Fix: Explicitly type 'friend' parameter here
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
              friends={displayedOwedToYou} // Use state variable
              type="owed-to-you"
               // Fix: Explicitly type 'friend' parameter here
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

      {/* Settle Up Dialog - Logic remains mostly the same */}
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
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
                   {/* Radio items */}
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
                    <Label htmlFor="bank" className="flex items-center cursor-pointer"><DollarSign className="h-4 w-4 mr-2" /> Bank</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          <DialogFooter>
             {/* Disable button while processing? */}
            <Button onClick={settleType === "you-owe" ? handlePayment : handleRequestPayment}>
              {settleType === "you-owe" ? "Pay" : "Request"} ${amount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}