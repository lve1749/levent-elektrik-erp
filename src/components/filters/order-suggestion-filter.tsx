'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, ShoppingCart, AlertCircle, Ban } from 'lucide-react'

export type OrderSuggestionType = 'all' | 'urgent' | 'critical' | 'low-priority' | 'ordered' | 'partial' | 'sufficient' | 'none'

interface OrderSuggestionFilterProps {
  value: OrderSuggestionType
  onChange: (value: OrderSuggestionType) => void
}

const filterOptions = [
  { 
    value: 'all' as OrderSuggestionType, 
    label: 'Tümü',
    description: 'Tüm ürünleri göster',
    circleClass: '',
    textClass: ''
  },
  { 
    value: 'urgent' as OrderSuggestionType, 
    label: 'Acil',
    description: 'Stok tükenme riski! Hemen sipariş verilmeli',
    circleClass: 'bg-red-500 dark:bg-red-400',
    textClass: 'text-[13px]'
  },
  { 
    value: 'critical' as OrderSuggestionType, 
    label: 'Kritik',
    description: 'Stok azalıyor. En kısa sürede sipariş verilmeli',
    circleClass: 'bg-orange-500 dark:bg-orange-400',
    textClass: 'text-[13px]'
  },
  { 
    value: 'low-priority' as OrderSuggestionType, 
    label: 'Düşük Öncelik',
    description: 'Ürün yavaş/durgun hareket ediyor. Minimum sipariş yeterli',
    circleClass: 'bg-gray-500 dark:bg-gray-400',
    textClass: 'text-[13px]'
  },
  { 
    value: 'ordered' as OrderSuggestionType, 
    label: 'Sipariş Verildi',
    description: 'Tedarikçi siparişi beklemede',
    circleClass: 'bg-green-500 dark:bg-green-400',
    textClass: 'text-[13px]'
  },
  { 
    value: 'partial' as OrderSuggestionType, 
    label: 'Kısmi Sipariş',
    description: 'Mevcut sipariş yetersiz. Ek sipariş verilmesi önerilir',
    circleClass: 'bg-yellow-500 dark:bg-yellow-400',
    textClass: 'text-[13px]'
  },
  { 
    value: 'sufficient' as OrderSuggestionType, 
    label: 'Yeterli Stok',
    description: 'Mevcut stok ihtiyacı karşılıyor',
    circleClass: 'bg-blue-500 dark:bg-blue-400',
    textClass: 'text-[13px]'
  },
  { 
    value: 'none' as OrderSuggestionType, 
    label: 'Öneri Yok',
    description: 'Sipariş önerilmiyor (ölü stok, özel sipariş vb.)',
    circleClass: 'bg-gray-500 dark:bg-gray-400',
    textClass: 'text-[13px]'
  }
]

export default function OrderSuggestionFilter({ value, onChange }: OrderSuggestionFilterProps) {
  const getDisplayValue = () => {
    const option = filterOptions.find(opt => opt.value === value)
    if (!option || value === 'all') return 'Önerilen Sipariş'
    
    return (
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${option.circleClass}`}></span>
        <span className="text-[13px]">{option.label}</span>
      </span>
    )
  }

  return (
    <Select value={value} onValueChange={(val) => onChange(val as OrderSuggestionType)}>
      <SelectTrigger className="w-full h-[34px] rounded-lg font-inter text-[13px] bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <SelectValue>{getDisplayValue()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        <SelectItem value="all">
          <span className="text-[13px]">Tüm Öneriler</span>
        </SelectItem>
        {filterOptions.slice(1).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${option.circleClass}`}></span>
              <span className={option.textClass}>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}