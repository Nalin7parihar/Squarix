import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from './AuthContext'; // Import useAuth

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
  const { user, isLoading: authIsLoading } = useAuth(); 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [youOwe, setYouOwe] = useState<FriendWithBalance[]>([]);
  const [owedToYou, setOwedToYou] = useState<FriendWithBalance[]>([]);
  const [youOweTotal, setYouOweTotal] = useState(0);
  const [owedToYouTotal, setOwedToYouTotal] = useState(0);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setTransactions([]);
    setYouOwe([]);
    setOwedToYou([]);
    setYouOweTotal(0);
    setOwedToYouTotal(0);
    setSummary(null);
  };

  useEffect(() => {
    if (!authIsLoading) { 
      if (user) {
        getTransactions();
        getTransactionSummary();
      } else {
        resetState();
      }
    }
  }, [user, authIsLoading]); 

  const getTransactions = async () => {
    if (!user) return; 
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions', { 
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        if (response.status === 401) resetState();
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      
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
      
      if (data.summary) {
        const youOweData = data.summary.youOwe.map((tx: any) => ({
          id: tx.senderId._id,
          name: tx.senderId.name,
          email: tx.senderId.email,
          balance: tx.amount,
          date: format(new Date(tx.date), 'yyyy-MM-dd'),
          transactionId: tx._id,
        }));
        
        const owedToYouData = data.summary.owedToYou.map((tx: any) => ({
          id: tx.receiverId._id,
          name: tx.receiverId.name,
          email: tx.receiverId.email,
          balance: tx.amount,
          date: format(new Date(tx.date), 'yyyy-MM-dd'),
          transactionId: tx._id,
        }));
        
        setYouOwe(youOweData);
        setOwedToYou(owedToYouData);
        setYouOweTotal(data.summary.youOweTotal);
        setOwedToYouTotal(data.summary.owedToYouTotal);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
      resetState(); 
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionSummary = async () => {
    if (!user) return; 
    setIsLoading(true);
    try {
      const response = await fetch('/api/transactions/summary', { 
        credentials: 'include',
        cache: 'no-store',
      });
       if (!response.ok) {
        if (response.status === 401) resetState();
        throw new Error('Failed to fetch transaction summary');
      }
      const data = await response.json();
      console.log("Transaction summary API response:", data);
      
      setSummary({
        totalYouAreOwed: data.totalYouAreOwed,
        totalYouOwe: data.totalYouOwe,
        netBalance: data.netBalance,
        friendBalances: data.friendBalances,
      });
      
      console.log("Set summary state to:", {
        totalYouAreOwed: data.totalYouAreOwed,
        totalYouOwe: data.totalYouOwe,
        netBalance: data.netBalance,
        friendBalancesCount: data.friendBalances?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch transaction summary:', error);
      toast.error('Failed to load transaction summary');
      resetState(); 
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionData: any) => {
    if (!user) {
      toast.error("You must be logged in to add a transaction.");
      return;
    }
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
      
      await getTransactions();
      await getTransactionSummary(); // Also refresh summary
      
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
    if (!user) {
      toast.error("You must be logged in to update a transaction.");
      return;
    }
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
      
      await getTransactions();
      await getTransactionSummary(); // Also refresh summary
      
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
    if (!user) {
      toast.error("You must be logged in to settle a transaction.");
      return;
    }
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
    if (!user) {
      toast.error("You must be logged in to request a payment.");
      return;
    }
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
    if (!user) {
       resetState(); // Clear data if no user
       return {
        transactions: [],
        youOwe: [],
        owedToYou: [],
        youOweTotal: 0,
        owedToYouTotal: 0,
      };
    }
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (params.tab) {
        if (params.tab === "owed") {
          queryParams.append('tab', "owed");
        } else if (params.tab === "owe") {
          queryParams.append('tab', "owe");
        } else {
          queryParams.append('tab', params.tab);
        }
      }
      
      if (params.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params.customDate) {
        queryParams.append('customDate', format(params.customDate, 'yyyy-MM-dd'));
      }

      console.log("Filtering transactions with params:", queryParams.toString());
      const response = await fetch(`/api/transactions/filter?${queryParams.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) resetState();
        throw new Error('Failed to filter transactions');
      }
      const data = await response.json();
      console.log("Filter API response:", data);
      
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
      
      const youOweData: FriendWithBalance[] = data.youOwe && data.youOwe.length > 0 
        ? data.youOwe.map((tx: any) => ({
            id: tx.senderId._id,
            name: tx.senderId.name,
            email: tx.senderId.email,
            balance: tx.amount,
            date: format(new Date(tx.date), 'yyyy-MM-dd'),
            transactionId: tx._id,
          }))
        : [];
      
      const owedToYouData: FriendWithBalance[] = data.owedToYou && data.owedToYou.length > 0 
        ? data.owedToYou.map((tx: any) => ({
            id: tx.receiverId._id,
            name: tx.receiverId.name,
            email: tx.receiverId.email,
            balance: tx.amount,
            date: format(new Date(tx.date), 'yyyy-MM-dd'),
            transactionId: tx._id,
          }))
        : [];
      
      console.log("Processed youOweData:", youOweData);
      console.log("Processed owedToYouData:", owedToYouData);
      
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
      resetState(); // Reset on error
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