import { safeSessionStorage } from '@/lib/safe-storage'
import { useState, useCallback, useRef, useEffect } from 'react'
import { StokAnalizRaporu, AnalizFiltre } from '@/types'
import { formatDateForSQL } from '@/lib/formatters'

export function useStockAnalysis(filters: AnalizFiltre) {
  const [data, setData] = useState<StokAnalizRaporu[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Aktif request'i takip etmek için
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef<number>(0)

  // Component mount olduktan sonra sessionStorage'dan verileri yükle
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const storedData = safeSessionStorage.getItem<StokAnalizRaporu[]>('stockAnalysisData', [])
      if (storedData.length > 0) {
        setData(storedData)
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Data değiştiğinde sessionStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && data.length > 0 && isInitialized) {
      // safeSessionStorage otomatik quota yönetimi yapar
      const success = safeSessionStorage.setItem('stockAnalysisData', data)
      
      // Eğer başarısız olursa (çok büyük veri), sadeleştir
      if (!success && data.length > 100) {
        console.warn('Data too large, simplifying...')
        const simplifiedData = data.map(item => ({
          stokKodu: item.stokKodu,
          stokIsmi: item.stokIsmi,
          kalanMiktar: item.kalanMiktar,
          aylikOrtalamaSatis: item.aylikOrtalamaSatis,
          ortalamaAylikStok: item.ortalamaAylikStok,
          onerilenSiparis: item.onerilenSiparis
        }))
        safeSessionStorage.setItem('stockAnalysisData', simplifiedData)
      }
    }
  }, [data, isInitialized])

  const fetchData = useCallback(async () => {
    // Request ID increment
    requestIdRef.current += 1
    const currentRequestId = requestIdRef.current
    
    // Önceki request varsa iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Yeni AbortController oluştur
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setLoading(true)
    setError(null)
    
    try {
      // Tarihleri 2025 yılına zorla
      const baslangic = new Date(filters.baslangicTarihi)
      const bitis = new Date(filters.bitisTarihi)
      
      // Yıl kontrolü ve düzeltmesi
      if (baslangic.getFullYear() !== 2025) {
        baslangic.setFullYear(2025)
      }
      if (bitis.getFullYear() !== 2025) {
        bitis.setFullYear(2025)
      }
      
      const params = new URLSearchParams({
        baslangicTarih: formatDateForSQL(baslangic),
        bitisTarih: formatDateForSQL(bitis),
        aySayisi: filters.aySayisi.toString(),
        ...(filters.anaGrupKodu && { anaGrup: filters.anaGrupKodu })
      })

      const response = await fetch(`/api/stok-analiz?${params}`, {
        signal: abortController.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Request iptal edildiyse state güncelleme yapma
      if (abortController.signal.aborted) {
        return { success: false, error: 'İptal edildi' }
      }
      
      // Bu request eski bir request ise sonucu ignore et
      if (currentRequestId !== requestIdRef.current) {
        console.log('Eski request sonucu ignore edildi:', currentRequestId)
        return { success: false, error: 'Eski request' }
      }
      
      if (result.success) {
        setData(result.data || [])
        return { success: true, data: result.data || [] }
      } else {
        setError(result.error || 'Veri yükleme hatası')
        if (result.detail) {
          console.error('API Hata Detayı:', result.detail)
        }
        return { success: false, error: result.error || 'Veri yükleme hatası' }
      }
    } catch (err: any) {
      // Request iptal hatası değilse
      if (err.name !== 'AbortError') {
        setError('Bağlantı hatası oluştu')
        console.error('Veri yükleme hatası:', err)
        return { success: false, error: 'Bağlantı hatası oluştu' }
      }
      return { success: false, error: 'İptal edildi' }
    } finally {
      // Request iptal edilmediyse loading'i kapat
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [filters])

  // Component unmount olduğunda aktif request'i iptal et
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // SessionStorage'ı temizle (yeni analiz için)
  const clearStoredData = useCallback(() => {
    if (typeof window !== 'undefined') {
      safeSessionStorage.removeItem('stockAnalysisData')
    }
  }, [])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData
  }
}