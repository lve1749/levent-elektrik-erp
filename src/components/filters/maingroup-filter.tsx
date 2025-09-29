import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MainGroupFilterProps {
  mainGroups: string[]
  selectedMainGroups: string[]
  onChange: (mainGroups: string[]) => void
  disabled?: boolean
}

export default function MainGroupFilter({ 
  mainGroups, 
  selectedMainGroups, 
  onChange, 
  disabled = false 
}: MainGroupFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (mainGroup: string) => {
    if (selectedMainGroups.includes(mainGroup)) {
      onChange(selectedMainGroups.filter(g => g !== mainGroup))
    } else {
      onChange([...selectedMainGroups, mainGroup])
    }
  }

  const handleClear = () => {
    onChange(['__NONE__']) // Özel bir değer ile hiçbir şeyin seçili olmadığını belirt
  }

  const handleSelectAll = () => {
    onChange([]) // Boş array = tümü seçili
  }

  const isNoneSelected = selectedMainGroups.includes('__NONE__')
  const isAllSelected = selectedMainGroups.length === 0
  const visibleCount = isNoneSelected ? 0 : (isAllSelected ? mainGroups.length : selectedMainGroups.length)
  const totalCount = mainGroups.length

  const getDisplayContent = () => {
    if (isNoneSelected) {
      return <span>Ana Grup</span>
    }
    if (isAllSelected) {
      return <span>Tüm Ana Gruplar</span>
    }
    if (selectedMainGroups.length === 1) {
      return <span>{selectedMainGroups[0] || "Boş"}</span>
    }
    return <span>{selectedMainGroups.length} ana grup seçili</span>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox"
          aria-expanded={open}
          className="w-full h-[34px] rounded-lg font-inter text-[12px] justify-between font-normal px-2 bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] border-gray-200 dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
          disabled={disabled || totalCount === 0}
        >
          <span className="text-left flex-1 truncate">{getDisplayContent()}</span>
          <ChevronDown className="ml-1 h-3.5 w-3.5 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1 dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)]" align="start">
        <div className="flex flex-col">
          <ScrollArea className="h-[280px]">
            <div className="px-1 py-1">
            {mainGroups.map((mainGroup) => {
              const isNoneSelected = selectedMainGroups.includes('__NONE__')
              const isSelected = !isNoneSelected && (selectedMainGroups.length === 0 || selectedMainGroups.includes(mainGroup))
              return (
                <button
                  key={mainGroup}
                  onClick={() => {
                    const isNoneSelected = selectedMainGroups.includes('__NONE__')
                    if (isNoneSelected) {
                      // Hiçbiri seçili değilse, sadece bunu seç
                      onChange([mainGroup])
                    } else if (selectedMainGroups.length === 0) {
                      // Tümü seçiliyse, bu hariç diğerlerini seç
                      onChange(mainGroups.filter(g => g !== mainGroup))
                    } else {
                      handleToggle(mainGroup)
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-[12px] rounded-md mb-0.5",
                    "hover:bg-gray-100 dark:hover:bg-[oklch(0.27_0.00_0)] transition-colors"
                  )}
                >
                  <span className="text-gray-900 dark:text-[oklch(0.87_0.00_0)] truncate mr-2">
                    {mainGroup || "Boş"}
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-[oklch(0.55_0.22_263)] stroke-[3] flex-shrink-0" />
                  )}
                </button>
              )
            })}
            </div>
          </ScrollArea>
          
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