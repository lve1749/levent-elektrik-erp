import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bell } from 'lucide-react'
import { StockAlert, AlertStats } from '@/types'
import { PopoverHeader, PopoverStats } from './header'
import PopoverTabs from './tabs'
import PopoverContentSection from './content'
import { UI_CONSTANTS } from '../shared/constants'

interface StockAlertPopoverProps {
  alerts: StockAlert[]
  readAlerts: StockAlert[]
  stats: AlertStats
  onInspect: (stokKodu: string, anaGrupKodu?: string) => void
  onMarkAsRead: (alertId: string) => void
  onDismiss: (alertId: string) => void
  onMarkAllAsRead: () => void
  onAddNote: (alertId: string, text: string) => void
  onDeleteNote: (alertId: string, noteId: string) => void
}

/**
 * Stock Alert Popover - Ana Component
 * Tüm uyarıları gösteren popover
 */
export default function StockAlertPopover({
  alerts,
  readAlerts,
  stats,
  onInspect,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead,
  onAddNote,
  onDeleteNote
}: StockAlertPopoverProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'read'>('active')

  // Inspect handler - popover'ı kapat
  const handleInspect = useCallback((stokKodu: string, anaGrupKodu?: string) => {
    onInspect(stokKodu, anaGrupKodu)
    setOpen(false)
  }, [onInspect])

  // Gösterilecek uyarıları belirle
  const displayAlerts = useMemo(() => {
    return activeTab === 'active' ? alerts : readAlerts
  }, [activeTab, alerts, readAlerts])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-9 px-3 hover:bg-gray-100"
        >
          <Bell className="h-4 w-4 text-gray-600" />
          {stats.unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center font-medium">
              {stats.unread > 99 ? '99+' : stats.unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[520px] p-0 border-gray-200"
        align="end"
        sideOffset={8}
      >
        {/* Başlık */}
        <div className="px-4 py-3 border-b border-gray-200">
          <PopoverHeader 
            unreadCount={stats.unread}
            onMarkAllAsRead={onMarkAllAsRead}
          />
          <PopoverStats stats={stats} />
        </div>

        {/* Tabs */}
        <PopoverTabs
          activeTab={activeTab}
          activeCount={alerts.length}
          readCount={readAlerts.length}
          onTabChange={setActiveTab}
        />

        {/* İçerik */}
        <PopoverContentSection
          alerts={displayAlerts}
          activeTab={activeTab}
          onInspect={handleInspect}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
        />
      </PopoverContent>
    </Popover>
  )
}