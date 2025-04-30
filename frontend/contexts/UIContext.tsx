"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useTheme } from 'next-themes'

export type Theme = 'light' | 'dark' | 'system'
export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

// Context state interface
interface UIState {
  theme: Theme
  setTheme: (theme: Theme) => void
  sidebarState: SidebarState
  setSidebarState: (state: SidebarState) => void
  isMobile: boolean
  isAddExpenseOpen: boolean
  setAddExpenseOpen: (open: boolean) => void
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void
  activeTab: string
  setActiveTab: (tabId: string) => void
  tabs: Record<string, string>
}

// Create context
const UIContext = createContext<UIState | undefined>(undefined)

// Provider props
interface UIProviderProps {
  children: ReactNode
}

export function UIProvider({ children }: UIProviderProps) {
  // Theme integration with next-themes
  const { theme, setTheme: setNextTheme } = useTheme()
  
  // Track sidebar state
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded')
  
  // Track responsive state
  const [isMobile, setIsMobile] = useState(false)
  
  // Modal states
  const [isAddExpenseOpen, setAddExpenseOpen] = useState(false)
  const [isSearchOpen, setSearchOpen] = useState(false)
  
  // Active tab state for different pages
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Tab mappings for different sections
  const tabs: Record<string, string> = {
    // Dashboard tabs
    'dashboard': 'Dashboard',
    'expenses': 'Expenses',
    'analytics': 'Analytics',
    
    // Activity tabs
    'all': 'All Expenses',
    'youowe': 'You Owe',
    'owedtoyou': 'Owed to You',
    'settled': 'Settled',
    
    // Friends tabs
    'friends': 'Friends',
    'groups': 'Groups',
    
    // Settings tabs
    'profile': 'Profile',
    'account': 'Account',
    'notifications': 'Notifications',
  }
  
  // Set theme as a wrapper around next-themes
  const setUITheme = (newTheme: Theme) => {
    setNextTheme(newTheme)
  }
  
  // Check for mobile on initial render and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarState('collapsed')
      } else {
        setSidebarState('expanded')
      }
    }
    
    // Set initial value
    checkIfMobile()
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return (
    <UIContext.Provider
      value={{
        theme: (theme as Theme) || 'system',
        setTheme: setUITheme,
        sidebarState,
        setSidebarState,
        isMobile,
        isAddExpenseOpen,
        setAddExpenseOpen,
        isSearchOpen,
        setSearchOpen,
        activeTab,
        setActiveTab,
        tabs,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

// Custom hook to use the UI context
export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}