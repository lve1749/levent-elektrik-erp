'use client'

import { ReactNode, useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useRefresh } from "@/contexts/RefreshContext"

interface SidebarWrapperProps {
  children: ReactNode
  lastRefreshTime?: Date | null
  alertCount?: number
  refreshHistory?: Array<{ time: Date; success: boolean }>
  hideLastUpdate?: boolean
}

const SIDEBAR_COOKIE_NAME = "sidebar_state"

export function SidebarWrapper({ children, hideLastUpdate = false }: SidebarWrapperProps) {
  // Context'ten refresh verilerini al
  const { lastRefreshTime, alertCount, refreshHistory } = useRefresh()
  
  // Cookie'den sidebar durumunu oku
  const [defaultOpen, setDefaultOpen] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    // Cookie'den sidebar durumunu oku
    const cookies = document.cookie.split(';')
    const sidebarCookie = cookies.find(cookie => cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`))
    
    if (sidebarCookie) {
      const value = sidebarCookie.split('=')[1]
      setDefaultOpen(value === 'true')
    }
  }, [])
  
  // Client-side rendering'i bekle
  if (!isClient) {
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar 
          lastRefreshTime={hideLastUpdate ? undefined : lastRefreshTime}
          alertCount={hideLastUpdate ? undefined : alertCount}
          refreshHistory={hideLastUpdate ? [] : refreshHistory}
        />
        <SidebarInset className="overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar 
        lastRefreshTime={hideLastUpdate ? undefined : lastRefreshTime}
        alertCount={hideLastUpdate ? undefined : alertCount}
        refreshHistory={hideLastUpdate ? [] : refreshHistory}
      />
      <SidebarInset className="overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}