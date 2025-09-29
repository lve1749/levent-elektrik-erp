'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HelpTreeItem } from './help-data'

interface HelpTreeMenuProps {
  treeData: HelpTreeItem[]
  selectedItem: string
  expandedItems: string[]
  onSelectItem: (itemId: string) => void
  onToggleExpand: (itemId: string) => void
}

export default function HelpTreeMenu({
  treeData,
  selectedItem,
  expandedItems,
  onSelectItem,
  onToggleExpand
}: HelpTreeMenuProps) {
  
  const renderTreeItem = (item: HelpTreeItem, level: number = 0) => {
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isSelected = selectedItem === item.id
    const isDisabled = item.disabled

    return (
      <div key={item.id}>
        <button
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
            !isDisabled && "hover:bg-[oklch(0.94_0.00_0)] dark:hover:bg-[oklch(0.17_0.00_0)]",
            isSelected && !isDisabled && "bg-[oklch(0.93_0.03_256)] dark:bg-[oklch(0.28_0.09_268)]",
            level === 0 ? "font-medium" : "font-normal",
            isDisabled && "cursor-not-allowed opacity-50"
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => {
            if (!isDisabled) {
              onSelectItem(item.id)
              if (hasChildren) {
                onToggleExpand(item.id)
              }
            }
          }}
          disabled={isDisabled}
        >
          {hasChildren && (
            <ChevronRight 
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                isExpanded && "rotate-90",
                isDisabled && "text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)]"
              )}
            />
          )}
          {!hasChildren && <div className="w-3.5" />}
          <Icon className={cn(
            "h-3.5 w-3.5",
            level === 0 
              ? isDisabled 
                ? "text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)]" 
                : "text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" 
              : isDisabled
                ? "text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]"
                : "text-[oklch(0.60_0.00_0)]"
          )} />
          <span className={cn(
            "flex-1 text-left",
            level === 0 ? "text-[13px]" : "text-[12px]",
            level === 0 
              ? isDisabled
                ? "text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)]"
                : "text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]" 
              : isDisabled
                ? "text-[oklch(0.70_0.00_0)] dark:text-[oklch(0.40_0.00_0)]"
                : "text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]"
          )}>
            {item.name}
          </span>
        </button>
        {hasChildren && isExpanded && !isDisabled && (
          <div className="mt-0.5">
            {item.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="col-span-1 h-full min-h-0">
      <div className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] h-full flex flex-col">
        {/* Sabit Başlık */}
        <div className="px-4 pt-4 pb-3 border-b border-[oklch(0.92_0.00_0_/_0.3)] dark:border-[oklch(0.27_0.00_0_/_0.3)] flex-shrink-0">
          <h3 className="text-[14px] font-semibold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
            Konular
          </h3>
        </div>
        {/* Scrollable İçerik */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-1">
              {treeData.length > 0 ? (
                treeData.map(item => renderTreeItem(item))
              ) : (
                <div className="text-center py-4 px-2">
                  <p className="text-[12px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
                    Arama kriterinize uygun konu bulunamadı
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}