import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Transaction interface
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  senderId: {
    id: string;
    name: string;
    email: string;
  };
  receiverId: {
    id: string;
    name: string;
    email: string;
  };
  isSettled: boolean;
}

// Friend with balance interface
export interface FriendWithBalance {
  id: string;
  name: string;
  email: string;
  balance: number;
  date: string;
  transactionId: string;
}

// Transaction summary interface
export interface TransactionSummary {
  totalYouAreOwed: number;
  totalYouOwe: number;
  netBalance: number;
  friendBalances: {
    name: string;
    balance: number;
  }[];
}

// Transaction filter parameters
export interface TransactionFilterParams {
  tab?: string;
  timeFilter?: string;
  customDate?: Date;
}

// Transaction context state interface
interface TransactionContextType {
  transactions: Transaction[];
  youOwe: FriendWithBalance[];
  owedToYou: FriendWithBalance[];
  youOweTotal: number;
  owedToYouTotal: number;
  isLoading: boolean;
  summary: TransactionSummary | null;
  getTransactions: () => Promise<void>;
  getTransactionSummary: () => Promise<void>;
  addTransaction: (transactionData: any) => Promise<void>;
  updateTransaction: (id: string, transactionData: any) => Promise<void>;
  settleTransaction: (id: string, paymentMethod: string) => Promise<void>;
  requestPayment: (id: string) => Promise<void>;
  filterTransactions: (params: TransactionFilterParams) => Promise<{
    transactions: Transaction[];
    youOwe: FriendWithBalance[];
    owedToYou: FriendWithBalance[];
    youOweTotal: number;
    owedToYouTotal: number;
  }>;
}

// Create context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [youOwe, setYouOwe] = useState<FriendWithBalance[]>([]);
  const [owedToYou, setOwedToYou] = useState<FriendWithBalance[]>([]);
  const [youOweTotal, setYouOweTotal] = useState(0);
  const [owedToYouTotal, setOwedToYouTotal] = useState(0);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      
      // Transform backend data to match our interfaces
      const transformedTransactions = data.transactions.map((tx: any) => ({
        id: tx._id,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        date: format(new Date(tx.date), 'yyyy-MM-dd'),
        senderId: {
          id: tx.senderId._id,
          name: tx.senderId.name,
          email: tx.senderId.email,
        },
        receiverId: {
          id: tx.receiverId._id,
          name: tx.receiverId.name,
          email: tx.receiverId.email,
        },
        isSettled: tx.isSettled,
      }));

      setTransactions(transformedTransactions);
      
      // Also update youOwe and owedToYou lists from this data
      if (data.summary) {
        setYouOwe(data.summary.youOwe);
        setOwedToYou(data.summary.owedToYou);
        setYouOweTotal(data.summary.youOweTotal);
        setOwedToYouTotal(data.summary.owedToYouTotal);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions/summary', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch transaction summary');

      const data = await response.json();
      setSummary({
        totalYouAreOwed: data.totalYouAreOwed,
        totalYouOwe: data.totalYouOwe,
        netBalance: data.netBalance,
        friendBalances: data.friendBalances,
      });
    } catch (error) {
      console.error('Failed to fetch transaction summary:', error);
      toast.error('Failed to load transaction summary');
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to create transaction');

      const data = await response.json();
      toast.success('Transaction added successfully');
      
      // Refresh transactions after adding
      await getTransactions();
      
      return data;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, transactionData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update transaction');

      const data = await response.json();
      toast.success('Transaction updated successfully');
      
      // Refresh transactions after updating
      await getTransactions();
      
      return data;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast.error('Failed to update transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const settleTransaction = async (id: string, paymentMethod: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${id}/settle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to settle transaction');

      const data = await response.json();
      toast.success('Payment successful');
      
      // Update local state
      setTransactions(prevTransactions =>
        prevTransactions.map(tx =>
          tx.id === id ? { ...tx, isSettled: true } : tx
        )
      );
      
      // Refresh transaction data
      await getTransactions();
      await getTransactionSummary();
      
      return data;
    } catch (error) {
      console.error('Failed to settle transaction:', error);
      toast.error('Failed to complete payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPayment = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${id}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to request payment');

      const data = await response.json();
      toast.success('Payment request sent');
      return data;
    } catch (error) {
      console.error('Failed to request payment:', error);
      toast.error('Failed to send payment request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = async (params: TransactionFilterParams) => {
    setIsLoading(true);
    try {
      // Construct query string
      const queryParams = new URLSearchParams();
      if (params.tab) queryParams.append('tab', params.tab);
      if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params.customDate) {
        queryParams.append('customDate', format(params.customDate, 'yyyy-MM-dd'));
      }

      const response = await fetch(`/api/transactions/filter?${queryParams.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to filter transactions');

      const data = await response.json();
      
      // Transform backend data to match our interfaces
      const transformedTransactions = data.transactions.map((tx: any) => ({
        id: tx._id,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        date: format(new Date(tx.date), 'yyyy-MM-dd'),
        senderId: {
          id: tx.senderId._id,
          name: tx.senderId.name,
          email: tx.senderId.email,
        },
        receiverId: {
          id: tx.receiverId._id,
          name: tx.receiverId.name,
          email: tx.receiverId.email,
        },
        isSettled: tx.isSettled,
      }));

      setTransactions(transformedTransactions);
      
      // Parse the youOwe and owedToYou data
      const youOweData: FriendWithBalance[] = data.youOwe.map((tx: any) => ({
        id: tx.receiverId._id,
        name: tx.receiverId.name,
        email: tx.receiverId.email,
        balance: tx.amount,
        date: format(new Date(tx.date), 'yyyy-MM-dd'),
        transactionId: tx._id,
      }));
      
      const owedToYouData: FriendWithBalance[] = data.owedToYou.map((tx: any) => ({
        id: tx.senderId._id,
        name: tx.senderId.name,
        email: tx.senderId.email,
        balance: tx.amount,
        date: format(new Date(tx.date), 'yyyy-MM-dd'),
        transactionId: tx._id,
      }));
      
      setYouOwe(youOweData);
      setOwedToYou(owedToYouData);
      setYouOweTotal(data.youOweTotal || 0);
      setOwedToYouTotal(data.owedToYouTotal || 0);
      
      return {
        transactions: transformedTransactions,
        youOwe: youOweData,
        owedToYou: owedToYouData,
        youOweTotal: data.youOweTotal || 0,
        owedToYouTotal: data.owedToYouTotal || 0,
      };
    } catch (error) {
      console.error('Failed to filter transactions:', error);
      toast.error('Failed to filter transactions');
      return {
        transactions: [],
        youOwe: [],
        owedToYou: [],
        youOweTotal: 0,
        owedToYouTotal: 0,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        youOwe,
        owedToYou,
        youOweTotal,
        owedToYouTotal,
        isLoading,
        summary,
        getTransactions,
        getTransactionSummary,
        addTransaction,
        updateTransaction,
        settleTransaction,
        requestPayment,
        filterTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

// Custom hook to use the transaction context
export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}