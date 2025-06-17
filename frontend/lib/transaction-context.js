"use client";
import { createContext,useContext,useState,useEffect } from "react";
import { useAuth } from "./auth-context";
import axios from "axios";

const TransactionContext = createContext({});

export function TransactionProvider({children}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;
  
  useEffect(() => {
    if(user){
      fetchTransactions();
    }
    else {
      setTransactions([]);
      setLoading(false);
    }
  },[user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/transactions/getTransactions');
      setTransactions(response.data.transactions || []);
      return { success: true, transactions: response.data.transactions || [] };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  }
  const addTransaction = async (transactionData) => {
    try {
      setLoading(true);
      const response = await axios.post('/transactions', transactionData);
      
      // Refresh transactions after adding
      await fetchTransactions();
      
      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      console.error("Error adding transaction:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (transactionId, updateData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/transactions/${transactionId}`, updateData);
      
      // Update the transaction in state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction._id === transactionId 
            ? { ...transaction, ...response.data.transaction }
            : transaction
        )
      );
      
      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      console.error("Error updating transaction:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const settleTransaction = async (transactionId) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/transactions/settleTransaction/${transactionId}`);
      
      // Update the transaction in state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction._id === transactionId 
            ? { ...transaction, isSettled: true }
            : transaction
        )
      );
      
      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      console.error("Error settling transaction:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const requestPayment = async (transactionId, requestData = {}) => {
    try {
      const response = await axios.post(`/transactions/${transactionId}/request`, requestData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Error requesting payment:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const getTransactionSummary = async () => {
    try {
      const response = await axios.get('/transactions/getSummary');
      return { success: true, summary: response.data };
    } catch (error) {
      console.error("Error getting transaction summary:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const value = {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    settleTransaction,
    requestPayment,
    getTransactionSummary,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
}