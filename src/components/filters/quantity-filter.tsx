import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package } from 'lucide-react'

export type QuantityRange = 'all' | '0-50' | '50-100' | '100-500' | '500-1000' | '1000-5000' | '5000+'

interface QuantityFilterProps {
  value: QuantityRange
  onChange: (value: QuantityRange) => void
}

export default function QuantityFilter({ value, onChange }: QuantityFilterProps) {
  const getDisplayValue = () => {
    switch(value) {
      case 'all':
        return 'Miktar Aralığı'
      case '0-50':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
          <span className="text-[13px]">Çok Düşük</span>
        </span>
      case '50-100':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"></span>
          <span className="text-[13px]">Düşük</span>
        </span>
      case '100-500':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
          <span className="text-[13px]">Orta</span>
        </span>
      case '500-1000':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
          <span className="text-[13px]">Yüksek</span>
        </span>
      case '1000-5000':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
          <span className="text-[13px]">Çok Yüksek</span>
        </span>
      case '5000+':
        return <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
          <span className="text-[13px]">Aşırı Yüksek</span>
        </span>
    }
  }

  return (
    <Select value={value} onValueChange={(val) => onChange(val as QuantityRange)}>
      <SelectTrigger className="w-full h-[34px] rounded-lg font-inter text-[13px] bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <SelectValue>{getDisplayValue()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        <SelectItem value="all">
          <span className="text-[13px]">Tüm Miktarlar</span>
        </SelectItem>
        <SelectItem value="0-50">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
            <span className="text-[13px]">Çok Düşük</span>
            <span className="text-xs text-gray-500">(0-50)</span>
          </span>
        </SelectItem>
        <SelectItem value="50-100">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"></span>
            <span className="text-[13px]">Düşük</span>
            <span className="text-xs text-gray-500">(50-100)</span>
          </span>
        </SelectItem>
        <SelectItem value="100-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
            <span className="text-[13px]">Orta</span>
            <span className="text-xs text-gray-500">(100-500)</span>
          </span>
        </SelectItem>
        <SelectItem value="500-1000">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
            <span className="text-[13px]">Yüksek</span>
            <span className="text-xs text-gray-500">(500-1.000)</span>
          </span>
        </SelectItem>
        <SelectItem value="1000-5000">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
            <span className="text-[13px]">Çok Yüksek</span>
            <span className="text-xs text-gray-500">(1.000-5.000)</span>
          </span>
        </SelectItem>
        <SelectItem value="5000+">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
            <span className="text-[13px]">Aşırı Yüksek</span>
            <span className="text-xs text-gray-500">(5.000+)</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}