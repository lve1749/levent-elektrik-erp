'use client';

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type QuantityRange = '0-50' | '50-100' | '100-500' | '500-1000' | '1000-5000' | '5000+'

interface AdvancedQuantityFilterProps {
  selectedRanges: QuantityRange[]
  onChange: (ranges: QuantityRange[]) => void
}

const quantityOptions: { value: QuantityRange; label: string; color: string; range: string }[] = [
  { value: '0-50', label: 'Çok Düşük', color: 'bg-red-500 dark:bg-red-400', range: '0-50' },
  { value: '50-100', label: 'Düşük', color: 'bg-gray-500 dark:bg-gray-400', range: '50-100' },
  { value: '100-500', label: 'Orta', color: 'bg-blue-500 dark:bg-blue-400', range: '100-500' },
  { value: '500-1000', label: 'Yüksek', color: 'bg-indigo-500 dark:bg-indigo-400', range: '500-1.000' },
  { value: '1000-5000', label: 'Çok Yüksek', color: 'bg-green-500 dark:bg-green-400', range: '1.000-5.000' },
  { value: '5000+', label: 'Aşırı Yüksek', color: 'bg-orange-500 dark:bg-orange-400', range: '5.000+' },
]

export default function AdvancedQuantityFilter({ selectedRanges, onChange }: AdvancedQuantityFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (range: QuantityRange) => {
    if (selectedRanges.includes(range)) {
      onChange(selectedRanges.filter(r => r !== range))
    } else {
      onChange([...selectedRanges, range])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  const handleSelectAll = () => {
    onChange(quantityOptions.map(opt => opt.value))
  }

  const getDisplayContent = () => {
    if (selectedRanges.length === 0) {
      return <span>Miktar Aralığı</span>
    }
    if (selectedRanges.length === quantityOptions.length) {
      return <span>Tüm Miktarlar</span>
    }
    if (selectedRanges.length === 1) {
      const range = quantityOptions.find(opt => opt.value === selectedRanges[0])
      if (range) {
        return (
          <span className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", range.color)} />
            <span>{range.label}</span>
          </span>
        )
      }
    }
    return <span>{selectedRanges.length} aralık seçili</span>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox"
          aria-expanded={open}
          className="w-full h-[34px] rounded-lg font-inter text-[12px] justify-between font-normal px-2 bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] border-gray-200 dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
        >
          <span className="text-left flex-1 truncate">{getDisplayContent()}</span>
          <ChevronDown className="ml-1 h-3.5 w-3.5 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)]" align="start">
        <div className="flex flex-col">
          <div className="px-2 py-2 max-h-[300px] overflow-y-auto">
            {quantityOptions.map((option) => {
              const isSelected = selectedRanges.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-[12px] rounded-md mb-0.5",
                    "hover:bg-gray-100 dark:hover:bg-[oklch(0.27_0.00_0)] transition-colors"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", option.color)} />
                    <span className="text-gray-900 dark:text-[oklch(0.87_0.00_0)]">{option.label}</span>
                    <span className="text-gray-500 dark:text-[oklch(0.71_0.00_0)]">({option.range})</span>
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-[oklch(0.55_0.22_263)] stroke-[3] flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
          
          <div className="flex justify-between px-2 py-1.5 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
            <button
              onClick={handleSelectAll}
              className="text-[12px] text-blue-600 hover:text-blue-700 dark:text-[oklch(0.55_0.22_263)] dark:hover:text-[oklch(0.62_0.19_260)] font-normal px-2 py-1"
            >
              Tümünü Seç
            </button>
            <button
              onClick={handleClear}
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