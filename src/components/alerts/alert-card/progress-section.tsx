import React from 'react'
import { Progress } from '@/components/ui/progress'
import { AlertProgressProps } from '../shared/types'
import { SEVERITY_CONFIGS } from '../shared/constants'

/**
 * Alert Card Progress Section
 * Stok durumu progress bar ve istatistikleri gösterir
 */
export default function AlertProgressSection({
  kalanMiktar,
  aylikOrtalamaSatis,
  ortalamaAylikStok,
  onerilenSiparis,
  severity
}: AlertProgressProps) {
  // Progress yüzdesi hesaplama
  const stockPercent = aylikOrtalamaSatis > 0 
    ? Math.min((kalanMiktar / aylikOrtalamaSatis) * 100, 100)
    : 0

  const config = SEVERITY_CONFIGS[severity]

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2.5">
      {/* Üst bilgi satırı */}
      <div className="flex items-baseline justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Mevcut</p>
          <p className="text-sm font-semibold text-gray-900">{Math.round(kalanMiktar)} m</p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Önerilen</p>
          <p className="text-sm font-semibold text-gray-900">{Math.round(onerilenSiparis)} m</p>
        </div>
      </div>

      {/* Progress bar */}
      <Progress 
        value={stockPercent} 
        className="h-1.5" 
        indicatorClassName={cn(config.progressColor, "transition-all duration-500")} 
      />

      {/* Alt bilgi satırı */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-600">
          <span className="font-medium text-gray-900">{ortalamaAylikStok.toFixed(1)} ay</span> yeterli
        </span>
        <span className="text-gray-500">
          {Math.round(aylikOrtalamaSatis)} m/ay satış
        </span>
      </div>
    </div>
  )
}

// cn import ekleniyor
import { cn } from '@/lib/utils'