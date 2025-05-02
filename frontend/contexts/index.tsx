'use client';

import React, { ReactNode } from 'react'

// Export all contexts and their hooks
export { AuthProvider, useAuth, type User } from './AuthContext'
export { ExpenseProvider, useExpenses } from './ExpenseContext'
export { FriendsProvider, useFriends, type Friend, type Group } from './FriendsContext'
export { UIProvider, useUI, type Theme, type SidebarState } from './UIContext'
export { TransactionProvider, useTransactions, type Transaction } from './TransactionContext';

// Export a combined provider for wrapping the entire app
import { AuthProvider } from './AuthContext'
import { ExpenseProvider } from './ExpenseContext'
import { FriendsProvider } from './FriendsContext'
import { UIProvider } from './UIContext'
import { TransactionProvider } from './TransactionContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <FriendsProvider>
        <ExpenseProvider>
          <TransactionProvider key="transaction-provider">
            <UIProvider>
              {children}
            </UIProvider>
          </TransactionProvider>
        </ExpenseProvider>
      </FriendsProvider>
    </AuthProvider>
  )
}