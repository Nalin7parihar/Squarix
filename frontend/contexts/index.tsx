'use client';

import React, { ReactNode } from 'react'

// Export all contexts and their hooks
export { AuthProvider, useAuth, type User } from './AuthContext'
export { ExpenseProvider, useExpenses } from './ExpenseContext'
export { FriendsProvider, useFriends, type Friend, type Group } from './FriendsContext'
export { UIProvider, useUI, type Theme, type SidebarState } from './UIContext'

// Export a combined provider for wrapping the entire app
import { AuthProvider } from './AuthContext'
import { ExpenseProvider } from './ExpenseContext'
import { FriendsProvider } from './FriendsContext'
import { UIProvider } from './UIContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <FriendsProvider>
        <ExpenseProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </ExpenseProvider>
      </FriendsProvider>
    </AuthProvider>
  )
}