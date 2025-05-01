"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';

interface Expense {
  id: string;
  title: string;
  amount: number;
  senderId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  participants: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    } | string;
    share: number;
    isSettled: boolean;
    transactionId: string | null;
  }>;
  groupId?: string;
  isGroupExpense: boolean;
  category: string;
  reciept?: string;
  createdAt: Date;
}

interface ExpenseSummary {
  totalAmount: number;
  senderId: string;
  totalAmountOwedToSender: number;
  participants: Array<{
    userId: string;
    share: number;
    isSettled: boolean;
    transactionId: string | null;
  }>;
}

interface ExpenseContextType {
  expenses: Expense[];
  getExpenses: () => Promise<void>;
  addExpense: (expenseData: FormData) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  getExpenseSummary: (data: { amount: number; participants: any[]; senderId: string }) => Promise<ExpenseSummary>;
  filterExpenses: (filters: { timePeriod?: string; date?: string; type?: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const getExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/getExpenses`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }, []);

  const addExpense = useCallback(async (formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to add expense:', errorText);
        throw new Error('Failed to add expense');
      }
      const data = await response.json();
      setExpenses(prev => [...prev, data.expense]);
      toast.success('Expense added successfully');
      await getExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  }, [getExpenses]);

  const updateExpense = useCallback(async (id: string, data: Partial<Expense>) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update expense');
      const updatedExpense = await response.json();
      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
      toast.success('Expense updated successfully');
      await getExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  }, [getExpenses]);

  const getExpenseSummary = useCallback(async (data: { amount: number; participants: any[]; senderId: string }): Promise<ExpenseSummary> => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/getSummary`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to get expense summary');
      const summary = await response.json();
      return summary;
    } catch (error) {
      console.error('Error getting expense summary:', error);
      toast.error('Failed to get expense summary');
      throw error;
    }
  }, []);

  const filterExpenses = useCallback(async (filters: { timePeriod?: string; date?: string; type?: string }) => {
    try {
      const params = new URLSearchParams(filters as Record<string, string>);
      const response = await fetch(`${API_URL}/api/expenses/filter?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to filter expenses');
      const data = await response.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error('Error filtering expenses:', error);
      toast.error('Failed to filter expenses');
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast.success('Expense deleted successfully');
      await getExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  }, [getExpenses]);

  const value = {
    expenses,
    getExpenses,
    addExpense,
    updateExpense,
    getExpenseSummary,
    filterExpenses,
    deleteExpense
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}