import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type StockStatusFilter = 'all' | 'critical' | 'low' | 'sufficient'

interface StatusFilterProps {
  value: StockStatusFilter
  onChange: (value: StockStatusFilter) => void
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  const getDisplayValue = () => {
    switch(value) {
      case 'all':
        return 'Stok Durumu'
      case 'critical':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
          <span className="text-[13px]">Kritik</span>
          <span className="text-xs text-gray-500">(0-1 ay)</span>
        </span>
      case 'low':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
          <span className="text-[13px]">Az</span>
          <span className="text-xs text-gray-500">(1.1-2 ay)</span>
        </span>
      case 'sufficient':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
          <span className="text-[13px]">Yeterli</span>
          <span className="text-xs text-gray-500">(2.1+ ay)</span>
        </span>
    }
  }

  return (
    <Select value={value} onValueChange={(val) => onChange(val as StockStatusFilter)}>
      <SelectTrigger className="w-full h-[34px] rounded-lg font-inter text-[13px] bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <SelectValue>{getDisplayValue()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span className="text-[13px]">Tümünü Göster</span>
          </span>
        </SelectItem>
        <SelectItem value="critical">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
            <span className="text-[13px]">Kritik</span>
            <span className="text-xs text-gray-500">(0-1 ay)</span>
          </span>
        </SelectItem>
        <SelectItem value="low">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
            <span className="text-[13px]">Az</span>
            <span className="text-xs text-gray-500">(1.1-2 ay)</span>
          </span>
        </SelectItem>
        <SelectItem value="sufficient">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
            <span className="text-[13px]">Yeterli</span>
            <span className="text-xs text-gray-500">(2.1+ ay)</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}