import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatNumber } from '@/lib/formatters'

interface TurnoverSpeedBadgeProps {
  turnoverDays: number
  monthlyAverage?: number
  currentStock?: number
  movementStatus?: string
}

export default function TurnoverSpeedBadge({ 
  turnoverDays,
  monthlyAverage,
  currentStock,
  movementStatus
}: TurnoverSpeedBadgeProps) {
  
  // Devir hızı kategorisi ve rengi
  const getSpeedInfo = () => {
    // NULL veya undefined durumu - Hareket yok ama stok var
    if (turnoverDays === null || turnoverDays === undefined) {
      return {
        label: 'Hareketsiz',
        circleClass: 'bg-gray-500 dark:bg-gray-400',
        textClass: 'text-gray-600 dark:text-gray-400',
        speed: 'Hareketsiz Stok',
        description: 'Satış hareketi yok ama stok mevcut',
        recommendation: 'Satış stratejisi geliştirilmeli veya stok tasfiye edilmeli'
      }
    }
    
    // 0 veya negatif - Stok yok
    if (turnoverDays <= 0) {
      return {
        label: 'Stok yok',
        circleClass: 'bg-gray-500 dark:bg-gray-400',
        textClass: 'text-gray-600 dark:text-gray-400',
        speed: 'Stok Bulunmuyor',
        description: 'Mevcut stok bulunmuyor',
        recommendation: 'Stok durumu kontrol edilmeli'
      }
    }
    
    // Hızlı: 1-15 gün
    if (turnoverDays > 0 && turnoverDays <= 15) {
      return {
        label: `${Math.round(turnoverDays)} gün`,
        circleClass: 'bg-green-500 dark:bg-green-400',
        textClass: 'text-green-600 dark:text-green-400',
        speed: 'Hızlı',
        description: 'Stok hızlı dönüyor (15 günde tükeniyor)',
        recommendation: 'Stoksuz kalma riski var, sık sipariş gerekebilir'
      }
    }
    
    // Normal: 16-30 gün
    if (turnoverDays > 15 && turnoverDays <= 30) {
      return {
        label: `${Math.round(turnoverDays)} gün`,
        circleClass: 'bg-blue-500 dark:bg-blue-400',
        textClass: 'text-blue-600 dark:text-blue-400',
        speed: 'Normal',
        description: 'Stok normal hızda dönüyor (16-30 gün)',
        recommendation: 'İdeal devir hızı, mevcut strateji devam etmeli'
      }
    }
    
    // Yavaş: 31-60 gün  
    if (turnoverDays > 30 && turnoverDays <= 60) {
      return {
        label: `${Math.round(turnoverDays)} gün`,
        circleClass: 'bg-orange-500 dark:bg-orange-400',
        textClass: 'text-orange-600 dark:text-orange-400',
        speed: 'Yavaş',
        description: 'Stok yavaş dönüyor (31-60 gün)',
        recommendation: 'Satış stratejisi gözden geçirilmeli, fazla stok riski'
      }
    }
    
    // Çok Yavaş: 60+ gün
    return {
      label: `${Math.round(turnoverDays)} gün`,
      circleClass: 'bg-red-500 dark:bg-red-400',
      textClass: 'text-red-600 dark:text-red-400',
      speed: 'Çok Yavaş',
      description: 'Stok çok yavaş dönüyor (60+ gün)',
      recommendation: 'Ölü stok riski! Acil önlem alınmalı'
    }
  }
  
  const info = getSpeedInfo()
  
  // Yıllık devir sayısı
  const annualTurnover = turnoverDays > 0 ? (365 / turnoverDays).toFixed(2) : 0
  
  // Stok maliyeti göstergesi (devir hızı yavaşladıkça maliyet artar)
  const getCostIndicator = () => {
    if (turnoverDays === null || turnoverDays === undefined) {
      return { level: 'Belirsiz', color: 'text-gray-600 dark:text-gray-400' }
    }
    if (turnoverDays <= 0) {
      return { level: '-', color: 'text-gray-600 dark:text-gray-400' }
    }
    if (turnoverDays <= 30) return { level: 'Düşük', color: 'text-green-600 dark:text-green-400' }
    if (turnoverDays <= 60) return { level: 'Orta', color: 'text-orange-600 dark:text-orange-400' }
    return { level: 'Yüksek', color: 'text-red-600 dark:text-red-400' }
  }
  
  const costIndicator = getCostIndicator()
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-start gap-2 cursor-default">
            <span className={`w-2 h-2 rounded-full ${info.circleClass}`}></span>
            <span className={`font-inter text-xs font-medium ${info.textClass}`}>{info.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
          sideOffset={5}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Stok Devir Hızı Analizi</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Devir Hızı Kategorisi */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                {info.speed}
              </span>
            </div>
            
            {/* Ana Metrik */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 text-center">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-1">Ortalama Stokta Kalma Süresi</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round(turnoverDays)}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">gün</p>
            </div>
            
            {/* Detay Bilgiler */}
            <div className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Yıllık Devir Sayısı:</span>
                  <span className="font-mono font-semibold">{annualTurnover} kez</span>
                </div>
                
                {monthlyAverage !== undefined && monthlyAverage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aylık Satış:</span>
                    <span className="font-mono font-semibold">{formatNumber(monthlyAverage)}</span>
                  </div>
                )}
                
                {currentStock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Mevcut Stok:</span>
                    <span className="font-mono font-semibold">{formatNumber(currentStock)}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Stok Maliyeti:</span>
                  <span className={`font-semibold ${costIndicator.color}`}>
                    {costIndicator.level}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Açıklama */}
            <div className="bg-gray-50 dark:bg-[oklch(0.23_0.00_0)] rounded-md p-2">
              <p className="text-[10px] font-medium text-gray-600 dark:text-[oklch(0.70_0.00_0)] mb-1">
                Ne Anlama Geliyor?
              </p>
              <p className="text-[10px] text-gray-500 dark:text-[oklch(0.60_0.00_0)]">
                {info.description}
              </p>
              <p className="text-[10px] font-medium text-gray-600 dark:text-[oklch(0.70_0.00_0)] mt-2 mb-0.5">
                Devir Hızı Formülü:
              </p>
              <p className="text-[10px] font-mono text-gray-500 dark:text-[oklch(0.55_0.00_0)]">
                (Mevcut Stok × 30) / Aylık Satış
              </p>
            </div>
            
            {/* Öneri */}
            <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
              <p className="text-[10px] font-medium text-gray-500 dark:text-[oklch(0.65_0.00_0)] mb-1">
                Öneri:
              </p>
              <p className="text-[10px] text-gray-500 dark:text-[oklch(0.55_0.00_0)] italic">
                {info.recommendation}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}