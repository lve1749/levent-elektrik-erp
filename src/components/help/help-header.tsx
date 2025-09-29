'use client'

import { HelpCircle, Search } from 'lucide-react'

interface HelpHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export default function HelpHeader({ searchQuery, onSearchChange }: HelpHeaderProps) {
  return (
    <div className="relative rounded-lg p-[1px] bg-gradient-to-r from-[oklch(0.55_0.22_263)] to-[oklch(0.99_0.00_0)] dark:from-[oklch(0.55_0.22_263)] dark:to-[oklch(0.14_0.00_0)]">
      <div className="bg-gradient-to-r from-[oklch(0.93_0.03_256)] to-[oklch(0.99_0.00_0)] dark:from-[oklch(0.28_0.09_268)] dark:to-[oklch(0.14_0.00_0)] rounded-lg p-6">
      <div className="grid grid-cols-2 gap-6 items-center">
        {/* Sol Taraf - Başlık ve Açıklama */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]" />
            <h1 className="text-[14px] font-semibold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
              Yardım Merkezi
            </h1>
          </div>
          <p className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
            Aradığınız bilgiyi hızlıca bulun veya destek ekibimizle iletişime geçin.
          </p>
        </div>
        
        {/* Sağ Taraf - Arama Kutusu */}
        <div className="relative">
          <div className="relative rounded-full p-[1px] bg-gradient-to-r from-[oklch(0.55_0.22_263)] to-[oklch(0.97_0.00_0)] dark:from-[oklch(0.55_0.22_263)] dark:to-[oklch(0.20_0.00_0)]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.60_0.00_0)] z-10" />
            <input
              type="text"
              placeholder="Neye ihtiyacınız var? Örn: filtre kullanımı, sipariş oluşturma..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-3 h-10 w-full bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] placeholder:text-[oklch(0.60_0.00_0)] dark:placeholder:text-[oklch(0.60_0.00_0)] focus:outline-none text-[13px] rounded-full"
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}