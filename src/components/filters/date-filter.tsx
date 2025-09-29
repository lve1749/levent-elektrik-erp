import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DateFilterProps {
  label: string
  date: Date
  onDateChange: (date: Date) => void
  horizontal?: boolean
  fullWidth?: boolean
}

export default function DateFilter({ label, date, onDateChange, horizontal = false, fullWidth = false }: DateFilterProps) {
  // 2025 yılı için tarih sınırlaması
  const minDate = new Date(2025, 0, 1) // 1 Ocak 2025
  const maxDate = new Date(2025, 11, 31) // 31 Aralık 2025
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Tarih sınırlarını kontrol et
      if (newDate < minDate) {
        onDateChange(minDate)
      } else if (newDate > maxDate) {
        onDateChange(maxDate)
      } else {
        onDateChange(newDate)
      }
    }
  }
  
  return (
    <div className={cn(
      "flex w-full",
      horizontal ? "flex-col xl:flex-row xl:items-center gap-1.5 xl:gap-2 xl:min-w-0" : "flex-col gap-1.5"
    )}>
      <label className="text-[13px] font-medium text-[oklch(0.37_0.00_0)] dark:text-[oklch(0.71_0.01_286)] whitespace-nowrap flex-shrink-0">
        {label}
      </label>
      <div className={horizontal ? "xl:flex-1 xl:min-w-0 w-full" : "w-full"}>
        <Popover>
          <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal text-[13px] h-[34px] rounded-lg bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] border-[oklch(0.92_0.00_0_/_0.5)] text-[oklch(0.20_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0_/_0.5)] dark:text-[oklch(0.87_0.01_286)] transition-all duration-200 shadow-none overflow-hidden",
              fullWidth ? "w-full" : "w-[140px]",
              !date && "text-[oklch(0.20_0.00_0)]/60 dark:text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate block">
              {date ? format(date, 'dd/MM/yyyy', { locale: tr }) : 'Tarih seçin'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
        <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < minDate || date > maxDate}
            initialFocus
            defaultMonth={date || minDate}
            locale={tr}
          />
        </PopoverContent>
      </Popover>
      </div>
    </div>
  )
}