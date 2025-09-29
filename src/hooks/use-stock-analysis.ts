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

  // Component mount olduktan sonra sessionStorage'dan verileri yükle
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const stored = sessionStorage.getItem('stockAnalysisData')
        if (stored) {
          const parsedData = JSON.parse(stored)
          if (parsedData && parsedData.length > 0) {
            // Eğer sadeleştirilmiş veri ise (eksik alanlar varsa), veriyi olduğu gibi kullan
            // Aksi halde tam veriyi kullan
            setData(parsedData)
          }
        }
      } catch (e) {
        console.error('SessionStorage parse error:', e)
        // Hatalı veri varsa temizle
        sessionStorage.removeItem('stockAnalysisData')
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Data değiştiğinde sessionStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && data.length > 0 && isInitialized) {
      try {
        // Önce veriyi kaydetmeyi dene
        sessionStorage.setItem('stockAnalysisData', JSON.stringify(data))
      } catch (e) {
        // Kota hatası durumunda
        if (e instanceof DOMException && e.code === 22) {
          console.warn('SessionStorage quota exceeded, clearing old data...')
          
          // Eski verileri temizle
          const keysToKeep = ['stockAnalysisFilters'] // Sadece filtreleri koru
          const allKeys = Object.keys(sessionStorage)
          
          allKeys.forEach(key => {
            if (!keysToKeep.includes(key) && key.startsWith('stockAnalysis')) {
              sessionStorage.removeItem(key)
            }
          })
          
          // Tekrar kaydetmeyi dene (sadece temel veri)
          try {
            // Veriyi sadeleştir - sadece görünen kolonları tut
            const simplifiedData = data.map(item => ({
              stokKodu: item.stokKodu,
              stokIsmi: item.stokIsmi,
              kalanMiktar: item.kalanMiktar,
              aylikOrtalamaSatis: item.aylikOrtalamaSatis,
              ortalamaAylikStok: item.ortalamaAylikStok,
              onerilenSiparis: item.onerilenSiparis
            }))
            sessionStorage.setItem('stockAnalysisData', JSON.stringify(simplifiedData))
          } catch (e2) {
            console.error('Could not save data even after cleanup:', e2)
            // En son çare: veriyi kaydetme
          }
        }
      }
    }
  }, [data, isInitialized])

  const fetchData = useCallback(async () => {
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
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // SessionStorage'ı temizle (yeni analiz için)
  const clearStoredData = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('stockAnalysisData')
    }
  }, [])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    cleanup,
    clearStoredData 
  }
}