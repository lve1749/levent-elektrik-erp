import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Gauge } from 'lucide-react'

export type TurnoverSpeed = 'all' | 'fast' | 'normal' | 'slow' | 'very-slow'

interface TurnoverFilterProps {
  value: TurnoverSpeed
  onChange: (value: TurnoverSpeed) => void
}

export default function TurnoverFilter({ value, onChange }: TurnoverFilterProps) {
  const getDisplayValue = () => {
    switch(value) {
      case 'all':
        return 'Devir Hızı'
      case 'fast':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
          <span className="text-[13px]">Hızlı</span>
        </span>
      case 'normal':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
          <span className="text-[13px]">Normal</span>
        </span>
      case 'slow':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
          <span className="text-[13px]">Yavaş</span>
        </span>
      case 'very-slow':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
          <span className="text-[13px]">Çok Yavaş</span>
        </span>
    }
  }

  return (
    <Select value={value} onValueChange={(val) => onChange(val as TurnoverSpeed)}>
      <SelectTrigger className="w-full h-[34px] rounded-lg font-inter text-[13px] bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <SelectValue>{getDisplayValue()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        <SelectItem value="all">
          <span className="text-[13px]">Tüm Hızlar</span>
        </SelectItem>
        <SelectItem value="fast">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
            <span className="text-[13px]">Hızlı</span>
            <span className="text-xs text-gray-500">(1-15 gün)</span>
          </span>
        </SelectItem>
        <SelectItem value="normal">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
            <span className="text-[13px]">Normal</span>
            <span className="text-xs text-gray-500">(16-30 gün)</span>
          </span>
        </SelectItem>
        <SelectItem value="slow">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
            <span className="text-[13px]">Yavaş</span>
            <span className="text-xs text-gray-500">(31-60 gün)</span>
          </span>
        </SelectItem>
        <SelectItem value="very-slow">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
            <span className="text-[13px]">Çok Yavaş</span>
            <span className="text-xs text-gray-500">(60+ gün)</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}