import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MevsimselPattern } from '@/types'

interface SeasonalityBadgeProps {
  pattern?: MevsimselPattern
  risk?: number
  size?: 'sm' | 'md'
}

export default function SeasonalityBadge({ pattern, risk, size = 'sm' }: SeasonalityBadgeProps) {
  if (!pattern) return null


  const getCircleAndTextClass = () => {
    if (pattern.tip === 'Stabil') return {
      circle: 'bg-green-500 dark:bg-green-400',
      text: 'text-green-600 dark:text-green-400'
    }
    if (pattern.tip === 'Mevsimsel' && risk && risk > 70) return {
      circle: 'bg-red-500 dark:bg-red-400',
      text: 'text-red-600 dark:text-red-400'
    }
    if (pattern.tip === 'Mevsimsel' && risk && risk > 40) return {
      circle: 'bg-orange-500 dark:bg-orange-400',
      text: 'text-orange-600 dark:text-orange-400'
    }
    if (pattern.tip === 'Mevsimsel') return {
      circle: 'bg-blue-500 dark:bg-blue-400',
      text: 'text-blue-600 dark:text-blue-400'
    }
    if (pattern.tip === 'Trend') return {
      circle: 'bg-indigo-500 dark:bg-indigo-400',
      text: 'text-indigo-600 dark:text-indigo-400'
    }
    if (pattern.tip === 'Düzensiz') return {
      circle: 'bg-purple-500 dark:bg-purple-400',
      text: 'text-purple-600 dark:text-purple-400'
    }
    return {
      circle: 'bg-gray-500 dark:bg-gray-400',
      text: 'text-gray-600 dark:text-gray-400'
    }
  }
  
  const getBadgeLabel = (): string => {
    if (pattern.tip === 'Stabil') return 'Stabil'
    if (pattern.tip === 'Trend') return 'Trend'
    if (pattern.tip === 'Düzensiz') return 'Düzensiz'
    if (pattern.tip === 'Mevsimsel') {
      if (risk && risk > 70) return 'Yüksek Risk'
      if (risk && risk > 40) return 'Orta Risk'
      return 'Düşük Risk'
    }
    return pattern.tip
  }

  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const colors = getCircleAndTextClass()

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-start gap-2 cursor-default">
            <span className={`w-2 h-2 rounded-full ${colors.circle}`}></span>
            <span className={`font-inter text-xs font-medium ${colors.text}`}>{getBadgeLabel()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
          sideOffset={5}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Satış Deseni Analizi</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Pattern Tipi */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Satış Deseni</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.circle}`}></span>
                <span className={`text-[10px] font-inter ${colors.text}`}>
                  {pattern.tip === 'Mevsimsel' && risk && risk > 70 ? 'Yüksek Risk' : 
                   pattern.tip === 'Mevsimsel' && risk && risk > 40 ? 'Orta Risk' :
                   pattern.tip === 'Mevsimsel' ? 'Düşük Risk' :
                   pattern.tip}
                </span>
              </div>
            </div>
            
            {/* En Yüksek/Düşük Aylar */}
            {pattern.maxAy && pattern.minAy && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-md p-2">
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-0.5">En Yüksek</p>
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300">{aylar[pattern.maxAy - 1]}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-md p-2">
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mb-0.5">En Düşük</p>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300">{aylar[pattern.minAy - 1]}</p>
                </div>
              </div>
            )}
            
            {/* Risk Skoru ve Değişkenlik */}
            <div className="space-y-2">
              {risk !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Risk Skoru</span>
                    <span className={`text-xs font-bold ${
                      risk > 70 ? 'text-red-600 dark:text-red-400' : 
                      risk > 40 ? 'text-orange-600 dark:text-orange-400' : 
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {risk}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-[oklch(0.27_0.00_0)] rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${
                        risk > 70 ? 'bg-red-500' : 
                        risk > 40 ? 'bg-orange-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${risk}%` }}
                    />
                  </div>
                  {/* Risk Skoru Açıklaması */}
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-[oklch(0.23_0.00_0)] rounded-md">
                    <p className="text-[10px] font-medium text-gray-600 dark:text-[oklch(0.70_0.00_0)] mb-1">
                      Risk Skoru Nedir?
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-[oklch(0.60_0.00_0)]">
                      Bu ürünün satışlarının ne kadar düzenli olduğunu gösterir.
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-[oklch(0.60_0.00_0)] mt-1">
                      <span className="text-green-600 dark:text-green-400">Düşük skor:</span> Tahmin kolay, stok yönetimi basit<br/>
                      <span className="text-red-600 dark:text-red-400">Yüksek skor:</span> Tahmin zor, dikkatli planlama gerekli
                    </p>
                    <p className="text-[10px] font-medium text-gray-600 dark:text-[oklch(0.70_0.00_0)] mt-2 mb-0.5">
                      Önerilen Aksiyonlar:
                    </p>
                    <div className="text-[10px] text-gray-500 dark:text-[oklch(0.60_0.00_0)] space-y-1">
                      {risk > 70 && (
                        <>
                          <div>• Güvenlik stoğu: Normal ihtiyacın <span className="font-semibold">%50'si</span></div>
                          <div>• <span className="font-semibold">Haftalık</span> stok kontrolü yapın</div>
                          {pattern.maxAy && <div>• <span className="font-semibold">{aylar[pattern.maxAy-1]}</span> ayına özel hazırlık</div>}
                        </>
                      )}
                      {risk > 40 && risk <= 70 && (
                        <>
                          <div>• Güvenlik stoğu: Normal ihtiyacın <span className="font-semibold">%30'u</span></div>
                          <div>• <span className="font-semibold">2 haftada bir</span> stok kontrolü</div>
                          {pattern.maxAy && <div>• <span className="font-semibold">{aylar[pattern.maxAy-1]}</span> ayında stok artırın</div>}
                        </>
                      )}
                      {risk <= 40 && (
                        <>
                          <div>• Güvenlik stoğu: Normal ihtiyacın <span className="font-semibold">%20'si</span></div>
                          <div>• <span className="font-semibold">Aylık</span> stok kontrolü yeterli</div>
                          <div>• Standart sipariş döngüsü uygulayın</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {'cv' in pattern && (pattern as any).cv && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Değişkenlik</span>
                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                      %{((pattern as any).cv * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-400 dark:text-[oklch(0.55_0.00_0)] mt-0.5">
                    {(pattern as any).cv * 100 <= 30 && '✓ Düzenli satış'}
                    {(pattern as any).cv * 100 > 30 && (pattern as any).cv * 100 <= 60 && '⚠ Orta değişken'}
                    {(pattern as any).cv * 100 > 60 && '⚠ Çok değişken'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Alt Bilgi */}
            <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
              <div className="text-[10px] text-gray-500 dark:text-[oklch(0.60_0.00_0)]">
                {pattern.tip === 'Mevsimsel' && (
                  <>
                    <p className="font-medium mb-1">Mevsimsel Satış Deseni</p>
                    <p className="text-gray-400 dark:text-[oklch(0.55_0.00_0)]">
                      Belirli aylarda satış artıyor/azalıyor.
                      {pattern.maxAy && pattern.minAy && (
                        <>
                          <br/>En yüksek: <span className="font-semibold">{aylar[pattern.maxAy-1]}</span>, 
                          En düşük: <span className="font-semibold">{aylar[pattern.minAy-1]}</span>
                          <br/>Bu aylara göre stok planlayın.
                        </>
                      )}
                    </p>
                  </>
                )}
                {pattern.tip === 'Stabil' && (
                  <>
                    <p className="font-medium mb-1">Düzenli Satış Deseni</p>
                    <p className="text-gray-400 dark:text-[oklch(0.55_0.00_0)]">
                      Her ay düzenli satış yapıyor.
                      <br/>Aylık değişim %15'ten az.
                      <br/>Standart stok yönetimi uygulayın.
                    </p>
                  </>
                )}
                {pattern.tip === 'Düzensiz' && (
                  <>
                    <p className="font-medium mb-1">Düzensiz Satış Deseni</p>
                    <p className="text-gray-400 dark:text-[oklch(0.55_0.00_0)]">
                      Satış deseni tahmin edilemiyor.
                      <br/>Her ay farklı miktarda satılıyor.
                      <br/>Yüksek güvenlik stoğu (%40-50) önerilir.
                    </p>
                  </>
                )}
                {pattern.tip === 'Trend' && (
                  <>
                    <p className="font-medium mb-1">Trendli Satış Deseni</p>
                    <p className="text-gray-400 dark:text-[oklch(0.55_0.00_0)]">
                      Satışlarda sürekli artış/azalış var.
                      <br/>Trend yönünü takip edin.
                      <br/>Gelecek ay tahmini için trend analizi yapın.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}