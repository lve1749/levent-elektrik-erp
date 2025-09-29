'use client'

import { HelpCircle, ChevronRight } from 'lucide-react'
import { helpContents } from './help-contents'
import { helpTreeData } from './help-data'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HelpContentProps {
  selectedItem: string
}

export default function HelpContent({ selectedItem }: HelpContentProps) {
  // Breadcrumb için parent ve child bilgilerini bul
  const getBreadcrumb = () => {
    if (!selectedItem) return null
    
    // Parent kategoriyi bul
    const parent = helpTreeData.find(item => item.id === selectedItem)
    if (parent) {
      return parent.name
    }
    
    // Child ise parent'ı bul
    for (const parentItem of helpTreeData) {
      const child = parentItem.children?.find(c => c.id === selectedItem)
      if (child) {
        return (
          <div className="flex items-center gap-1.5 text-[14px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
            <span>{parentItem.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">{child.name}</span>
          </div>
        )
      }
    }
    return null
  }

  const renderContent = () => {
    const content = helpContents[selectedItem]
    if (!content) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-[oklch(0.60_0.00_0)] mb-4" />
            <p className="text-[14px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
              Lütfen sol taraftaki menüden bir konu seçin.
            </p>
          </div>
        </div>
      )
    }
    
    return (
      <>
        {/* Başlık Kısmı - Soldaki ile aynı hizada */}
        <div className="px-4 pt-4 pb-3 border-b border-[oklch(0.92_0.00_0_/_0.3)] dark:border-[oklch(0.27_0.00_0_/_0.3)] flex-shrink-0">
          <h3 className="text-[14px] font-semibold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
            {getBreadcrumb()}
          </h3>
        </div>
        {/* Scrollable İçerik */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {content}
            </div>
          </ScrollArea>
        </div>
      </>
    )
  }

  return (
    <div className="col-span-4 h-full min-h-0">
      <div className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] h-full flex flex-col">
        {renderContent()}
      </div>
    </div>
  )
}