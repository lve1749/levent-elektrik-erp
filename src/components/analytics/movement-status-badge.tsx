import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MovementStatusBadgeProps {
  status: string
  lastMovementDate?: Date | string | null
  averageMonthlySales?: number
  remainingStock?: number
  last30DaysMovements?: number
  last60DaysMovements?: number
  last180DaysMovements?: number
  last365DaysMovements?: number
}

export default function MovementStatusBadge({ 
  status, 
  lastMovementDate,
  averageMonthlySales,
  remainingStock,
  last30DaysMovements = 0,
  last60DaysMovements = 0,
  last180DaysMovements = 0,
  last365DaysMovements = 0
}: MovementStatusBadgeProps) {
  

  const getCircleAndTextClass = () => {
    switch (status) {
      case 'Aktif':
        return {
          circle: 'bg-green-500 dark:bg-green-400',
          text: 'text-green-600 dark:text-green-400'
        }
      case 'Yavaş':
        return {
          circle: 'bg-yellow-500 dark:bg-yellow-400',
          text: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'Durgun':
        return {
          circle: 'bg-orange-500 dark:bg-orange-400',
          text: 'text-orange-600 dark:text-orange-400'
        }
      case 'Ölü Stok':
        return {
          circle: 'bg-red-500 dark:bg-red-400',
          text: 'text-red-600 dark:text-red-400'
        }
      default:
        return {
          circle: 'bg-gray-500 dark:bg-gray-400',
          text: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'Aktif':
        return {
          title: 'Aktif Ürün',
          description: 'Son 30 günde en az 3 hareket yapmış düzenli ürün',
          recommendation: 'Standart stok politikası uygulayın',
          riskLevel: 'Düşük',
          riskColor: 'text-green-600 dark:text-green-400',
          periodDays: 30,
          movementCount: last30DaysMovements
        }
      case 'Yavaş':
        return {
          title: 'Yavaş Hareket',
          description: 'Son 60 günde en az 2 hareket yapmış ancak düzensiz ürün',
          recommendation: 'Satış stratejisi gözden geçirilmeli',
          riskLevel: 'Orta',
          riskColor: 'text-orange-600 dark:text-orange-400',
          periodDays: 60,
          movementCount: last60DaysMovements
        }
      case 'Durgun':
        return {
          title: 'Durgun Stok',
          description: 'Son 180 günde sadece 1-2 hareket görmüş, nadiren satılan ürün',
          recommendation: 'Envanter optimizasyonu yapılmalı',
          riskLevel: 'Yüksek',
          riskColor: 'text-orange-600 dark:text-orange-400',
          periodDays: 180,
          movementCount: last180DaysMovements
        }
      case 'Ölü Stok':
        return {
          title: 'Ölü Stok',
          description: '180 günden uzun süredir hiç satılmamış veya hareket görmemiş ürün',
          recommendation: 'Acil tasfiye veya iade değerlendirilmeli',
          riskLevel: 'Kritik',
          riskColor: 'text-red-600 dark:text-red-400',
          periodDays: 365,
          movementCount: last365DaysMovements > last180DaysMovements ? last365DaysMovements - last180DaysMovements : 0
        }
      default:
        return {
          title: 'Bilinmeyen',
          description: 'Durum bilgisi yok',
          recommendation: '-',
          riskLevel: '-',
          riskColor: 'text-gray-600 dark:text-gray-400',
          periodDays: 0,
          movementCount: 0
        }
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Bilgi yok'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getDaysSinceLastMovement = () => {
    if (!lastMovementDate) return null
    const last = typeof lastMovementDate === 'string' ? new Date(lastMovementDate) : lastMovementDate
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - last.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const statusInfo = getStatusInfo()
  const daysSince = getDaysSinceLastMovement()
  const colors = getCircleAndTextClass()

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-start gap-2 cursor-default">
            <span className={`w-2 h-2 rounded-full ${colors.circle}`}></span>
            <span className={`font-inter text-xs font-medium ${colors.text}`}>{status}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
          sideOffset={5}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Hareket Durumu Analizi</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Durum Başlığı */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Mevcut Durum</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                {statusInfo.title}
              </span>
            </div>
            
            {/* Açıklama */}
            <div className="bg-gray-50 dark:bg-[oklch(0.23_0.00_0)] rounded-md p-2">
              <p className="text-xs text-gray-600 dark:text-[oklch(0.75_0.00_0)]">
                {statusInfo.description}
              </p>
            </div>
            
            {/* İstatistikler */}
            <div className="space-y-2">
              {/* YENİ: Hareket sayısı bilgisi */}
              {statusInfo.movementCount !== undefined && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/20 rounded-md px-2 py-1">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {status === 'Ölü Stok' ? 'Son 180-365 gün' : `Son ${statusInfo.periodDays} gün`}
                  </span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    {statusInfo.movementCount} çıkış hareketi
                  </span>
                </div>
              )}
              
              {lastMovementDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Son Hareket</span>
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                    {formatDate(lastMovementDate)}
                  </span>
                </div>
              )}
              
              {daysSince !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Geçen Süre</span>
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                    {daysSince} gün
                  </span>
                </div>
              )}
              
              {averageMonthlySales !== undefined && averageMonthlySales > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aylık Ort. Satış</span>
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                    {averageMonthlySales.toFixed(2)}
                  </span>
                </div>
              )}
              
              {remainingStock !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Mevcut Stok</span>
                  <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                    {remainingStock.toFixed(2)}
                  </span>
                </div>
              )}
              
              {/* YENİ: Detaylı hareket dağılımı */}
              {(last30DaysMovements > 0 || last60DaysMovements > 0 || last180DaysMovements > 0) && (
                <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                  <p className="text-[10px] font-medium text-gray-500 dark:text-[oklch(0.65_0.00_0)] mb-1">
                    Çıkış Hareket Dağılımı:
                  </p>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500 dark:text-[oklch(0.55_0.00_0)]">0-30 gün:</span>
                      <span className="font-mono text-gray-600 dark:text-[oklch(0.60_0.00_0)]">{last30DaysMovements}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500 dark:text-[oklch(0.55_0.00_0)]">31-60 gün:</span>
                      <span className="font-mono text-gray-600 dark:text-[oklch(0.60_0.00_0)]">{Math.max(0, last60DaysMovements - last30DaysMovements)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500 dark:text-[oklch(0.55_0.00_0)]">61-180 gün:</span>
                      <span className="font-mono text-gray-600 dark:text-[oklch(0.60_0.00_0)]">{Math.max(0, last180DaysMovements - last60DaysMovements)}</span>
                    </div>
                    {last365DaysMovements > last180DaysMovements && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 dark:text-[oklch(0.55_0.00_0)]">181-365 gün:</span>
                        <span className="font-mono text-gray-600 dark:text-[oklch(0.60_0.00_0)]">{last365DaysMovements - last180DaysMovements}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Risk Seviyesi */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
              <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Risk Seviyesi</span>
              <span className={`text-xs font-bold ${statusInfo.riskColor}`}>
                {statusInfo.riskLevel}
              </span>
            </div>
            
            {/* Öneri */}
            <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
              <p className="text-[10px] font-medium text-gray-500 dark:text-[oklch(0.65_0.00_0)] mb-1">
                Öneri:
              </p>
              <p className="text-[10px] text-gray-600 dark:text-[oklch(0.55_0.00_0)] italic">
                {statusInfo.recommendation}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}