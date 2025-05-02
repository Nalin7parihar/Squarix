"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

// Define types for our transaction data
interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  receiverId: {
    _id: string;
    name: string;
    email: string;
  };
  isSettled: boolean;
}

// Friend interface for the UI components
export interface Friend {
  id: string;
  name: string;
  email: string;
  balance: number;
  date: string;
  transactionId: string;
}

export async function fetchTransactions(tab: string, timeFilter: string, customDate?: Date) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Construct query parameters
    const params = new URLSearchParams();
    if (tab !== "all-transactions") {
      params.append("tab", tab);
    }
    if (timeFilter !== "all") {
      params.append("timeFilter", timeFilter);
    }
    if (timeFilter === "custom" && customDate) {
      params.append("customDate", format(customDate, 'yyyy-MM-dd'));
    }

    // Make API request to backend server
    const response = await fetch(`${baseUrl}/api/transactions/filter?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch transactions");
    }

    const data = await response.json();
    
    // Get current user ID to identify which user is "you"
    const currentUserId = getUserId();
    
    // For "you owe" transactions, the friend is the sender (who paid)
    // FIXED: Changed receiverId to senderId because in "you owe" transactions,
    // the sender is the friend who paid and should be shown
    const youOwe: Friend[] = data.youOwe.map((txn: Transaction) => ({
      id: txn.senderId._id,
      name: txn.senderId.name,
      email: txn.senderId.email,
      balance: txn.amount,
      date: format(new Date(txn.date), 'yyyy-MM-dd'),
      transactionId: txn._id
    }));
    
    // For "owed to you" transactions, the friend is the receiver (who owes you)
    // FIXED: Changed senderId to receiverId because in "owed to you" transactions,
    // the receiver is the friend who owes you and should be shown
    const owedToYou: Friend[] = data.owedToYou.map((txn: Transaction) => ({
      id: txn.receiverId._id,
      name: txn.receiverId.name,
      email: txn.receiverId.email,
      balance: txn.amount,
      date: format(new Date(txn.date), 'yyyy-MM-dd'),
      transactionId: txn._id
    }));

    return {
      youOwe,
      owedToYou,
      youOweTotal: data.youOweTotal || 0,
      owedToYouTotal: data.owedToYouTotal || 0
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    toast.error("Failed to fetch transactions");
    return { youOwe: [], owedToYou: [], youOweTotal: 0, owedToYouTotal: 0 };
  }
}

// Helper function to get current user ID
function getUserId() {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        if (user.id || user._id) {
          return user.id || user._id;
        }
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
    
    // If not found in localStorage, try cookies or other storage
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      if (cookie.trim().startsWith('userId=')) {
        return cookie.trim().substring(7);
      }
    }
  }
  
  // Fallback - this will be handled on the server side with the authenticated user session
  return '';
}

export async function settleTransaction(transactionId: string, paymentMethod: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${baseUrl}/api/transactions/settleTransaction/${transactionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentMethod }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to settle transaction");
    }

    const data = await response.json();
    toast.success("Payment successful");
    return data;
  } catch (error) {
    console.error("Error settling transaction:", error);
    toast.error("Failed to complete payment");
    throw error;
  }
}

export async function requestPayment(transactionId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${baseUrl}/api/transactions/${transactionId}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send payment request");
    }

    const data = await response.json();
    toast.success("Payment request sent");
    return data;
  } catch (error) {
    console.error("Error requesting payment:", error);
    toast.error("Failed to send payment request");
    throw error;
  }
}