'use client';

import { useState, useEffect, useRef } from 'react';
import { useTransactions, Transaction } from '@/contexts';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const TransactionDetails = () => {
  const { 
    transactions,
    youOwe, 
    owedToYou, 
    youOweTotal,
    owedToYouTotal,
    filterTransactions,
    settleTransaction,
    requestPayment,
    summary,
    getTransactionSummary
  } = useTransactions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const dataFetchedRef = useRef(false);

  // Load transactions and summary on component mount
  useEffect(() => {
    if (dataFetchedRef.current) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("Starting data load...");
        // First call filterTransactions with the active tab to ensure data is loaded
        await filterTransactions({ 
          tab: activeTab, 
          timeFilter: timeFilter 
        });
        
        // Also load summary data for totals
        await getTransactionSummary();
        
        console.log("Data load complete");
        dataFetchedRef.current = true;
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Use summary data for consistent totals with dashboard
  const totalOwedToYou = summary?.totalYouAreOwed || owedToYouTotal;
  const totalYouOwe = summary?.totalYouOwe || youOweTotal;
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("Summary data:", summary);
    console.log("owedToYou state:", owedToYou);
    console.log("youOwe state:", youOwe);
    console.log("owedToYouTotal:", owedToYouTotal);
    console.log("totalOwedToYou:", totalOwedToYou);
  }, [summary, owedToYou, youOwe, owedToYouTotal, totalOwedToYou]);

  const handleFilterChange = async (tab: string, time: string) => {
    if (tab === activeTab && time === timeFilter) return;
    
    setIsLoading(true);
    try {
      await filterTransactions({ 
        tab, 
        timeFilter: time 
      });
      setActiveTab(tab);
      setTimeFilter(time);
    } catch (error) {
      console.error("Failed to filter transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettle = async (id: string) => {
    if (confirm('Are you sure you want to mark this as settled?')) {
      try {
        await settleTransaction(id, 'manual');
        // Refresh summary after settlement for consistent totals
        await getTransactionSummary();
      } catch (error) {
        console.error("Failed to settle transaction", error);
      }
    }
  };

  const handleRequestPayment = async (id: string) => {
    try {
      await requestPayment(id);
      toast.success('Payment request sent');
    } catch (error) {
      console.error("Failed to request payment", error);
      toast.error('Failed to send payment request');
    }
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Render transaction item
  const renderTransactionItem = (transaction: Transaction) => {
    // Check if the current user is the sender based on the transaction data
    // Note: This assumes the backend is properly setting senderId.name as "You" for the current user
    const isPayer = transaction.senderId.name === "You" || transaction.senderId.name === "you";
    
    return (
      <Card key={transaction.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{transaction.description}</CardTitle>
            <Badge variant={transaction.isSettled ? "outline" : "default"}>
              {transaction.isSettled ? "Settled" : "Unsettled"}
            </Badge>
          </div>
          <CardDescription>
            {format(new Date(transaction.date), 'MMMM d, yyyy')} • {transaction.category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              {isPayer ? (
                <p>You paid <strong>{formatCurrency(transaction.amount)}</strong></p>
              ) : (
                <p><strong>{transaction.senderId.name}</strong> paid <strong>{formatCurrency(transaction.amount)}</strong></p>
              )}
              
              <p className="text-sm text-muted-foreground mt-1">
                {isPayer ? 
                  `${transaction.receiverId.name} owes you ${formatCurrency(transaction.amount)}` : 
                  `You owe ${transaction.senderId.name} ${formatCurrency(transaction.amount)}`}
              </p>
            </div>
            
            {!transaction.isSettled && !isPayer && (
              <Button 
                variant="outline" 
                onClick={() => handleSettle(transaction.id)}
              >
                Settle Up
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Debug logging to check data
  console.log("owedToYou data:", owedToYou);
  console.log("youOwe data:", youOwe);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        
        <div className="flex items-center gap-2">
          <Select
            value={timeFilter}
            onValueChange={(value) => handleFilterChange(activeTab, value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => handleFilterChange(value, timeFilter)}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="owe" className="flex-1">You Owe</TabsTrigger>
              <TabsTrigger value="owed" className="flex-1">You're Owed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <p>Loading transactions...</p>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map(renderTransactionItem)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No transactions found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="owe" className="space-y-4">
              <div className="pb-4 border-b">
                <p>Total you owe: <strong>{formatCurrency(totalYouOwe)}</strong></p>
              </div>
              
              {isLoading ? (
                <p>Loading transactions...</p>
              ) : youOwe && youOwe.length > 0 ? (
                <div className="space-y-4">
                  {youOwe.map(friend => (
                    <Card key={friend.transactionId} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Payment to {friend.name}</CardTitle>
                          <Badge variant="default">Unsettled</Badge>
                        </div>
                        <CardDescription>
                          {friend.date}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <p>You owe <strong>{formatCurrency(friend.balance)}</strong></p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => handleSettle(friend.transactionId)}
                          >
                            Settle Up
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>You don't owe anyone.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="owed" className="space-y-4">
              <div className="pb-4 border-b">
                <p>Total owed to you: <strong>{formatCurrency(totalOwedToYou)}</strong></p>
              </div>
              
              {isLoading ? (
                <p>Loading transactions...</p>
              ) : owedToYou && owedToYou.length > 0 ? (
                <div className="space-y-4">
                  {owedToYou.map(friend => (
                    <Card key={friend.transactionId} className="mb-4">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Payment from {friend.name}</CardTitle>
                          <Badge variant="default">Unsettled</Badge>
                        </div>
                        <CardDescription>
                          {friend.date}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <p><strong>{friend.name}</strong> owes you <strong>{formatCurrency(friend.balance)}</strong></p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleRequestPayment(friend.transactionId)}
                          >
                            Request Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No one owes you.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetails;