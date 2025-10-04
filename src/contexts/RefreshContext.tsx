"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface RefreshHistoryItem {
  time: Date
  success: boolean
  groupName?: string
}

interface RefreshContextType {
  lastRefreshTime: Date | null
  alertCount: number
  refreshHistory: RefreshHistoryItem[]
  setLastRefreshTime: (time: Date | null) => void
  setAlertCount: (count: number) => void
  addRefreshHistory: (item: RefreshHistoryItem) => void
  clearRefreshHistory: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [alertCount, setAlertCount] = useState(0)
  const [refreshHistory, setRefreshHistory] = useState<RefreshHistoryItem[]>([])

  const addRefreshHistory = (item: RefreshHistoryItem) => {
    setRefreshHistory(prev => [item, ...prev].slice(0, 5)) // Son 5 kayıt
  }

  const clearRefreshHistory = () => {
    setRefreshHistory([])
  }

  return (
    <RefreshContext.Provider
      value={{
        lastRefreshTime,
        alertCount,
        refreshHistory,
        setLastRefreshTime,
        setAlertCount,
        addRefreshHistory,
        clearRefreshHistory,
      }}
    >
      {children}
    </RefreshContext.Provider>
  )
}

export function useRefresh() {
  const context = useContext(RefreshContext)
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider')
  }
  return context
}