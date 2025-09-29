import React from 'react'
import { Button } from '@/components/ui/button'
import { PopoverHeaderProps, PopoverStatsProps } from '../shared/types'
import { SEVERITY_CONFIGS } from '../shared/constants'
import SeverityIndicator from '../shared/severity-indicator'

/**
 * Popover Header - Başlık ve istatistikler
 */
export function PopoverHeader({ unreadCount, onMarkAllAsRead }: PopoverHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-900">
        Stok Uyarıları
      </h3>
      {unreadCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs px-2 hover:bg-gray-100"
          onClick={onMarkAllAsRead}
        >
          Tümünü Okundu İşaretle
        </Button>
      )}
    </div>
  )
}

/**
 * Popover Stats - Uyarı istatistikleri
 */
export function PopoverStats({ stats }: PopoverStatsProps) {
  if (stats.unread === 0) return null

  return (
    <div className="flex items-center gap-3 mt-2 text-xs">
      {stats.critical > 0 && (
        <div className="flex items-center gap-1.5">
          <SeverityIndicator severity="critical" size="sm" />
          <span className="text-gray-600">{stats.critical} Kritik</span>
        </div>
      )}
      {stats.high > 0 && (
        <div className="flex items-center gap-1.5">
          <SeverityIndicator severity="high" size="sm" />
          <span className="text-gray-600">{stats.high} Yüksek</span>
        </div>
      )}
      {stats.medium > 0 && (
        <div className="flex items-center gap-1.5">
          <SeverityIndicator severity="medium" size="sm" />
          <span className="text-gray-600">{stats.medium} Orta</span>
        </div>
      )}
    </div>
  )
}