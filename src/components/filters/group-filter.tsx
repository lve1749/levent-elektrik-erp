import { useState, useMemo, useRef, useEffect } from 'react'
import { useGroups } from '@/hooks/use-groups'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface GroupFilterProps {
  value: string | null
  onChange: (value: string | null) => void
  horizontal?: boolean
  fullWidth?: boolean
}

export default function GroupFilter({ value, onChange, horizontal = false, fullWidth = false }: GroupFilterProps) {
  const { groups, loading } = useGroups()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrelenmiş gruplar
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups
    
    const searchLower = searchTerm.toLowerCase()
    return groups.filter(grup => 
      grup.grupIsmi.toLowerCase().includes(searchLower) ||
      grup.grupKodu.toLowerCase().includes(searchLower)
    )
  }, [groups, searchTerm])

  // Seçili grubun adını bul
  const selectedGroupName = useMemo(() => {
    if (!value || value === 'all') return 'Tüm gruplar'
    const group = groups.find(g => g.grupKodu === value)
    return group?.grupIsmi || value
  }, [value, groups])

  // Dropdown açıldığında arama kutusuna focus
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchTerm('')
    }
  }, [open])

  const handleSelect = (grupKodu: string | null) => {
    onChange(grupKodu)
    setOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={cn(
      "flex w-full",
      horizontal ? "flex-col xl:flex-row xl:items-center gap-1.5 xl:gap-2 xl:min-w-0" : "flex-col gap-1.5"
    )}>
      <label className="text-[13px] font-medium text-[oklch(0.37_0.00_0)] dark:text-[oklch(0.71_0.01_286)] whitespace-nowrap flex-shrink-0">
        Ana Grup
      </label>
      <div className={horizontal ? "xl:flex-1 xl:min-w-0 w-full" : "w-full"}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={loading}
            className={cn(
              "h-[34px] justify-between text-[13px] rounded-lg bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] border-[oklch(0.92_0.00_0_/_0.5)] text-[oklch(0.20_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0_/_0.5)] dark:text-[oklch(0.87_0.01_286)] font-normal transition-all duration-200 shadow-none overflow-hidden",
              fullWidth ? "w-full" : "w-[180px]"
            )}
          >
            <span className="truncate block min-w-0">
              {loading ? "Yükleniyor..." : selectedGroupName}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
          <div className="space-y-2">
            {/* Arama Kutusu */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Grup ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 pr-2 text-sm bg-white dark:bg-[oklch(0.14_0.00_0)] border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
              />
            </div>
            
            {/* Gruplar Listesi */}
            <ScrollArea className="h-60">
              <div className="space-y-1">
                <button
                  onClick={() => handleSelect(null)}
                  className={cn(
                    "flex w-full items-center rounded-sm px-2 py-1.5 text-[13px] hover:bg-gray-100 dark:hover:bg-[oklch(0.27_0.00_0)] cursor-pointer transition-colors",
                    (!value || value === 'all') && "bg-gray-100 dark:bg-[oklch(0.27_0.00_0)]"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-blue-600 dark:text-blue-500",
                      (!value || value === 'all') ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Tüm gruplar
                </button>
                
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((grup) => (
                    <button
                      key={grup.grupKodu}
                      onClick={() => handleSelect(grup.grupKodu)}
                      className={cn(
                        "flex w-full items-center rounded-sm px-2 py-1.5 text-[13px] hover:bg-gray-100 dark:hover:bg-[oklch(0.27_0.00_0)] cursor-pointer transition-colors text-left",
                        value === grup.grupKodu && "bg-gray-100 dark:bg-[oklch(0.27_0.00_0)]"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-500",
                          value === grup.grupKodu ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{grup.grupIsmi}</span>
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-[13px] text-gray-500 dark:text-gray-400">
                    Arama sonucu bulunamadı
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
      </div>
    </div>
  )
}