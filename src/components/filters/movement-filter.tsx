import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Pause, XCircle, Zap } from 'lucide-react'

export type MovementStatus = 'all' | 'active' | 'slow' | 'stagnant' | 'dead'

interface MovementFilterProps {
  value: MovementStatus
  onChange: (value: MovementStatus) => void
}

export default function MovementFilter({ value, onChange }: MovementFilterProps) {
  const getDisplayValue = () => {
    switch(value) {
      case 'all':
        return 'Hareket Durumu'
      case 'active':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
          <span className="text-[13px]">Aktif</span>
        </span>
      case 'slow':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400"></span>
          <span className="text-[13px]">Yavaş</span>
        </span>
      case 'stagnant':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
          <span className="text-[13px]">Durgun</span>
        </span>
      case 'dead':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
          <span className="text-[13px]">Ölü Stok</span>
        </span>
    }
  }

  return (
    <Select value={value} onValueChange={(val) => onChange(val as MovementStatus)}>
      <SelectTrigger className="w-full h-[34px] rounded-lg font-inter text-[13px] bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <SelectValue>{getDisplayValue()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        <SelectItem value="all">
          <span className="text-[13px]">Tüm Durumlar</span>
        </SelectItem>
        <SelectItem value="active">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
            <span className="text-[13px]">Aktif</span>
            <span className="text-xs text-gray-500">(0-30 gün)</span>
          </span>
        </SelectItem>
        <SelectItem value="slow">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400"></span>
            <span className="text-[13px]">Yavaş</span>
            <span className="text-xs text-gray-500">(31-60 gün)</span>
          </span>
        </SelectItem>
        <SelectItem value="stagnant">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
            <span className="text-[13px]">Durgun</span>
            <span className="text-xs text-gray-500">(61-180 gün)</span>
          </span>
        </SelectItem>
        <SelectItem value="dead">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
            <span className="text-[13px]">Ölü</span>
            <span className="text-xs text-gray-500">(180+ gün)</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}