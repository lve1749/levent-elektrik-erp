import { AnalizFiltre } from '@/types'
import DateFilter from './date-filter'
import GroupFilter from './group-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { getMonthsBetweenDates, getMonthsFromYearStart } from '@/lib/formatters'
import { useEffect } from 'react'

interface FilterBarProps {
  filters: AnalizFiltre
  onFiltersChange: (filters: AnalizFiltre) => void
  onSearch: () => void
}

export default function FilterBar({ 
  filters, 
  onFiltersChange, 
  onSearch
}: FilterBarProps) {
  // Component mount olduğunda ay sayısını otomatik hesapla
  useEffect(() => {
    // Eğer yıl başı - yıl sonu tarihleriyse (varsayılan durum)
    const currentYear = new Date().getFullYear()
    const isDefaultDates = 
      filters.baslangicTarihi.getFullYear() === currentYear &&
      filters.baslangicTarihi.getMonth() === 0 &&
      filters.baslangicTarihi.getDate() === 1 &&
      filters.bitisTarihi.getFullYear() === currentYear &&
      filters.bitisTarihi.getMonth() === 11 &&
      filters.bitisTarihi.getDate() === 31

    if (isDefaultDates) {
      // Yılın başından bugüne kadar geçen ay sayısını hesapla
      const currentMonths = getMonthsFromYearStart()
      if (Math.abs(filters.aySayisi - currentMonths) > 0.1) {
        onFiltersChange({ ...filters, aySayisi: currentMonths })
      }
    }
  }, []) // Sadece component mount olduğunda çalışsın

  const handleDateChange = (field: 'baslangicTarihi' | 'bitisTarihi') => (date: Date) => {
    const newFilters = { ...filters, [field]: date }
    
    // Ay sayısını otomatik hesapla
    const baslangic = field === 'baslangicTarihi' ? date : filters.baslangicTarihi
    const bitis = field === 'bitisTarihi' ? date : filters.bitisTarihi
    
    // Sadece her iki tarih de geçerli ise hesapla
    if (baslangic && bitis && bitis >= baslangic) {
      // Eğer yıl başı seçiliyse ve bitiş bugünse, hassas hesaplama yap
      const now = new Date()
      if (baslangic.getMonth() === 0 && 
          baslangic.getDate() === 1 &&
          bitis.getFullYear() === now.getFullYear() &&
          bitis.getMonth() === now.getMonth() &&
          bitis.getDate() === now.getDate()) {
        newFilters.aySayisi = getMonthsFromYearStart()
      } else {
        newFilters.aySayisi = getMonthsBetweenDates(baslangic, bitis)
      }
    }
    
    onFiltersChange(newFilters)
  }

  return (
    <div className="p-0 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <div className="min-w-0">
          <DateFilter
            label="Başlangıç"
            date={filters.baslangicTarihi}
            onDateChange={handleDateChange('baslangicTarihi')}
            horizontal={true}
            fullWidth
          />
        </div>
        
        <div className="min-w-0">
          <DateFilter
            label="Bitiş"
            date={filters.bitisTarihi}
            onDateChange={handleDateChange('bitisTarihi')}
            horizontal={true}
            fullWidth
          />
        </div>
        
        <div className="min-w-0">
          <GroupFilter
            value={filters.anaGrupKodu || null}
            onChange={(value) => onFiltersChange({ ...filters, anaGrupKodu: value })}
            horizontal={true}
            fullWidth
          />
        </div>
        
        <div className="min-w-0">
          <div className="flex flex-col xl:flex-row xl:items-center gap-1.5 xl:gap-2">
            <label className="text-[13px] font-medium text-[oklch(0.37_0.00_0)] dark:text-[oklch(0.71_0.01_286)] whitespace-nowrap xl:flex-shrink-0">Ay Sayısı</label>
            <Input
              type="number"
              value={filters.aySayisi}
              onChange={(e) => onFiltersChange({ ...filters, aySayisi: parseFloat(e.target.value) || 1 })}
              min="0.1"
              step="0.1"
              className="h-[34px] w-full xl:flex-1 text-[13px] rounded-lg bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] border-[oklch(0.92_0.00_0_/_0.5)] text-[oklch(0.20_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0_/_0.5)] dark:text-[oklch(0.87_0.01_286)] transition-all duration-200 shadow-none"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2 lg:col-span-1 min-w-0">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-transparent xl:hidden">
              &nbsp;
            </label>
            <Button 
              onClick={onSearch} 
              className="w-full h-[34px] text-[13px] bg-gradient-to-r from-[oklch(0.14_0.00_0)] to-[oklch(0.27_0.00_0)] hover:bg-[oklch(0.27_0.00_0)] hover:from-[oklch(0.27_0.00_0)] hover:to-[oklch(0.27_0.00_0)] text-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.55_0.22_263)] dark:from-[oklch(0.55_0.22_263)] dark:to-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:hover:from-[oklch(0.62_0.19_260)] dark:hover:to-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_0)] dark:border-0 transition-all duration-300"
            >
              <Search className="mr-2 h-4 w-4 text-[oklch(0.99_0.00_0)] dark:text-[oklch(0.97_0.00_286)]" />
              Analiz Et
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}