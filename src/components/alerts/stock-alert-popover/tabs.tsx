import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PopoverTabsProps } from '../shared/types'

/**
 * Popover Tabs - Aktif/Okundu sekmeleri
 * ReUI tabs tasarımı kullanılıyor
 */
export default function PopoverTabs({
  activeTab,
  activeCount,
  readCount,
  onTabChange
}: PopoverTabsProps) {
  return (
    <div className="px-4 pt-2 pb-0">
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => onTabChange(v as 'active' | 'read')}
        className="w-full"
      >
        <TabsList 
          variant="default" 
          size="sm"
          className="w-full"
        >
          <TabsTrigger 
            value="active" 
            className="flex-1"
          >
            Aktif ({activeCount})
          </TabsTrigger>
          <TabsTrigger 
            value="read" 
            className="flex-1"
          >
            Okundu ({readCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}