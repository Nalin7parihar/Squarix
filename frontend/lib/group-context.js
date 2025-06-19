"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import axios from "axios";

const GroupContext = createContext({});

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setGroups([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/groups');
      console.log("Fetched groups:", response.data);
      setGroups(response.data.groups || []);
      return { success: true, groups: response.data.groups || [] };
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      setLoading(true);
      const response = await axios.post('/groups', groupData);
      
      // Refresh groups list after creating
      await fetchGroups();
      
      return { success: true, group: response.data.group };
    } catch (error) {
      console.error("Error creating group:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }  };

  const deleteGroup = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/groups/${groupId}`);
      
      // Refresh groups list after deletion
      await fetchGroups();
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Error deleting group:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const addMemberToGroup = async (groupId, memberId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/groups/${groupId}/members`, { memberId });
      
      // Refresh groups list after adding member
      await fetchGroups();
      
      return { success: true, group: response.data.group };
    } catch (error) {
      console.error("Error adding member to group:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromGroup = async (groupId, memberId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/groups/${groupId}/members`, { 
        data: { memberId } 
      });
      
      // Refresh groups list after removing member
      await fetchGroups();
      
      return { success: true, group: response.data.group };
    } catch (error) {
      console.error("Error removing member from group:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const addGroupExpense = async (groupId, expenseData) => {
    try {
      setLoading(true);
      const response = await axios.post(`/groups/${groupId}/expenses`, expenseData);
      
      // Refresh groups list after adding expense
      await fetchGroups();
      
      return { success: true, expense: response.data.expense };
    } catch (error) {
      console.error("Error adding group expense:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const getGroupExpenses = async (groupId) => {
    try {
      const response = await axios.get(`/groups/${groupId}/expenses`);
      console.log("Fetched group expenses:", response.data);
      return { success: true, expenses: response.data.expenses || [] };
    } catch (error) {
      console.error("Error fetching group expenses:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };
  const value = {
    groups,
    loading,
    fetchGroups,
    createGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    addGroupExpense,
    getGroupExpenses,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
}