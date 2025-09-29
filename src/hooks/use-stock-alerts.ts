import { useState, useEffect, useCallback, useMemo } from 'react'
import { StokAnalizRaporu, StockAlert, AlertStats, ReadAlertRecord, DismissedAlertRecord, StockAlertNote } from '@/types'

const STORAGE_KEYS = {
  ALERTS: 'stockAlerts',
  READ: 'readAlerts',
  DISMISSED: 'dismissedAlerts',
  HISTORY: 'alertHistory'
} as const

export function useStockAlerts(stockData: StokAnalizRaporu[]) {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [readAlerts, setReadAlerts] = useState<ReadAlertRecord[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<DismissedAlertRecord[]>([])
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  // LocalStorage'dan verileri yükle
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        // TEMP: Eski uyarıları temizle (bir kerelik)
        const needsCleanup = localStorage.getItem('alertCleanupDone') !== 'true'
        if (needsCleanup) {
          localStorage.removeItem(STORAGE_KEYS.ALERTS)
          localStorage.removeItem(STORAGE_KEYS.READ)
          localStorage.setItem('alertCleanupDone', 'true')
          console.log('Eski uyarılar temizlendi')
          return
        }

        const storedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS)
        const storedRead = localStorage.getItem(STORAGE_KEYS.READ)
        const storedDismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED)

        if (storedAlerts) {
          const parsed = JSON.parse(storedAlerts)
          setAlerts(parsed.map((a: any) => ({
            ...a,
            alertDate: new Date(a.alertDate)
          })))
        }

        if (storedRead) {
          setReadAlerts(JSON.parse(storedRead))
        }

        if (storedDismissed) {
          setDismissedAlerts(JSON.parse(storedDismissed))
        }
      } catch (error) {
        console.error('LocalStorage yükleme hatası:', error)
      }
    }

    loadFromStorage()
  }, [])

  // Uyarı oluşturma kriterleri
  const shouldCreateAlert = useCallback((item: StokAnalizRaporu): boolean => {
    // Silinmiş ürünleri kontrol et
    const isDismissed = dismissedAlerts.some(d => d.stokKodu === item.stokKodu)
    if (isDismissed) return false

    // Mevcut aktif uyarıyı kontrol et
    const existingAlert = alerts.find(a => 
      a.stokKodu === item.stokKodu && 
      a.status === 'active'
    )
    
    if (existingAlert) {
      // Son 24 saatte oluşturulmuşsa tekrar oluşturma
      const hoursSince = (Date.now() - new Date(existingAlert.alertDate).getTime()) / (1000 * 60 * 60)
      if (hoursSince < 24) return false
    }

    // Ölü stok veya durgun ürünleri hariç tut
    if (item.hareketDurumu === 'Ölü Stok' || item.hareketDurumu === 'Durgun') {
      return false
    }

    // Önerilen sipariş miktarı 0 veya altındaysa uyarı verme
    if (item.onerilenSiparis <= 0) {
      return false
    }

    // Uyarı kriterleri - sadece önerilen sipariş 1 ve üstü olanlar
    return (
      item.onerilenSiparis >= 1 && // En az 1 birim sipariş önerisi
      (
        item.ortalamaAylikStok < 1 || // 1 aydan az stok
        item.kalanMiktar === 0 || // Stok tükendi
        (item.ortalamaAylikStok < 1.5 && item.aylikOrtalamaSatis > 0) // Stok düşük ve satış var
      )
    )
  }, [alerts, dismissedAlerts])

  // Severity belirleme
  const getAlertSeverity = (item: StokAnalizRaporu): 'critical' | 'high' | 'medium' => {
    // Stok tamamen tükenmişse ve önerilen sipariş yüksekse
    if (item.kalanMiktar === 0 && item.onerilenSiparis > 100) return 'critical'
    // Yarım aydan az stok varsa
    if (item.ortalamaAylikStok < 0.5) return 'critical'
    // 1 aydan az stok varsa
    if (item.ortalamaAylikStok < 1) return 'high'
    // 1.5 aydan az stok varsa
    return 'medium'
  }

  // Yeni uyarıları kontrol et ve oluştur
  const checkAndCreateAlerts = useCallback(() => {
    const newAlerts: StockAlert[] = []

    stockData.forEach(item => {
      if (shouldCreateAlert(item)) {
        const alertId = `alert-${item.stokKodu}-${Date.now()}`
        
        newAlerts.push({
          id: alertId,
          stokKodu: item.stokKodu,
          stokIsmi: item.stokIsmi,
          anaGrupKodu: item.altGrup || undefined,
          alertDate: new Date(),
          severity: getAlertSeverity(item),
          status: 'active',
          data: {
            kalanMiktar: item.kalanMiktar,
            aylikOrtalamaSatis: item.aylikOrtalamaSatis,
            onerilenSiparis: item.onerilenSiparis,
            ortalamaAylikStok: item.ortalamaAylikStok,
            hareketDurumu: item.hareketDurumu
          },
          notes: []
        })
      }
    })

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Eski uyarıları pasif yap
        const updated = prev.map(alert => {
          const isUpdated = newAlerts.some(na => na.stokKodu === alert.stokKodu)
          if (isUpdated && alert.status === 'active') {
            return { ...alert, status: 'dismissed' as const }
          }
          return alert
        })

        // Yeni uyarıları ekle
        const combined = [...updated, ...newAlerts]
        
        // LocalStorage'a kaydet
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(combined))
        
        return combined
      })
    }

    setLastCheck(new Date())
  }, [stockData, shouldCreateAlert])

  // İlk yüklemede ve data değiştiğinde kontrol et
  useEffect(() => {
    if (stockData.length > 0) {
      checkAndCreateAlerts()
    }
  }, [stockData])

  // Uyarıyı okundu olarak işaretle
  const markAsRead = useCallback((alertId: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    const readRecord: ReadAlertRecord = {
      alertId,
      stokKodu: alert.stokKodu,
      readDate: new Date().toISOString()
    }

    setReadAlerts(prev => {
      const updated = [...prev, readRecord]
      localStorage.setItem(STORAGE_KEYS.READ, JSON.stringify(updated))
      return updated
    })

    // Alert status güncelle
    setAlerts(prev => {
      const updated = prev.map(a => 
        a.id === alertId ? { ...a, status: 'read' as const } : a
      )
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated))
      return updated
    })
  }, [alerts])

  // Uyarıyı sil
  const dismissAlert = useCallback((alertId: string, reason?: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    const dismissRecord: DismissedAlertRecord = {
      stokKodu: alert.stokKodu,
      dismissDate: new Date().toISOString(),
      reason
    }

    setDismissedAlerts(prev => {
      const updated = [...prev, dismissRecord]
      localStorage.setItem(STORAGE_KEYS.DISMISSED, JSON.stringify(updated))
      return updated
    })

    // Alert status güncelle
    setAlerts(prev => {
      const updated = prev.map(a => 
        a.id === alertId ? { ...a, status: 'dismissed' as const } : a
      )
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated))
      return updated
    })
  }, [alerts])

  // Not ekle
  const addNote = useCallback((alertId: string, text: string) => {
    if (!text.trim()) return

    const note: StockAlertNote = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date()
    }

    setAlerts(prev => {
      const updated = prev.map(alert => {
        if (alert.id === alertId) {
          return {
            ...alert,
            notes: [...(alert.notes || []), note]
          }
        }
        return alert
      })
      
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Not sil
  const deleteNote = useCallback((alertId: string, noteId: string) => {
    setAlerts(prev => {
      const updated = prev.map(alert => {
        if (alert.id === alertId) {
          return {
            ...alert,
            notes: alert.notes?.filter(n => n.id !== noteId) || []
          }
        }
        return alert
      })
      
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Tümünü okundu işaretle
  const markAllAsRead = useCallback(() => {
    const activeAlerts = alerts.filter(a => a.status === 'active')
    const readRecords: ReadAlertRecord[] = activeAlerts.map(alert => ({
      alertId: alert.id,
      stokKodu: alert.stokKodu,
      readDate: new Date().toISOString()
    }))

    setReadAlerts(prev => {
      const updated = [...prev, ...readRecords]
      localStorage.setItem(STORAGE_KEYS.READ, JSON.stringify(updated))
      return updated
    })

    setAlerts(prev => {
      const updated = prev.map(a => 
        a.status === 'active' ? { ...a, status: 'read' as const } : a
      )
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated))
      return updated
    })
  }, [alerts])

  // İstatistikler
  const stats = useMemo<AlertStats>(() => {
    const activeAlerts = alerts.filter(a => a.status === 'active')
    
    return {
      total: alerts.filter(a => a.status !== 'dismissed').length,
      unread: activeAlerts.length,
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      high: activeAlerts.filter(a => a.severity === 'high').length,
      medium: activeAlerts.filter(a => a.severity === 'medium').length
    }
  }, [alerts])

  // Aktif uyarıları getir
  const activeAlerts = useMemo(() => 
    alerts.filter(a => a.status === 'active'),
    [alerts]
  )

  // Okunmuş uyarıları getir
  const readAlertsList = useMemo(() => 
    alerts.filter(a => a.status === 'read'),
    [alerts]
  )

  return {
    alerts: activeAlerts,
    readAlerts: readAlertsList,
    stats,
    lastCheck,
    markAsRead,
    dismissAlert,
    markAllAsRead,
    addNote,
    deleteNote,
    refreshAlerts: checkAndCreateAlerts
  }
}