"use client"

import { createContext,useState,useContext,useEffect,useCallback } from "react"
import axios from "axios"
import { useAuth } from "./auth-context"


const ExpenseContext = createContext({});

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
axios.defaults.withCredentials = true;

export function ExpenseProvider({children}) {
  const [expenses,setExpenses] = useState([])
  const [loading,setLoading] = useState(true)
  const { user } = useAuth(); // Get user from auth context
  // Fetch expenses when user is authenticated
  useEffect(() => {
    if (user) {
      fetchExpenses()
    } else {
      // Clear expenses when user logs out
      setExpenses([])
      setLoading(false)
    }
  }, [user])

  // Listen for expense updates from transaction settlements
  useEffect(() => {    const handleExpenseUpdate = () => {
      if (user) {
        fetchExpenses();
      }
    };

    window.addEventListener('expense-updated', handleExpenseUpdate);
    
    return () => {
      window.removeEventListener('expense-updated', handleExpenseUpdate);
    };
  }, [user]);
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/expenses/getExpenses');
      setExpenses(response.data.expenses || []);
      return { success: true, expenses: response.data.expenses || [] }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      setLoading(false);
    }
  }

const addExpense = async (expenseData) => {
  try {
    setLoading(true);
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(expenseData).forEach(key => {
      if (key === 'participants') {
        // Stringify participants array
        formData.append(key, JSON.stringify(expenseData[key]));
      } else if (key === 'receipt' && expenseData[key]) {
        // Handle file upload
        formData.append('reciept', expenseData[key]); // Note: backend expects 'reciept'
      } else if (expenseData[key] !== null && expenseData[key] !== undefined) {
        formData.append(key, expenseData[key]);
      }
    });
      const response = await axios.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Add the new expense to state
    setExpenses(prev => [response.data.expense, ...prev]);
    return { success: true, expense: response.data.expense }
  } catch (error) {
    console.error("Error adding expense:", error);
    return { success: false, error: error.response?.data?.message || error.message }
  } finally {
    setLoading(false);
  }
}



const getExpenseSummary = async (summaryData) => {
  try {
    setLoading(true);
    const response = await axios.post('/expenses/getSummary', summaryData);
    return { success: true, summary: response.data }
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return { success: false, error: error.response?.data?.message || error.message }
  } finally {
    setLoading(false);
  }
}

const deleteExpense = async (expenseId) => {
  try {
    setLoading(true);
    await axios.delete(`/expenses/${expenseId}`);
    setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
    return { success: true, message: "Expense deleted successfully" }
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: error.response?.data?.message || error.message }
  } finally {
    setLoading(false);
  }
}

// Additional expense-related API functions
const getExpenseById = async (id) => {
  try {
    const response = await axios.get(`/expenses/${id}`);
    return { success: true, expense: response.data.expense }
  } catch (error) {
    console.error("Error fetching expense:", error);
    return { success: false, error: error.response?.data?.message || error.message }
  }
}

const clearExpenses = () => {
  setExpenses([]);
  setLoading(false);
};

return (
  <ExpenseContext.Provider value={{
    expenses,
    loading,
    fetchExpenses,
    addExpense,
    getExpenseSummary,
    deleteExpense,
    getExpenseById,
    clearExpenses,
  }}>
    {children}
  </ExpenseContext.Provider>
)
}

export const useExpense = () => useContext(ExpenseContext);