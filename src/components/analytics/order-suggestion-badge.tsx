import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatNumber, formatOrderNumber } from '@/lib/formatters'

interface OrderSuggestionBadgeProps {
  suggestedQuantity: number
  currentStock: number
  monthlyAverage: number
  monthlyStock: number
  pendingOrders?: number
  receivedOrders?: number
  movementStatus?: string
  turnoverDays?: number
  orderReason?: string
}

export default function OrderSuggestionBadge({ 
  suggestedQuantity,
  currentStock,
  monthlyAverage,
  monthlyStock,
  pendingOrders = 0,
  receivedOrders = 0,
  movementStatus,
  turnoverDays,
  orderReason
}: OrderSuggestionBadgeProps) {
  
  // Tedarikçiye sipariş verilmiş ve yeterli durumu
  if (pendingOrders > 0 && suggestedQuantity === 0) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-2 min-w-[120px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
                <span className="text-xs font-medium font-inter text-green-600 dark:text-green-400">
                  Sipariş verildi
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
            sideOffset={5}
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Bekleyen Tedarikçi Siparişi</h3>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-md p-3 text-center">
                <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-1">Verilen Sipariş Miktarı</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatNumber(pendingOrders)}
                </p>
                <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">adet</p>
              </div>
              
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Mevcut Stok:</span>
                  <span className="font-mono font-semibold">{formatNumber(currentStock)}</span>
                </div>
                {receivedOrders > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Müşteri Siparişi:</span>
                    <span className="font-mono font-semibold text-red-600 dark:text-red-400">-{formatNumber(receivedOrders)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Net Stok:</span>
                  <span className="font-mono font-semibold">{formatNumber(currentStock + pendingOrders - receivedOrders)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aylık Ort. Satış:</span>
                  <span className="font-mono font-semibold">{formatNumber(monthlyAverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Kalan Ay Sayısı:</span>
                  <span className={`font-mono font-semibold ${
                    monthlyAverage > 0 ? (
                      (currentStock + pendingOrders - receivedOrders) / monthlyAverage < 0.5 ? 'text-red-600 dark:text-red-400' :
                      (currentStock + pendingOrders - receivedOrders) / monthlyAverage < 1 ? 'text-orange-600 dark:text-orange-400' :
                      (currentStock + pendingOrders - receivedOrders) / monthlyAverage < 2 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    ) : 'text-gray-600 dark:text-gray-400'
                  }`}>{
                    monthlyAverage > 0 
                      ? `${((currentStock + pendingOrders - receivedOrders) / monthlyAverage).toFixed(1)} ay`
                      : 'Hesaplanamadı'
                  }</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Hedef Stok Süresi:</span>
                  <span className="font-mono font-semibold">{(() => {
                    // Hedef ay hesaplaması
                    if (!turnoverDays || turnoverDays <= 0 || currentStock <= 0) {
                      if (movementStatus === 'Aktif') return '1.5 ay'
                      if (movementStatus === 'Yavaş') return '1.0 ay'
                      if (movementStatus === 'Durgun') return '0.5 ay'
                      return '0.5 ay'
                    }
                    if (movementStatus === 'Durgun' && turnoverDays <= 30) return '0.5 ay'
                    if (movementStatus === 'Yavaş' && turnoverDays <= 30) return '1.0 ay'
                    if (movementStatus === 'Aktif') {
                      if (turnoverDays <= 15) return '1.5 ay'
                      if (turnoverDays <= 30) return '1.2 ay'
                      if (turnoverDays <= 60) return '1.0 ay'
                      return '0.5 ay'
                    }
                    if (movementStatus === 'Yavaş') return '1.0 ay'
                    if (movementStatus === 'Durgun') return '0.5 ay'
                    return '0.5 ay'
                  })()}</span>
                </div>
                {turnoverDays && turnoverDays > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı:</span>
                    <span className="font-mono font-semibold">{turnoverDays.toFixed(0)} gün</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı:</span>
                    <span className="font-mono font-semibold text-gray-400">Stok yok</span>
                  </div>
                )}
              </div>
              
              {/* Stok Durumu Değerlendirmesi */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Stok Durumu</span>
                <span className={`text-xs font-bold ${
                  (currentStock + pendingOrders - receivedOrders) / monthlyAverage >= 2 ? 'text-green-600 dark:text-green-400' :
                  (currentStock + pendingOrders - receivedOrders) / monthlyAverage >= 1 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-orange-600 dark:text-orange-400'
                }`}>
                  {(currentStock + pendingOrders - receivedOrders) / monthlyAverage >= 2 ? 'Yeterli Stok' :
                   (currentStock + pendingOrders - receivedOrders) / monthlyAverage >= 1 ? 'Normal Seviye' :
                   'İzlenmeli'}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                <p className="text-[10px] text-gray-500 dark:text-[oklch(0.55_0.00_0)] italic">
                  {(currentStock + pendingOrders - receivedOrders) / monthlyAverage >= 2 ? 
                    'Tedarikçi siparişi beklemede. Stok yeterli seviyede.' :
                   (currentStock + pendingOrders - receivedOrders) / monthlyAverage >= 1 ? 
                    'Sipariş geldiğinde stok normale dönecek.' :
                    'Sipariş gelene kadar stok durumu yakından takip edilmeli.'}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  // Kısmi sipariş verilmiş ama eksik durumu
  // ÖNEMLİ: suggestedQuantity > 0 kontrolü yapıyoruz, 0 veya negatif değerler için kısmi sipariş göstermiyoruz
  if (pendingOrders > 0 && suggestedQuantity && suggestedQuantity > 0) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-2 min-w-[120px]">
              <span className="font-medium text-xs font-inter text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                +{formatOrderNumber(Math.round(suggestedQuantity))}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400"></span>
                <span className="text-xs font-medium font-inter text-yellow-600 dark:text-yellow-400">
                  Kısmi sipariş
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
            sideOffset={5}
          >
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Kısmi Sipariş - Ek Sipariş Önerisi</h3>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-md p-2 text-center">
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Verilmiş</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatNumber(pendingOrders)}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-md p-2 text-center">
                  <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">Ek Öneri</p>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                    +{formatNumber(Math.round(suggestedQuantity))}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-2">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-1">Toplam İhtiyaç</p>
                <p className="text-xs font-mono text-blue-700 dark:text-blue-300">
                  {suggestedQuantity > 0 
                    ? `${formatNumber(pendingOrders)} + ${formatNumber(Math.round(suggestedQuantity))} = ${formatNumber(pendingOrders + Math.round(suggestedQuantity))} adet`
                    : `${formatNumber(pendingOrders)} adet (Yeterli)`
                  }
                </p>
              </div>
              
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Mevcut Stok:</span>
                  <span className="font-mono font-semibold">{formatNumber(currentStock)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Net Stok:</span>
                  <span className="font-mono font-semibold">{formatNumber(currentStock + pendingOrders - receivedOrders)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aylık Ort. Satış:</span>
                  <span className="font-mono font-semibold">{formatNumber(monthlyAverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Kalan Ay Sayısı:</span>
                  <span className={`font-mono font-semibold ${
                    (currentStock + pendingOrders - receivedOrders) / (monthlyAverage / 30) < 15 ? 'text-red-600 dark:text-red-400' :
                    (currentStock + pendingOrders - receivedOrders) / (monthlyAverage / 30) < 30 ? 'text-orange-600 dark:text-orange-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>{((currentStock + pendingOrders - receivedOrders) / monthlyAverage).toFixed(1)} ay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Hedef Stok Süresi:</span>
                  <span className="font-mono font-semibold">{(() => {
                    // Hedef ay hesaplaması - mevcut mantıkla aynı
                    if (!turnoverDays || turnoverDays <= 0 || currentStock <= 0) {
                      if (movementStatus === 'Aktif') return '1.5 ay'
                      if (movementStatus === 'Yavaş') return '1.0 ay'
                      if (movementStatus === 'Durgun') return '0.5 ay'
                      return '0.5 ay'
                    }
                    if (movementStatus === 'Durgun' && turnoverDays <= 30) return '0.5 ay'
                    if (movementStatus === 'Yavaş' && turnoverDays <= 30) return '1.0 ay'
                    if (movementStatus === 'Aktif') {
                      if (turnoverDays <= 15) return '1.5 ay'
                      if (turnoverDays <= 30) return '1.2 ay'
                      if (turnoverDays <= 60) return '1.0 ay'
                      return '0.5 ay'
                    }
                    if (movementStatus === 'Yavaş') return '1.0 ay'
                    if (movementStatus === 'Durgun') return '0.5 ay'
                    return '0.5 ay'
                  })()}</span>
                </div>
                {turnoverDays && turnoverDays > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı:</span>
                    <span className="font-mono font-semibold">{turnoverDays.toFixed(0)} gün</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı:</span>
                    <span className="font-mono font-semibold text-gray-400">Stok yok</span>
                  </div>
                )}
              </div>
              
              {/* Aciliyet Durumu */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aciliyet Durumu</span>
                <span className={`text-xs font-bold ${
                  ((currentStock + pendingOrders - receivedOrders) / monthlyAverage) < 0.5 && movementStatus === 'Aktif' ? 'text-red-600 dark:text-red-400' :
                  ((currentStock + pendingOrders - receivedOrders) / monthlyAverage) < 1 ? 'text-orange-600 dark:text-orange-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {((currentStock + pendingOrders - receivedOrders) / monthlyAverage) < 0.5 && movementStatus === 'Aktif' ? 'Kritik Seviye' :
                   ((currentStock + pendingOrders - receivedOrders) / monthlyAverage) < 1 ? 'Düşük Stok' :
                   movementStatus === 'Yavaş' ? 'Yavaş Hareket' :
                   movementStatus === 'Durgun' ? 'Durgun Hareket' : 'Normal'}
                </span>
              </div>
              
              {/* Formül Açıklaması */}
              <div className="bg-gray-50 dark:bg-[oklch(0.23_0.00_0)] rounded-md p-2">
                <p className="text-[10px] font-medium text-gray-500 dark:text-[oklch(0.65_0.00_0)] mb-1">Hesaplama Formülü:</p>
                <p className="text-[10px] font-mono text-gray-600 dark:text-[oklch(0.60_0.00_0)]">
                  (Hedef Ay × Aylık Satış) - Net Stok
                </p>
                <p className="text-[10px] font-mono text-gray-500 dark:text-[oklch(0.55_0.00_0)] mt-0.5">
                  ({(() => {
                    // Hedef ay değerini hesapla
                    if (!turnoverDays || turnoverDays <= 0 || currentStock <= 0) {
                      if (movementStatus === 'Aktif') return 1.5
                      if (movementStatus === 'Yavaş') return 1.0
                      if (movementStatus === 'Durgun') return 0.5
                      return 0.5
                    }
                    if (movementStatus === 'Durgun' && turnoverDays <= 30) return 0.5
                    if (movementStatus === 'Yavaş' && turnoverDays <= 30) return 1.0
                    if (movementStatus === 'Aktif') {
                      if (turnoverDays <= 15) return 1.5
                      if (turnoverDays <= 30) return 1.2
                      if (turnoverDays <= 60) return 1.0
                      return 0.5
                    }
                    if (movementStatus === 'Yavaş') return 1.0
                    if (movementStatus === 'Durgun') return 0.5
                    return 0.5
                  })().toFixed(1)} × {formatNumber(monthlyAverage)}) - {formatNumber(currentStock + pendingOrders - receivedOrders)}
                </p>
              </div>
              
              <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                <p className="text-[10px] text-gray-500 dark:text-[oklch(0.55_0.00_0)] italic">
                  {((currentStock + pendingOrders - receivedOrders) / monthlyAverage) < 0.5 ? 'Stok tükenme riski! Acil ek sipariş verilmeli.' :
                   ((currentStock + pendingOrders - receivedOrders) / monthlyAverage) < 1 ? 'Stok azalıyor. En kısa sürede ek sipariş verilmeli.' :
                   'Mevcut sipariş yetersiz. Ek sipariş verilmesi önerilir.'}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  // Sipariş önerilmeyen durumlar
  if (!suggestedQuantity || suggestedQuantity === 0) {
    const getNoOrderInfo = () => {
      // Önce sipariş nedeni kontrolü (daha spesifik bilgi içerir)
      if (orderReason?.includes('Durgun ürün - Düşük talep')) {
        return {
          badge: 'Durgun ürün',
          badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
          title: 'Durgun Ürün - Sipariş Önerilmiyor',
          reason: 'Düşük talep nedeniyle sipariş önerilmez',
          description: (
            <div className="space-y-1">
              <p>Aylık ortalama satış: <span className="font-bold">{formatNumber(monthlyAverage)} adet</span></p>
              <p>Mevcut stok: <span className="font-bold">{formatNumber(currentStock)} adet</span></p>
              <p className="text-orange-600 dark:text-orange-400">Bu ürün için acil stok ihtiyacı bulunmamaktadır</p>
            </div>
          ),
          recommendation: 'Mevcut stok tükenene kadar bekleyin'
        }
      }
      if (orderReason?.includes('Ölü stok')) {
        return {
          badge: 'Ölü stok',
          badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800',
          title: 'Ölü Stok - Sipariş Önerilmiyor',
          reason: '180+ gün hareket yok',
          description: 'Ürün uzun süredir hiç satılmamış',
          recommendation: 'Tasfiye veya iade değerlendirilmeli'
        }
      }
      if (orderReason?.includes('Talep üzerine tedarik')) {
        return {
          badge: 'Talep bekle',
          badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
          title: 'Özel Sipariş Ürünü',
          reason: 'Çok düşük satış frekansı',
          description: (
            <div className="space-y-1">
              <p>Aylık satış ortalaması 1'in altında</p>
              {turnoverDays && <p>Devir hızı: <span className="font-bold">{turnoverDays.toFixed(0)} gün</span></p>}
              <p className="text-blue-600 dark:text-blue-400">Muhtemelen özel sipariş üzerine tedarik edilmeli</p>
            </div>
          ),
          recommendation: 'Müşteri talebi geldiğinde sipariş verin'
        }
      }
      if (orderReason?.includes('Özel sipariş')) {
        return {
          badge: 'Özel sipariş',
          badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
          title: 'Özel Sipariş Ürünü',
          reason: 'Talep bazlı tedarik',
          description: 'Düzensiz veya özel talep üzerine hareket gören ürün',
          recommendation: 'Talep geldiğinde değerlendirilmeli'
        }
      }
      if (orderReason?.includes('Tek seferlik')) {
        return {
          badge: 'Tek seferlik',
          badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
          title: 'Tek Seferlik Hareket',
          reason: 'Düzensiz satış pattern',
          description: 'Ürün tek seferlik veya çok düzensiz satılıyor',
          recommendation: 'İhtiyaç durumunda sipariş verilmeli'
        }
      }
      // Hareket durumu bazlı kontrol (genel durum)
      if (movementStatus === 'Ölü Stok') {
        return {
          badge: 'Öneri yok',
          badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
          title: 'Sipariş Önerilmiyor',
          reason: 'Ölü stok - Hareket yok',
          description: 'Ürün 180+ gündür hareket görmüyor',
          recommendation: 'Stok tasfiye edilmeli'
        }
      }
      if (movementStatus === 'Durgun') {
        return {
          badge: 'Öneri yok',
          badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
          title: 'Sipariş Önerilmiyor',
          reason: 'Durgun stok',
          description: (
            <div className="space-y-1">
              <p>Aylık satış: <span className="font-bold">{formatNumber(monthlyAverage)} adet</span></p>
              <p>Son 60-180 gün arası çok az hareket</p>
            </div>
          ),
          recommendation: 'Mevcut stok tüketilmeli, yeni sipariş önerilmez'
        }
      }
      // Kaç ay yeteceğini hesapla
      const monthsOfStock = monthlyAverage > 0 ? (currentStock / monthlyAverage).toFixed(2) : 0
      
      return {
        badge: 'Yeterli stok',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
        title: 'Stok Yeterli',
        reason: 'Mevcut stok ihtiyacı karşılıyor',
        description: (
          <span>
            Eldeki stok <span className="font-bold text-blue-600 dark:text-blue-400">{monthsOfStock} ay</span> yeterli
          </span>
        ),
        recommendation: 'Stok durumu takip edilmeli'
      }
    }
    
    const info = getNoOrderInfo()
    
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-2 min-w-[120px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  info.badge === 'Yeterli stok' ? 'bg-blue-500 dark:bg-blue-400' :
                  info.badge === 'Öneri yok' ? 'bg-gray-500 dark:bg-gray-400' :
                  info.badge === 'Sipariş verildi' ? 'bg-green-500 dark:bg-green-400' :
                  'bg-gray-500 dark:bg-gray-400'
                }`}></span>
                <span className={`text-xs font-medium font-inter ${
                  info.badge === 'Yeterli stok' ? 'text-blue-600 dark:text-blue-400' :
                  info.badge === 'Öneri yok' ? 'text-gray-600 dark:text-gray-400' :
                  info.badge === 'Sipariş verildi' ? 'text-green-600 dark:text-green-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {info.badge}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
            sideOffset={5}
          >
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">{info.title}</h3>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="bg-gray-50 dark:bg-[oklch(0.23_0.00_0)] rounded-md p-2">
                <p className="text-[10px] font-medium text-gray-500 dark:text-[oklch(0.65_0.00_0)] mb-0.5">Sebep</p>
                <p className="text-xs text-gray-700 dark:text-[oklch(0.75_0.00_0)]">{info.reason}</p>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-[oklch(0.70_0.00_0)]">{info.description}</div>
              
              <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
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
  
  // Sipariş miktarı 0 veya negatif ise, aciliyet durumu hesaplamasına geçme
  // Math.round'dan sonra da 0 olabilir, o yüzden yuvarlanmış değeri de kontrol et
  const roundedQuantity = Math.round(suggestedQuantity)
  if (!suggestedQuantity || suggestedQuantity <= 0 || roundedQuantity <= 0) {
    // Yukarıdaki "Sipariş önerilmeyen durumlar" bloğu zaten bu durumu ele alıyor
    // Bu satıra gelmemeli normalde, ama güvenlik için kontrol ekliyoruz
    return null
  }
  
  // Sipariş önerisi var - Aciliyet durumunu belirle
  // Hareket durumunu da dikkate alarak aciliyet belirleme
  const isUrgent = monthlyStock < 0.5 && movementStatus === 'Aktif'
  const isCritical = (monthlyStock >= 0.5 && monthlyStock < 1) || (monthlyStock < 0.5 && movementStatus === 'Yavaş')
  const isNormal = monthlyStock >= 1 || movementStatus === 'Durgun'
  
  const getOrderInfo = () => {
    // Durgun/yavaş ürün kontrolü
    if ((movementStatus === 'Durgun' || movementStatus === 'Yavaş') && suggestedQuantity > 0) {
      return {
        urgencyBadge: 'Düşük öncelik',
        urgencyClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
        title: 'Düşük Öncelikli Sipariş',
        urgencyLevel: movementStatus === 'Durgun' ? 'Durgun Hareket' : 'Yavaş Hareket',
        urgencyColor: 'text-gray-600 dark:text-gray-400',
        recommendation: movementStatus === 'Durgun' ? 
          'Ürün durgun. Minimum güvenlik stoğu (0.5 ay) öneriliyor.' :
          'Ürün yavaş hareket ediyor. Standart stok seviyesi (1.0 ay) öneriliyor.'
      }
    }
    
    if (isUrgent) {
      return {
        urgencyBadge: 'Acil',
        urgencyClass: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800',
        title: 'Acil Sipariş Önerisi',
        urgencyLevel: 'Kritik Seviye',
        urgencyColor: 'text-red-600 dark:text-red-400',
        recommendation: 'Stok tükenme riski! Hemen sipariş verilmeli.'
      }
    }
    if (isCritical) {
      return {
        urgencyBadge: 'Kritik',
        urgencyClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
        title: 'Kritik Sipariş Önerisi',
        urgencyLevel: 'Düşük Stok',
        urgencyColor: 'text-orange-600 dark:text-orange-400',
        recommendation: 'Stok azalıyor. En kısa sürede sipariş verilmeli.'
      }
    }
    return {
      urgencyBadge: 'Normal',
      urgencyClass: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',
      title: 'Sipariş Önerisi',
      urgencyLevel: 'Normal Yenileme',
      urgencyColor: 'text-green-600 dark:text-green-400',
      recommendation: 'Planlı stok yenileme. Normal süreçte sipariş verilebilir.'
    }
  }
  
  const info = getOrderInfo()
  const netStock = currentStock + pendingOrders - receivedOrders
  const coverageDays = monthlyAverage > 0 ? (netStock / (monthlyAverage / 30)) : 0
  
  // Hedef ay hesaplaması - Hareket durumu ve devir hızı kombinasyonuna göre
  const targetMonths = (() => {
    // Stok 0 veya devir hızı hesaplanamıyorsa
    if (!turnoverDays || turnoverDays <= 0 || currentStock <= 0) {
      if (movementStatus === 'Aktif') return 1.5
      if (movementStatus === 'Yavaş') return 1.0
      if (movementStatus === 'Durgun') return 0.5
      return 0.5 // Ölü stok
    }
    
    // ÇELİŞKİLİ DURUM: Durgun/Yavaş hareket + Hızlı devir → Hareket durumunu baz al
    if (movementStatus === 'Durgun' && turnoverDays <= 30) {
      return 0.5 // Durgun hareket baz alındı
    }
    
    if (movementStatus === 'Yavaş' && turnoverDays <= 30) {
      return 1.0 // Yavaş hareket baz alındı
    }
    
    // NORMAL DURUMLAR
    // Aktif hareket - devir hızına göre
    if (movementStatus === 'Aktif') {
      if (turnoverDays <= 15) return 1.5
      if (turnoverDays <= 30) return 1.2
      if (turnoverDays <= 60) return 1.0
      return 0.5
    }
    
    // Yavaş hareket - sabit değer
    if (movementStatus === 'Yavaş') return 1.0
    
    // Durgun hareket - sabit değer
    if (movementStatus === 'Durgun') return 0.5
    
    // Ölü stok
    return 0.5
  })()
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-start gap-2 min-w-[120px]">
            <span className="font-medium text-xs font-inter text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
              {formatOrderNumber(roundedQuantity)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                info.urgencyBadge === 'Acil' ? 'bg-red-500 dark:bg-red-400' :
                info.urgencyBadge === 'Kritik' ? 'bg-orange-500 dark:bg-orange-400' :
                info.urgencyBadge === 'Düşük öncelik' ? 'bg-gray-500 dark:bg-gray-400' :
                'bg-blue-500 dark:bg-blue-400'
              }`}></span>
              <span className={`text-xs font-medium font-inter ${
                info.urgencyBadge === 'Acil' ? 'text-red-600 dark:text-red-400' :
                info.urgencyBadge === 'Kritik' ? 'text-orange-600 dark:text-orange-400' :
                info.urgencyBadge === 'Düşük öncelik' ? 'text-gray-600 dark:text-gray-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>
                {info.urgencyBadge}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
          sideOffset={5}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">{info.title}</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Önerilen Miktar */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 text-center">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-1">Önerilen Sipariş Miktarı</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatOrderNumber(roundedQuantity)}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">adet</p>
            </div>
            
            {/* Hesaplama Detayları */}
            <div className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Mevcut Stok:</span>
                  <span className="font-mono font-semibold">{formatNumber(currentStock)}</span>
                </div>
                {pendingOrders > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Tedarikçi Siparişi:</span>
                    <span className="font-mono font-semibold text-green-600 dark:text-green-400">+{formatNumber(pendingOrders)}</span>
                  </div>
                )}
                {receivedOrders > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Müşteri Siparişi:</span>
                    <span className="font-mono font-semibold text-red-600 dark:text-red-400">-{formatNumber(receivedOrders)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-[oklch(0.27_0.00_0)]">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Net Stok:</span>
                  <span className="font-mono font-bold">{formatNumber(netStock)}</span>
                </div>
              </div>
              
              <div className="text-xs space-y-1 pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aylık Ort. Satış:</span>
                  <span className="font-mono font-semibold">{formatNumber(monthlyAverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Kalan Ay Sayısı:</span>
                  <span className={`font-mono font-semibold ${
                    monthlyStock < 0.5 ? 'text-red-600 dark:text-red-400' :
                    monthlyStock < 1 ? 'text-orange-600 dark:text-orange-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>{monthlyStock.toFixed(1)} ay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Hedef Stok Süresi:</span>
                  <span className="font-mono font-semibold">{targetMonths.toFixed(1)} ay</span>
                </div>
                {turnoverDays && turnoverDays > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı:</span>
                    <span className="font-mono font-semibold">{turnoverDays.toFixed(0)} gün</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Devir Hızı:</span>
                    <span className="font-mono font-semibold text-gray-400">Stok yok</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Aciliyet Durumu */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
              <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Aciliyet Durumu</span>
              <span className={`text-xs font-bold ${info.urgencyColor}`}>
                {info.urgencyLevel}
              </span>
            </div>
            
            {/* Formül Açıklaması */}
            <div className="bg-gray-50 dark:bg-[oklch(0.23_0.00_0)] rounded-md p-2">
              <p className="text-[10px] font-medium text-gray-500 dark:text-[oklch(0.65_0.00_0)] mb-1">Hesaplama Formülü:</p>
              <p className="text-[10px] font-mono text-gray-600 dark:text-[oklch(0.60_0.00_0)]">
                (Hedef Ay × Aylık Satış) - Net Stok
              </p>
              <p className="text-[10px] font-mono text-gray-500 dark:text-[oklch(0.55_0.00_0)] mt-0.5">
                ({targetMonths.toFixed(1)} × {formatNumber(monthlyAverage)}) - {formatNumber(netStock)}
              </p>
              {/* Hedef ay açıklaması */}
              {movementStatus === 'Durgun' && 
                turnoverDays && turnoverDays > 0 && turnoverDays <= 30 && (
                <p className="text-[9px] text-yellow-600 dark:text-yellow-400 mt-1 italic">
                  * Düşük stok ama durgun hareket: 0.5 ay hedef
                </p>
              )}
              {movementStatus === 'Yavaş' && 
                turnoverDays && turnoverDays > 0 && turnoverDays <= 30 && (
                <p className="text-[9px] text-yellow-600 dark:text-yellow-400 mt-1 italic">
                  * Düşük stok ama yavaş hareket: 1.0 ay hedef
                </p>
              )}
            </div>
            
            {/* Öneri */}
            <div className="pt-2 border-t border-gray-100 dark:border-[oklch(0.27_0.00_0)]">
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