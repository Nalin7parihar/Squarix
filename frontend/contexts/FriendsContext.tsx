"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { toast } from 'sonner'

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
  friends: Friend[]
  groups: Group[]
  isLoading: boolean
  addFriend: (name: string, email: string) => Promise<void>
  removeFriend: (id: string) => Promise<void>
  getFriends: () => Promise<void>
  createGroup: (name: string, description: string, members: string[]) => Promise<void>
  addToGroup: (groupId: string, friendIds: string[]) => Promise<void>
  removeFromGroup: (groupId: string, friendId: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  getGroups: () => Promise<void>
  addGroupExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => Promise<void>
  calculateGroupBalances: (group: Group) => GroupBalance[]
  searchFriendsAndGroups: (term: string) => { friends: Friend[], groups: Group[] }
}

// Create context
const FriendsContext = createContext<FriendsState | undefined>(undefined)

// Provider props
interface FriendsProviderProps {
  children: ReactNode
}

export function FriendsProvider({ children }: FriendsProviderProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Get all friends
  const getFriends = async () => {
    setIsLoading(true)
    try {
      // In production, real API call to get friends
      // const response = await fetch('/api/friends', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // })
      // const data = await response.json()
      // setFriends(data)
      
      // For demo purposes, simulate fetching friends
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock data
      const mockFriends: Friend[] = [
        { id: '1', name: 'Alex Johnson', email: 'alex@example.com', totalOwed: 125.5, totalOwes: 0 },
        { id: '2', name: 'Jamie Smith', email: 'jamie@example.com', totalOwed: 0, totalOwes: 75.0 },
        { id: '3', name: 'Taylor Wilson', email: 'taylor@example.com', totalOwed: 45.75, totalOwes: 0 },
        { id: '4', name: 'Morgan Lee', email: 'morgan@example.com', totalOwed: 0, totalOwes: 12.25 },
        { id: '5', name: 'Casey Brooks', email: 'casey@example.com', totalOwed: 195.0, totalOwes: 0 },
      ]
      
      setFriends(mockFriends)
    } catch (error) {
      console.error('Failed to fetch friends:', error)
      toast.error('Failed to load friends')
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new friend
  const addFriend = async (name: string, email: string) => {
    setIsLoading(true)
    try {
      // In production, real API call to add friend
      // const response = await fetch('/api/friends', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ name, email })
      // })
      // const data = await response.json()
      
      // For demo purposes, simulate adding friend
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Create mock friend with ID
      const newFriend: Friend = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        totalOwed: 0,
        totalOwes: 0,
      }
      
      setFriends(prev => [...prev, newFriend])
      toast.success('Friend added successfully', {
        description: `${name} has been added to your friends.`
      })
    } catch (error) {
      console.error('Failed to add friend:', error)
      toast.error('Failed to add friend')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Remove a friend
  const removeFriend = async (id: string) => {
    setIsLoading(true)
    try {
      // In production, real API call to remove friend
      // await fetch(`/api/friends/${id}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // })
      
      // For demo purposes, simulate removing friend
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const friendToRemove = friends.find(f => f.id === id)
      
      setFriends(prev => prev.filter(friend => friend.id !== id))
      
      // Also remove friend from all groups
      setGroups(prev => prev.map(group => ({
        ...group,
        members: group.members.filter(memberId => memberId !== id)
      })))
      
      toast.success('Friend removed', {
        description: friendToRemove ? `${friendToRemove.name} has been removed.` : undefined
      })
    } catch (error) {
      console.error('Failed to remove friend:', error)
      toast.error('Failed to remove friend')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get all groups
  const getGroups = async () => {
    setIsLoading(true)
    try {
      // In production, real API call to get groups
      // const response = await fetch('/api/groups', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // })
      // const data = await response.json()
      // setGroups(data)
      
      // For demo purposes, simulate fetching groups
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock data
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Roommates',
          description: 'Apartment expenses',
          members: ['1', '3', '4'],
          expenses: [
            {
              id: '1',
              description: 'Rent - May',
              amount: 1500,
              paidBy: '1',
              date: '2023-05-01',
              splitBetween: ['1', '3', '4'],
            },
            {
              id: '2',
              description: 'Groceries',
              amount: 120,
              paidBy: '3',
              date: '2023-05-10',
              splitBetween: ['1', '3', '4'],
            },
            {
              id: '3',
              description: 'Utilities',
              amount: 90,
              paidBy: '4',
              date: '2023-05-15',
              splitBetween: ['1', '3', '4'],
            },
          ],
          totalExpenses: 1710,
        },
        {
          id: '2',
          name: 'Trip to NYC',
          description: 'Vacation expenses',
          members: ['2', '5'],
          expenses: [
            {
              id: '1',
              description: 'Hotel',
              amount: 800,
              paidBy: '5',
              date: '2023-06-01',
              splitBetween: ['2', '5'],
            },
            {
              id: '2',
              description: 'Dinner',
              amount: 150,
              paidBy: '2',
              date: '2023-06-02',
              splitBetween: ['2', '5'],
            },
          ],
          totalExpenses: 950,
        },
      ]
      
      setGroups(mockGroups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new group
  const createGroup = async (name: string, description: string, members: string[]) => {
    setIsLoading(true)
    try {
      // In production, real API call to create group
      // const response = await fetch('/api/groups', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ name, description, members })
      // })
      // const data = await response.json()
      
      // For demo purposes, simulate creating group
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Create mock group with ID
      const newGroup: Group = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        description,
        members,
        expenses: [],
        totalExpenses: 0,
      }
      
      setGroups(prev => [...prev, newGroup])
      toast.success('Group created', {
        description: `${name} has been created.`
      })
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to create group')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Add friends to a group
  const addToGroup = async (groupId: string, friendIds: string[]) => {
    setIsLoading(true)
    try {
      // In production, real API call to add members to group
      // await fetch(`/api/groups/${groupId}/members`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ memberIds: friendIds })
      // })
      
      // For demo purposes, simulate adding to group
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          // Add only new members that aren't already in the group
          const updatedMembers = [...new Set([...group.members, ...friendIds])]
          return { ...group, members: updatedMembers }
        }
        return group
      }))
      
      const groupName = groups.find(g => g.id === groupId)?.name
      toast.success('Members added', {
        description: `${friendIds.length} member(s) added to ${groupName}.`
      })
    } catch (error) {
      console.error('Failed to add to group:', error)
      toast.error('Failed to add members to group')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Remove a friend from a group
  const removeFromGroup = async (groupId: string, friendId: string) => {
    setIsLoading(true)
    try {
      // In production, real API call to remove member from group
      // await fetch(`/api/groups/${groupId}/members/${friendId}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // })
      
      // For demo purposes, simulate removing from group
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter(id => id !== friendId)
          }
        }
        return group
      }))
      
      const groupName = groups.find(g => g.id === groupId)?.name
      const friendName = friends.find(f => f.id === friendId)?.name
      toast.success('Member removed', {
        description: `${friendName} has been removed from ${groupName}.`
      })
    } catch (error) {
      console.error('Failed to remove from group:', error)
      toast.error('Failed to remove member from group')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a group
  const deleteGroup = async (groupId: string) => {
    setIsLoading(true)
    try {
      // In production, real API call to delete group
      // await fetch(`/api/groups/${groupId}`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // })
      
      // For demo purposes, simulate deleting group
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const groupToDelete = groups.find(g => g.id === groupId)
      
      setGroups(prev => prev.filter(group => group.id !== groupId))
      toast.success('Group deleted', {
        description: groupToDelete ? `${groupToDelete.name} has been deleted.` : undefined
      })
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Add an expense to a group
  const addGroupExpense = async (groupId: string, expense: Omit<GroupExpense, 'id'>) => {
    setIsLoading(true)
    try {
      // In production, real API call to add expense to group
      // const response = await fetch(`/api/groups/${groupId}/expenses`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(expense)
      // })
      // const data = await response.json()
      
      // For demo purposes, simulate adding expense to group
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Create mock expense with ID
      const newExpense: GroupExpense = {
        ...expense,
        id: Math.random().toString(36).substring(2, 9)
      }
      
      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            expenses: [...group.expenses, newExpense],
            totalExpenses: group.totalExpenses + expense.amount
          }
        }
        return group
      }))
      
      toast.success('Expense added to group')
    } catch (error) {
      console.error('Failed to add expense to group:', error)
      toast.error('Failed to add expense to group')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate balances for a group
  const calculateGroupBalances = (group: Group): GroupBalance[] => {
    // Create a map to track how much each person has paid and owes
    const balances = new Map<string, number>()

    // Initialize balances for all members
    group.members.forEach(memberId => {
      balances.set(memberId, 0)
    })

    // Calculate net balance for each member
    group.expenses.forEach(expense => {
      const payer = expense.paidBy
      const splitBetween = expense.splitBetween
      const amountPerPerson = expense.amount / splitBetween.length

      // Add amount paid to payer's balance
      balances.set(payer, (balances.get(payer) || 0) + expense.amount)

      // Subtract amount owed from each participant's balance
      splitBetween.forEach(memberId => {
        balances.set(memberId, (balances.get(memberId) || 0) - amountPerPerson)
      })
    })

    // Create separate lists for creditors and debtors
    const debtors: { id: string, balance: number }[] = []
    const creditors: { id: string, balance: number }[] = []

    // Separate people who owe money from those who are owed
    balances.forEach((balance, id) => {
      if (balance < -0.01) {
        // Negative balance means they owe money
        debtors.push({ id, balance: -balance })
      } else if (balance > 0.01) {
        // Positive balance means they are owed money
        creditors.push({ id, balance })
      }
    })

    // Sort both lists by descending balance
    debtors.sort((a, b) => b.balance - a.balance)
    creditors.sort((a, b) => b.balance - a.balance)

    // Final balances to return
    const result: GroupBalance[] = []

    // Match debtors with creditors
    debtors.forEach(debtor => {
      let remainingDebt = debtor.balance

      for (let i = 0; i < creditors.length && remainingDebt > 0.01; i++) {
        const creditor = creditors[i]

        if (creditor.balance > 0.01) {
          // Calculate how much of this debt can be settled with this creditor
          const amount = Math.min(remainingDebt, creditor.balance)

          // Add to result
          result.push({
            fromId: debtor.id,
            toId: creditor.id,
            amount: Number.parseFloat(amount.toFixed(2))
          })

          // Update remaining amounts
          remainingDebt -= amount
          creditors[i].balance -= amount
        }
      }
    })

    return result
  }

  // Search for friends and groups based on a search term
  const searchFriendsAndGroups = (term: string) => {
    const searchTerm = term.toLowerCase()
    
    const filteredFriends = friends.filter(
      friend =>
        friend.name.toLowerCase().includes(searchTerm) ||
        friend.email.toLowerCase().includes(searchTerm)
    )
    
    const filteredGroups = groups.filter(
      group =>
        group.name.toLowerCase().includes(searchTerm) ||
        group.description.toLowerCase().includes(searchTerm)
    )
    
    return { friends: filteredFriends, groups: filteredGroups }
  }

  return (
    <FriendsContext.Provider
      value={{
        friends,
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
  )
}

// Custom hook to use the friends context
export function useFriends() {
  const context = useContext(FriendsContext)
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider')
  }
  return context
}