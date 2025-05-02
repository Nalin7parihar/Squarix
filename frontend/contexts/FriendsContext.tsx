"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { toast } from 'sonner'
import { API_URL } from '@/lib/config'

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
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>
  groups: Group[]
  isLoading: boolean
  addFriend: (name: string, email: string) => Promise<void>
  removeFriend: (id: string) => Promise<void>
  getFriends: () => Promise<void>
  createGroup: (name: string, description: string, members: string[]) => Promise<void>
  addToGroup: (groupId: string, friendId: string) => Promise<void>
  removeFromGroup: (groupId: string, friendId: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  getGroups: () => Promise<void>
  addGroupExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => Promise<void>
  calculateGroupBalances: (group: Group) => GroupBalance[]
  searchFriendsAndGroups: (term: string) => { friends: Friend[], groups: Group[] }
}

// Create context
const FriendsContext = createContext<FriendsState | undefined>(undefined)

export function FriendsProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    getFriends()
    getGroups()
  }, [])

  const getFriends = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch friends:', errorText)
        throw new Error('Failed to fetch friends')
      }
      
      const data = await response.json()
      if (!Array.isArray(data)) {
        console.error('Unexpected friends data format:', data)
        throw new Error('Invalid friends data format')
      }
      
      const transformedFriends = data.map((friend: any) => ({
        id: friend.friend._id,
        name: friend.friend.name,
        email: friend.friend.email,
        totalOwed: 0,
        totalOwes: 0
      }))
      
      setFriends(transformedFriends)
    } catch (error) {
      console.error('Failed to fetch friends:', error)
      toast.error('Failed to load friends')
    } finally {
      setIsLoading(false)
    }
  }

  const addFriend = async (name: string, email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/friends`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to add friend')

      const data = await response.json()
      const newFriend: Friend = {
        id: data.newFriend.friend,
        name: name || email.split('@')[0],
        email,
        totalOwed: 0,
        totalOwes: 0
      }
      
      setFriends(prev => [...prev, newFriend])
      toast.success('Friend added successfully')
    } catch (error) {
      console.error('Failed to add friend:', error)
      toast.error('Failed to add friend')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFriend = async (id: string) => {
    setIsLoading(true)
    try {
      console.log('Removing friend with ID:', id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to remove friend:', errorText);
        throw new Error('Failed to remove friend');
      }

      const friendToRemove = friends.find(f => f.id === id)
      setFriends(prev => prev.filter(friend => friend.id !== id))
      
      // Remove from all groups as well
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

  const getGroups = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups`, {
        credentials: 'include',
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Failed to fetch groups')
      const data = await response.json()
      
      const transformedGroups: Group[] = data.groups.map((group: any) => ({
        id: group._id,
        name: group.name,
        description: group.description || '',
        members: group.members.map((member: any) => member._id),
        expenses: group.expenses || [],
        totalExpenses: group.totalExpense || 0
      }))
      
      setGroups(transformedGroups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }

  const createGroup = async (name: string, description: string, members: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, members }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to create group')

      const data = await response.json()
      const newGroup: Group = {
        id: data.group._id,
        name: data.group.name,
        description: description || '',
        members: data.group.members.map((m: any) => m._id),
        expenses: [],
        totalExpenses: 0
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

  const addToGroup = async (groupId: string, friendId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: friendId }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to add member to group')

      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: [...group.members, friendId]
          }
        }
        return group
      }))
      
      const groupName = groups.find(g => g.id === groupId)?.name
      const friendName = friends.find(f => f.id === friendId)?.name
      toast.success('Member added', {
        description: `${friendName} has been added to ${groupName}.`
      })
    } catch (error) {
      console.error('Failed to add to group:', error)
      toast.error('Failed to add member to group')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromGroup = async (groupId: string, friendId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: friendId }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to remove member from group')
      
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

  const deleteGroup = async (groupId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to delete group')
      
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

  const addGroupExpense = async (groupId: string, expense: Omit<GroupExpense, 'id'>) => {
    setIsLoading(true)
    try {
      // This endpoint will need to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to add expense to group')

      const data = await response.json()
      const newExpense: GroupExpense = {
        ...expense,
        id: data.expense._id
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
      if (balance < -0.01) {
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
        setFriends,
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