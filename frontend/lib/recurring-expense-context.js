"use client"

import { createContext, useState, useContext, useEffect, useCallback } from "react"
import axios from "axios"
import { useAuth } from "./auth-context"

const RecurringExpenseContext = createContext({});

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
axios.defaults.withCredentials = true;

export function RecurringExpenseProvider({ children }) {
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth();

  // Fetch recurring expenses when user is authenticated
  useEffect(() => {
    if (user) {
      fetchRecurringExpenses()
    } else {
      setRecurringExpenses([])
      setLoading(false)
    }
  }, [user])

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/recurring-expenses');
      setRecurringExpenses(response.data.recurringExpenses || []);
      return { success: true, recurringExpenses: response.data.recurringExpenses || [] }
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false);
    }
  }

  const addRecurringExpense = async (recurringExpenseData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(recurringExpenseData).forEach(key => {
        if (key === 'participants') {
          // Stringify participants array
          formData.append(key, JSON.stringify(recurringExpenseData[key]));
        } else if (key === 'receipt' && recurringExpenseData[key]) {
          // Handle file upload
          formData.append('reciept', recurringExpenseData[key]); // Note: backend expects 'reciept'
        } else if (recurringExpenseData[key] !== null && recurringExpenseData[key] !== undefined) {
          formData.append(key, recurringExpenseData[key]);
        }
      });

      const response = await axios.post('/recurring-expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the new recurring expense to state
      setRecurringExpenses(prev => [response.data.recurringExpense, ...prev]);
      return { success: true, recurringExpense: response.data.recurringExpense }
    } catch (error) {
      console.error("Error adding recurring expense:", error);
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false);
    }
  }

  const updateRecurringExpense = async (recurringExpenseId, updateData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(updateData).forEach(key => {
        if (key === 'participants') {
          // Stringify participants array
          formData.append(key, JSON.stringify(updateData[key]));
        } else if (key === 'receipt' && updateData[key]) {
          // Handle file upload
          formData.append('reciept', updateData[key]); // Note: backend expects 'reciept'
        } else if (updateData[key] !== null && updateData[key] !== undefined) {
          formData.append(key, updateData[key]);
        }
      });

      const response = await axios.put(`/recurring-expenses/${recurringExpenseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the recurring expense in state
      setRecurringExpenses(prev => 
        prev.map(expense => 
          expense._id === recurringExpenseId 
            ? response.data.recurringExpense 
            : expense
        )
      );
      return { success: true, recurringExpense: response.data.recurringExpense }
    } catch (error) {
      console.error("Error updating recurring expense:", error);
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false);
    }
  }

  const deleteRecurringExpense = async (recurringExpenseId) => {
    try {
      setLoading(true);
      await axios.delete(`/recurring-expenses/${recurringExpenseId}`);
      setRecurringExpenses(prev => prev.filter(expense => expense._id !== recurringExpenseId));
      return { success: true, message: "Recurring expense deleted successfully" }
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false);
    }
  }
  const getRecurringExpenseById = async (recurringExpenseId) => {
    try {
      const response = await axios.get(`/recurring-expenses/${recurringExpenseId}`);
      return { success: true, data: response.data.recurringExpense }
    } catch (error) {
      console.error("Error fetching recurring expense:", error);
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const value = {
    recurringExpenses,
    loading,
    fetchRecurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    getRecurringExpenseById
  }

  return (
    <RecurringExpenseContext.Provider value={value}>
      {children}
    </RecurringExpenseContext.Provider>
  )
}

export function useRecurringExpense() {
  const context = useContext(RecurringExpenseContext);
  if (context === undefined) {
    throw new Error('useRecurringExpense must be used within a RecurringExpenseProvider');
  }
  return context;
}
