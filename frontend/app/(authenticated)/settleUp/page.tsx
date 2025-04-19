"use client"

import { useState, useEffect } from "react"
import { CreditCard, DollarSign, Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import SummaryCard from "@/components/SummaryCard"
import PeopleCard from "@/components/PeopleCard"
const friendsWhoOweYou = [
  { id: 1, name: "Alex Johnson", email: "alex.johnson@example.com", balance: 245.5 },
  { id: 3, name: "Jordan Lee", email: "jordan.lee@example.com", balance: 32.25 },
]

const friendsYouOwe = [
  { id: 2, name: "Taylor Smith", email: "taylor.smith@example.com", balance: 75.0 },
]

export default function SettleUpPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("you-owe")
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSettleUp = (friend: any) => {
    setSelectedFriend(friend)
    setAmount(friend.balance.toString())
    setIsSettleDialogOpen(true)
  }

  const handlePayment = () => {
    toast("Payment successful", {
      description: `You paid $${amount} to ${selectedFriend.name}.`,
      duration: 3000,
    })
    setIsSettleDialogOpen(false)
  }

  const handleRequestPayment = () => {
    toast("Payment request sent", {
      description: `You requested $${amount} from ${selectedFriend.name}.`,
      duration: 3000,
    })
    setIsSettleDialogOpen(false)
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settle Up</h1>
          <p className="text-muted-foreground">Pay your friends or request payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <SummaryCard title="You Owe" description="Total amount you owe to friends" amount={75.0} gradient="from-red-500/10 to-red-600/7" />
        <SummaryCard title="You Are Owed" description="Total amount owed to you" amount={277.75} gradient="from-green-500/10 to-green-600/7" />
      </div>

      <Tabs defaultValue="you-owe" value={activeTab} onValueChange={setActiveTab} className="animate-in fade-in duration-500">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="you-owe">You Owe</TabsTrigger>
          <TabsTrigger value="owed-to-you">Owed to You</TabsTrigger>
        </TabsList>

        <TabsContent value="you-owe" className="mt-4 animate-in slide-in-from-left-4 duration-300">
          <PeopleCard
            title="People You Owe"
            description="Pay your friends back"
            isLoading={isLoading}
            friends={friendsYouOwe}
            type="you-owe"
            handleSettleUp={handleSettleUp}
          />
        </TabsContent>

        <TabsContent value="owed-to-you" className="mt-4 animate-in slide-in-from-right-4 duration-300">
          <PeopleCard
            title="People Who Owe You"
            description="Request payments from your friends"
            isLoading={isLoading}
            friends={friendsWhoOweYou}
            type="owed-to-you"
            handleSettleUp={handleSettleUp}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isSettleDialogOpen} onOpenChange={setIsSettleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "you-owe" ? "Pay" : "Request payment from"} {selectedFriend?.name}
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
                  <RadioGroupItem value="card" id="card" />
                  <Label> <CreditCard /></Label>
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label><Wallet/></Label>
                  <RadioGroupItem value="bank" id="bank" />
                  <Label><DollarSign /></Label>
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




