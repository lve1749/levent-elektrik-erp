'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface TableColumn {
  key: string
  label: string
  visible: boolean
}

interface ColumnFilterProps {
  columns: TableColumn[]
  onColumnsChange: (columns: TableColumn[]) => void
}

export default function ColumnFilter({ columns, onColumnsChange }: ColumnFilterProps) {
  const [open, setOpen] = useState(false)
  
  const visibleCount = columns.filter(col => col.visible && col.key !== 'checkbox').length
  const totalCount = columns.filter(col => col.key !== 'checkbox').length
  
  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    )
    onColumnsChange(updatedColumns)
  }
  
  const getDisplayContent = () => {
    if (visibleCount === 0) {
      return <span>Görünecek Kolonlar</span>
    }
    if (visibleCount === totalCount) {
      return <span>Tüm Kolonlar</span>
    }
    if (visibleCount === 1) {
      const visibleColumn = columns.find(col => col.visible && col.key !== 'checkbox')
      return <span>{visibleColumn?.label}</span>
    }
    return <span>{visibleCount} kolon seçili</span>
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox"
          aria-expanded={open}
          className="w-full h-[34px] rounded-lg justify-between font-inter text-[12px] font-normal px-2 bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] border-gray-200 dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
        >
          <span className="text-left flex-1 truncate">{getDisplayContent()}</span>
          <ChevronDown className="ml-1 h-3.5 w-3.5 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1 dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)]" align="start">
        <div className="flex flex-col">
          <ScrollArea className="h-[280px]">
            <div className="px-1 py-1">
            {columns
              .filter(column => column.key !== 'checkbox')
              .map((column) => (
                <button
                  key={column.key}
                  onClick={() => handleColumnToggle(column.key)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-[12px] rounded-md mb-0.5",
                    "hover:bg-gray-100 dark:hover:bg-[oklch(0.27_0.00_0)] transition-colors"
                  )}
                >
                  <span className="text-gray-900 dark:text-[oklch(0.87_0.00_0)] truncate mr-2">
                    {column.label}
                  </span>
                  {column.visible && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-[oklch(0.55_0.22_263)] stroke-[3] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between px-2 py-1.5 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
            <button
              onClick={() => onColumnsChange(columns.map(col => ({ ...col, visible: true })))}
              className="text-[12px] text-blue-600 hover:text-blue-700 dark:text-[oklch(0.55_0.22_263)] dark:hover:text-[oklch(0.62_0.19_260)] font-normal px-2 py-1"
            >
              Tümünü Seç
            </button>
            <button
              onClick={() => onColumnsChange(columns.map(col => ({ ...col, visible: false })))}
              className="text-[12px] text-gray-500 hover:text-gray-700 dark:text-[oklch(0.71_0.00_0)] dark:hover:text-[oklch(0.87_0.00_0)] font-normal px-2 py-1"
            >
              Temizle
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}