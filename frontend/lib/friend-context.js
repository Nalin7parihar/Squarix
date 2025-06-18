"use client";

import { createContext,useContext,useState,useEffect } from "react";
import { useAuth } from "./auth-context";
import axios from "axios";

const FriendContext = createContext({});

export function FriendsProvider({children}) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();
  
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if(user) {
      fetchFriends();
    }
    else {
      setFriends([]);
      setLoading(false);
    }
  },[user]);
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/friends');
      console.log("Fetched friends:", response.data);
      setFriends(response.data.friends || []);
      return { success: true, friends: response.data.friends || [] };
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  }

  const addFriend = async (friendData) => {
    try {
      setLoading(true);
      const response = await axios.post('/friends', friendData);
      
      // Refresh friends list after adding
      await fetchFriends();
      
      return { success: true, friend: response.data.friend };
    } catch (error) {
      console.error("Error adding friend:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  }

  const deleteFriend = async (friendId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/friends/${friendId}`);
      
      // Refresh friends list after deletion
      await fetchFriends();
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Error deleting friend:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  }

  const getFriendExpenses = async (friendId) => {
    try {
      const response = await axios.get(`/friends/${friendId}/expenses`);
      return { success: true, expenses: response.data.expenses || [] };
    } catch (error) {
      console.error("Error fetching friend expenses:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  const value = {
    friends,
    loading,
    fetchFriends,
    addFriend,
    deleteFriend,
    getFriendExpenses,
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
}