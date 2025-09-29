import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronDown, Loader2 } from 'lucide-react'
import AlertCard from '../alert-card'
import EmptyState from './empty-state'
import { PopoverContentProps } from '../shared/types'

/**
 * Popover Content - Ana içerik alanı
 */
export default function PopoverContent({
  alerts,
  activeTab,
  onInspect,
  onMarkAsRead,
  onDismiss,
  onAddNote,
  onDeleteNote
}: PopoverContentProps) {
  // Load More state yönetimi
  const [visibleCount, setVisibleCount] = useState(10) // İlk başta 10 uyarı göster
  const [isLoading, setIsLoading] = useState(false)
  
  // Görüntülenecek uyarılar
  const visibleAlerts = alerts.slice(0, visibleCount)
  const hasMore = visibleCount < alerts.length
  const remainingCount = alerts.length - visibleCount

  if (alerts.length === 0) {
    return <EmptyState type={activeTab} />
  }

  const handleLoadMore = () => {
    setIsLoading(true)
    // Gerçek uygulamada burada API çağrısı olabilir
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, alerts.length))
      setIsLoading(false)
    }, 300) // Küçük bir gecikme için
  }

  return (
    <>
      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-3">
          {visibleAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onInspect={onInspect}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
            />
          ))}
          
          {/* Load More Butonu */}
          {hasMore && (
            <div className="pt-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs font-medium hover:bg-gray-50"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1.5" />
                    Daha fazla göster ({remainingCount} uyarı)
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Tüm uyarılar gösterildiğinde */}
          {!hasMore && alerts.length > 10 && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">
                Tüm uyarılar gösteriliyor ({alerts.length} uyarı)
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  )
}