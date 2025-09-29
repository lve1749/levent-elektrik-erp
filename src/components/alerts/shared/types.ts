/**
 * Stok Uyarı Sistemi - Paylaşılan Tipler
 */

import { StockAlert, AlertStats } from '@/types'

// Alert Card Props
export interface AlertCardProps {
  alert: StockAlert
  onInspect: (stokKodu: string, anaGrupKodu?: string) => void
  onMarkAsRead: (alertId: string) => void
  onDismiss: (alertId: string) => void
  onAddNote: (alertId: string, text: string) => void
  onDeleteNote: (alertId: string, noteId: string) => void
}

// Alert Card Section Props
export interface AlertCardHeaderProps {
  stokKodu: string
  stokIsmi: string
  onInspect: () => void
}

export interface AlertProgressProps {
  kalanMiktar: number
  aylikOrtalamaSatis: number
  ortalamaAylikStok: number
  onerilenSiparis: number
  severity: 'critical' | 'high' | 'medium'
}

export interface AlertNotesProps {
  notes?: StockAlert['notes']
  onAddNote: (text: string) => void
  onDeleteNote: (noteId: string) => void
}

export interface AlertActionsProps {
  alertId: string
  isRead: boolean
  onMarkAsRead: () => void
  onDismiss: () => void
  onToggleNoteInput: () => void
}

// Popover Section Props
export interface PopoverHeaderProps {
  unreadCount: number
  onMarkAllAsRead: () => void
}

export interface PopoverStatsProps {
  stats: AlertStats
}

export interface PopoverTabsProps {
  activeTab: 'active' | 'read'
  activeCount: number
  readCount: number
  onTabChange: (tab: 'active' | 'read') => void
}

export interface PopoverContentProps {
  alerts: StockAlert[]
  activeTab: 'active' | 'read'
  onInspect: (stokKodu: string, anaGrupKodu?: string) => void
  onMarkAsRead: (alertId: string) => void
  onDismiss: (alertId: string) => void
  onAddNote: (alertId: string, text: string) => void
  onDeleteNote: (alertId: string, noteId: string) => void
}

// Shared Component Props
export interface SeverityIndicatorProps {
  severity: 'critical' | 'high' | 'medium'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export interface StockStatsProps {
  kalanMiktar: number
  aylikOrtalamaSatis: number
  ortalamaAylikStok: number
  unit?: string
}