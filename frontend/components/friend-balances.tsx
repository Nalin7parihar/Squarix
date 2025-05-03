"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useTransactions } from "@/contexts/TransactionContext"
import { fetchTransactions } from "@/app/(authenticated)/settleUp/client"
import PeopleCard from "./PeopleCard"
import { PaymentDialog } from "./payment-dialog"

interface FriendBalancesProps {
  isLoading?: boolean
  initialBalances?: Array<{
    id: string
    name: string
    email?: string
    balance: number
  }>
}

export function FriendBalances({ isLoading = false, initialBalances }: FriendBalancesProps) {
  const router = useRouter()
  const { summary } = useTransactions()
  const [youOweData, setYouOweData] = useState<any[]>([])
  const [owedToYouData, setOwedToYouData] = useState<any[]>([])
  const [loading, setLoading] = useState(isLoading)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<any>(null)

  // Fetch transaction data
  useEffect(() => {
    const getTransactionData = async () => {
      setLoading(true)
      try {
        // Use the fetchTransactions function from the settleUp client
        const data = await fetchTransactions('all-transactions', 'all')
        setYouOweData(data.youOwe)
        setOwedToYouData(data.owedToYou)
      } catch (error) {
        console.error("Failed to load transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    getTransactionData()
  }, [])

  // Handle opening the payment dialog
  const handlePayNow = (friend: any) => {
    setSelectedFriend(friend)
    setIsPaymentDialogOpen(true)
  }

  // Navigate to SettleUp page for "View All" or "Request" actions
  const handleSettleUp = (friend?: any) => {
    if (friend) {
      // For "Request" button in the "People Who Owe You" section
      router.push('/settleUp?tab=owed')
    } else {
      // For "View All" button
      router.push('/settleUp')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If there are no transactions at all, show a message
  if (youOweData.length === 0 && owedToYouData.length === 0) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader>
          <CardTitle>Friend Balances</CardTitle>
          <CardDescription>Your current balances with friends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No transactions found</p>
            <button 
              onClick={handleSettleUp}
              className="mt-4 text-primary hover:underline"
            >
              View all transactions
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Display "You Owe" transactions if available */}
      {youOweData.length > 0 && (
        <PeopleCard
          title="People You Owe"
          description="Your pending payments"
          isLoading={false}
          friends={youOweData}
          type="you-owe"
          handleSettleUp={handlePayNow}
        />
      )}

      {/* Display "Owed To You" transactions if available */}
      {owedToYouData.length > 0 && (
        <PeopleCard
          title="People Who Owe You"
          description="Pending payments to receive"
          isLoading={false}
          friends={owedToYouData}
          type="owed-to-you"
          handleSettleUp={handleSettleUp}
        />
      )}

      {/* Payment Dialog */}
      {selectedFriend && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          friend={selectedFriend}
        />
      )}
    </div>
  )
}
