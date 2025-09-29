import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GrupBilgisi } from '@/types'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiGroupFilterProps {
  groups: GrupBilgisi[]
  selectedGroups: string[]
  onChange: (groups: string[]) => void
  loading?: boolean
}

export default function MultiGroupFilter({ groups, selectedGroups, onChange, loading }: MultiGroupFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (grupKodu: string) => {
    if (selectedGroups.includes(grupKodu)) {
      onChange(selectedGroups.filter(g => g !== grupKodu))
    } else {
      onChange([...selectedGroups, grupKodu])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  const handleSelectAll = () => {
    onChange(groups.map(g => g.grupKodu))
  }

  const getDisplayText = () => {
    if (selectedGroups.length === 0) {
      return "Grup seçin"
    }
    if (selectedGroups.length === 1) {
      const group = groups.find(g => g.grupKodu === selectedGroups[0])
      return group?.grupIsmi || selectedGroups[0]
    }
    return `${selectedGroups.length} grup seçili`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between h-9"
          disabled={loading}
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="border-b border-gray-200 p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedGroups.length} / {groups.length} seçili
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 text-xs"
              >
                Tümünü Seç
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 text-xs"
              >
                Temizle
              </Button>
            </div>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Yükleniyor...
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Grup bulunamadı
            </div>
          ) : (
            <div className="space-y-1">
              {groups.map((group) => {
                const isSelected = selectedGroups.includes(group.grupKodu)
                return (
                  <button
                    key={group.grupKodu}
                    onClick={() => handleToggle(group.grupKodu)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 transition-colors",
                      isSelected && "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isSelected 
                          ? "border-blue-600 bg-blue-600 text-white" 
                          : "border-gray-300"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className={cn(
                        "font-medium",
                        isSelected && "text-blue-900"
                      )}>
                        {group.grupIsmi}
                      </span>
                    </span>
                    {isSelected && (
                      <Badge 
                        variant="primary" 
                        appearance="light" 
                        className="text-[10px] px-1.5 py-0"
                      >
                        Seçili
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        {selectedGroups.length > 0 && (
          <div className="border-t border-gray-200 p-2">
            <div className="flex flex-wrap gap-1">
              {selectedGroups.map(grupKodu => {
                const group = groups.find(g => g.grupKodu === grupKodu)
                return (
                  <Badge 
                    key={grupKodu}
                    variant="secondary"
                    className="text-[11px] pr-1"
                  >
                    {group?.grupIsmi || grupKodu}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(grupKodu)
                      }}
                      className="ml-1 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}