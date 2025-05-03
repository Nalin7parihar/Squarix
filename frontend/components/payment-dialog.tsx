"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTransactions } from "@/contexts/TransactionContext"
import { toast } from "sonner"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  friend: {
    name: string
    balance: number
    transactionId: string
  }
}

export function PaymentDialog({ open, onOpenChange, friend }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { settleTransaction } = useTransactions()

  const handlePayment = async () => {
    if (!friend.transactionId) {
      toast.error("Invalid transaction")
      return
    }

    setIsSubmitting(true)
    try {
      await settleTransaction(friend.transactionId, paymentMethod)
      onOpenChange(false)
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay {friend.name}</DialogTitle>
          <DialogDescription>
            Complete your payment of ${friend.balance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <RadioGroup 
              id="payment-method"
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="card" id="card" className="sr-only peer" />
                <Label 
                  htmlFor="card" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  Card
                </Label>
              </div>
              <div>
                <RadioGroupItem value="paypal" id="paypal" className="sr-only peer" />
                <Label 
                  htmlFor="paypal" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d="M7 11a4 4 0 0 0 4 4h1a4 4 0 0 0 0-8h-5" />
                    <path d="M17 7a4 4 0 0 0-4 4h-1a4 4 0 0 0 0 8h5" />
                  </svg>
                  PayPal
                </Label>
              </div>
              <div>
                <RadioGroupItem value="bank" id="bank" className="sr-only peer" />
                <Label 
                  htmlFor="bank" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d="M2 10h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10Z" />
                    <path d="M13 8V6a2 2 0 1 0-4 0v2" />
                    <path d="m22 10-8.97-6.38a2 2 0 0 0-2.06 0L2 10" />
                  </svg>
                  Bank
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              value={friend.balance.toFixed(2)} 
              disabled 
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              This is the amount you owe to {friend.name}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Pay Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}