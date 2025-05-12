"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'; // Added useCallback
import { toast } from 'sonner';
import { useAuth } from './AuthContext'; // Import useAuth

// Types
export interface Friend {
  id: string
  name: string
  email: string
  totalOwed: number
  totalOwes: number
}

export interface GroupExpense {
  id: string
  description: string
  amount: number
  paidBy: string // Friend ID who paid
  date: string
  splitBetween: string[] // Friend IDs
}

export interface GroupBalance {
  fromId: string
  toId: string
  amount: number
}

export interface Group {
  id: string
  name: string
  description: string
  members: string[] // Friend IDs
  expenses: GroupExpense[]
  totalExpenses: number
}

// Context state interface
interface FriendsState {
  friends: Friend[];
  // setFriends: React.Dispatch<React.SetStateAction<Friend[]>>; // Removed as direct setting is discouraged
  groups: Group[];
  isLoading: boolean;
  addFriend: (name: string, email: string) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  getFriends: () => Promise<void>;
  createGroup: (name: string, description: string, members: string[]) => Promise<void>;
  addToGroup: (groupId: string, friendId: string) => Promise<void>;
  removeFromGroup: (groupId: string, friendId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  getGroups: () => Promise<void>;
  addGroupExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => Promise<void>;
  calculateGroupBalances: (group: Group) => GroupBalance[];
  searchFriendsAndGroups: (term: string) => { friends: Friend[], groups: Group[] };
}

// Create context
const FriendsContext = createContext<FriendsState | undefined>(undefined);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authIsLoading } = useAuth(); // Get user from AuthContext
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const resetState = useCallback(() => {
    setFriends([]);
    setGroups([]);
  }, []);


  const getFriends = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch friends:', errorText);
        if (response.status === 401) resetState();
        throw new Error('Failed to fetch friends');
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Unexpected friends data format:', data);
        throw new Error('Invalid friends data format');
      }
      
      let currentUserId = user._id; // Use user from AuthContext
            
      const transformedFriends = data
        .filter((friend: any) => friend.friend._id !== currentUserId)
        .map((friend: any) => ({
          id: friend.friend._id,
          name: friend.friend.name,
          email: friend.friend.email,
          totalOwed: 0, // These should be calculated based on transactions/expenses
          totalOwes: 0  // These should be calculated based on transactions/expenses
        }));
      
      setFriends(transformedFriends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      toast.error('Failed to load friends');
      resetState(); // Reset on error
    } finally {
      setIsLoading(false);
    }
  }, [user, resetState]); // Added user and resetState

  const getGroups = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) {
        if (response.status === 401) resetState();
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      
      const transformedGroups: Group[] = data.groups.map((group: any) => ({
        id: group._id,
        name: group.name,
        description: group.description || '',
        members: group.members.map((member: any) => member._id),
        expenses: group.expenses || [],
        totalExpenses: group.totalExpense || 0
      }));
      
      setGroups(transformedGroups);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      toast.error('Failed to load groups');
      resetState(); // Reset on error
    } finally {
      setIsLoading(false);
    }
  }, [user, resetState]); // Added user and resetState

  // Load initial data based on auth state
  useEffect(() => {
    if (!authIsLoading) {
      if (user) {
        getFriends();
        getGroups();
      } else {
        resetState();
      }
    }
  }, [user, authIsLoading, getFriends, getGroups, resetState]);


  const addFriend = async (name: string, email: string) => {
    if (!user) {
      toast.error("You must be logged in to add a friend.");
      return;
    }
    setIsLoading(true);
    try {
      // The API endpoint for adding a friend is /api/friends (POST)
      // It expects an 'email' in the body to find/invite the user.
      // The backend /api/friends route (POST) should handle creating the friendship.
      // The name parameter here is for local display if the backend doesn't return it immediately.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email }), // Send email to backend
        credentials: 'include'
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to add friend');
      }

      const data = await response.json();
      // Assuming the backend returns the new friend details in data.newFriend.friend
      // or similar structure based on your backend's addFriend controller.
      // Let's assume data.newFriend contains the friend's ID, name, and email.
      // If not, adjust according to your actual backend response.
      if (data.newFriend && data.newFriend.friend) {
        const newFriendData = data.newFriend.friend;
         const newFriendEntry: Friend = {
          id: newFriendData._id, // or newFriendData.id
          name: newFriendData.name,
          email: newFriendData.email,
          totalOwed: 0,
          totalOwes: 0
        };
        setFriends(prev => [...prev, newFriendEntry]);
        toast.success(data.message ||'Friend added successfully');
      } else if (data.friend) { // Fallback if structure is just data.friend
         const newFriendEntry: Friend = {
          id: data.friend._id, 
          name: data.friend.name,
          email: data.friend.email,
          totalOwed: 0,
          totalOwes: 0
        };
        setFriends(prev => [...prev, newFriendEntry]);
        toast.success(data.message ||'Friend added successfully');
      }
      else {
        // If the structure is different, you might need to call getFriends() again
        await getFriends(); 
        toast.success(data.message || 'Friend added successfully (refreshed)');
      }

    } catch (error: any) {
      console.error('Failed to add friend:', error);
      toast.error(error.message || 'Failed to add friend');
      // throw error; // Re-throwing might not be necessary if toast is sufficient
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to remove a friend.");
      return;
    }
    setIsLoading(true);
    try {
      console.log('Removing friend with ID:', id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to remove friend:', errorText);
        throw new Error('Failed to remove friend');
      }

      const friendToRemove = friends.find(f => f.id === id);
      setFriends(prev => prev.filter(friend => friend.id !== id));
      
      // Remove from all groups as well (client-side update)
      setGroups(prev => prev.map(group => ({
        ...group,
        members: group.members.filter(memberId => memberId !== id)
      })));
      
      toast.success('Friend removed', {
        description: friendToRemove ? `${friendToRemove.name} has been removed.` : undefined
      });
      // Optionally, re-fetch groups if backend handles cascading deletes into groups
      // await getGroups(); 
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('Failed to remove friend');
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (name: string, description: string, members: string[]) => {
    if (!user) {
      toast.error("You must be logged in to create a group.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, members }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to create group');

      // const data = await response.json(); // No need to use data if getGroups is called
      toast.success('Group created', {
        description: `${name} has been created.`
      });
      await getGroups(); // Refresh groups list
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group');
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addToGroup = async (groupId: string, friendId: string) => {
    if (!user) {
      toast.error("You must be logged in to add to a group.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: friendId }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to add member to group');

      // Optimistic update or re-fetch
      // setGroups(prev => prev.map(group => {
      //   if (group.id === groupId && !group.members.includes(friendId)) {
      //     return { ...group, members: [...group.members, friendId] };
      //   }
      //   return group;
      // }));
      await getGroups(); // More reliable to re-fetch

      const groupName = groups.find(g => g.id === groupId)?.name;
      const friendName = friends.find(f => f.id === friendId)?.name;
      toast.success('Member added', {
        description: `${friendName || 'Member'} has been added to ${groupName || 'the group'}.`
      });
    } catch (error) {
      console.error('Failed to add to group:', error);
      toast.error('Failed to add member to group');
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromGroup = async (groupId: string, friendId: string) => {
    if (!user) {
      toast.error("You must be logged in to remove from a group.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: friendId }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to remove member from group');
      
      // Optimistic update or re-fetch
      // setGroups(prev => prev.map(group => {
      //   if (group.id === groupId) {
      //     return { ...group, members: group.members.filter(id => id !== friendId) };
      //   }
      //   return group;
      // }));
      await getGroups(); // More reliable

      const groupName = groups.find(g => g.id === groupId)?.name;
      const friendName = friends.find(f => f.id === friendId)?.name;
      toast.success('Member removed', {
        description: `${friendName || 'Member'} has been removed from ${groupName || 'the group'}.`
      });
    } catch (error) {
      console.error('Failed to remove from group:', error);
      toast.error('Failed to remove member from group');
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a group.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete group');
      
      const groupToDelete = groups.find(g => g.id === groupId);
      // setGroups(prev => prev.filter(group => group.id !== groupId)); // Optimistic
      await getGroups(); // Re-fetch

      toast.success('Group deleted', {
        description: groupToDelete ? `${groupToDelete.name} has been deleted.` : undefined
      });
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast.error('Failed to delete group');
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addGroupExpense = async (groupId: string, expense: Omit<GroupExpense, 'id'>) => {
    if (!user) {
      toast.error("You must be logged in to add a group expense.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to add expense to group');

      // const data = await response.json(); // No need if re-fetching
      await getGroups(); // Re-fetch groups to update expenses and totalExpenses

      toast.success('Expense added to group');
    } catch (error) {
      console.error('Failed to add expense to group:', error);
      toast.error('Failed to add expense to group');
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // calculateGroupBalances and searchFriendsAndGroups are client-side, no auth check needed here
  // ... (calculateGroupBalances and searchFriendsAndGroups remain the same) ...
  const calculateGroupBalances = (group: Group): GroupBalance[] => {
    const balances = new Map<string, number>()
    
    group.members.forEach(memberId => {
      balances.set(memberId, 0)
    })

    group.expenses.forEach(expense => {
      const payer = expense.paidBy
      const splitBetween = expense.splitBetween
      const amountPerPerson = expense.amount / splitBetween.length

      balances.set(payer, (balances.get(payer) || 0) + expense.amount)
      splitBetween.forEach(memberId => {
        balances.set(memberId, (balances.get(memberId) || 0) - amountPerPerson)
      })
    })

    const debtors: { id: string, balance: number }[] = []
    const creditors: { id: string, balance: number }[] = []

    balances.forEach((balance, id) => {
      if (balance < -0.01) { // Using a small epsilon for float comparisons
        debtors.push({ id, balance: -balance })
      } else if (balance > 0.01) {
        creditors.push({ id, balance })
      }
    })

    debtors.sort((a, b) => b.balance - a.balance)
    creditors.sort((a, b) => b.balance - a.balance)

    const result: GroupBalance[] = []
    
    debtors.forEach(debtor => {
      let remainingDebt = debtor.balance
      
      for (let i = 0; i < creditors.length && remainingDebt > 0.01; i++) {
        const creditor = creditors[i]
        if (creditor.balance > 0.01) {
          const amount = Math.min(remainingDebt, creditor.balance)
          result.push({
            fromId: debtor.id,
            toId: creditor.id,
            amount: Number(amount.toFixed(2))
          })
          
          remainingDebt -= amount
          creditors[i].balance -= amount
        }
      }
    })

    return result
  }

  const searchFriendsAndGroups = (term: string) => {
    const searchTerm = term.toLowerCase()
    
    const filteredFriends = friends.filter(
      friend =>
        friend.name.toLowerCase().includes(searchTerm) ||
        friend.email.toLowerCase().includes(searchTerm)
    )
    
    const filteredGroups = groups.filter(
      group =>
        group.name.toLowerCase().includes(searchTerm)
    )
    
    return { friends: filteredFriends, groups: filteredGroups }
  }

  return (
    <FriendsContext.Provider
      value={{
        friends,
        // setFriends, // Removed
        groups,
        isLoading,
        addFriend,
        removeFriend,
        getFriends,
        createGroup,
        addToGroup,
        removeFromGroup,
        deleteGroup,
        getGroups,
        addGroupExpense,
        calculateGroupBalances,
        searchFriendsAndGroups,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

// Custom hook to use the friends context
export function useFriends() {
  const context = useContext(FriendsContext)
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider')
  }
  return context
}