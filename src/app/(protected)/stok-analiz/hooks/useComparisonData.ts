'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { StokAnalizRaporu, AnalizFiltre } from '@/types'
import { formatDateForSQL } from '@/lib/formatters'

interface UseComparisonDataProps {
  filters: AnalizFiltre
}

interface UseComparisonDataReturn {
  compareMode: 'week' | 'month'
  setCompareMode: (mode: 'week' | 'month') => void
  previousPeriodData: StokAnalizRaporu[]
  loadingPreviousData: boolean
  handleCompareChange: (mode: 'week' | 'month') => void
  loadPreviousPeriodData: (currentProductCodes?: string[]) => Promise<void>
}

export function useComparisonData({ filters }: UseComparisonDataProps): UseComparisonDataReturn {
  const [compareMode, setCompareMode] = useState<'week' | 'month'>('week')
  const [previousPeriodData, setPreviousPeriodData] = useState<StokAnalizRaporu[]>([])
  const [loadingPreviousData, setLoadingPreviousData] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Kıyaslama için tarih hesaplama fonksiyonu
  const calculateCompareDates = useCallback((mode: 'week' | 'month') => {
    const today = new Date()
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date

    if (mode === 'week') {
      // Son 7 gün
      currentEnd = new Date(today)
      currentStart = new Date(today)
      currentStart.setDate(today.getDate() - 7)
      
      // Önceki 7 gün
      previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      previousStart = new Date(previousEnd)
      previousStart.setDate(previousEnd.getDate() - 7)
    } else {
      // Son 30 gün
      currentEnd = new Date(today)
      currentStart = new Date(today)
      currentStart.setDate(today.getDate() - 30)
      
      // Önceki 30 gün
      previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      previousStart = new Date(previousEnd)
      previousStart.setDate(previousEnd.getDate() - 30)
    }

    return {
      currentStart: formatDateForSQL(currentStart),
      currentEnd: formatDateForSQL(currentEnd),
      previousStart: formatDateForSQL(previousStart),
      previousEnd: formatDateForSQL(previousEnd)
    }
  }, [])

  // Önceki dönem verilerini yükle
  const loadPreviousPeriodData = useCallback(async (currentProductCodes?: string[]) => {
    if (!filters.anaGrupKodu) return
    
    // Önceki request'i iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    setLoadingPreviousData(true)
    
    try {
      const dates = calculateCompareDates(compareMode)
      
      const queryParams = new URLSearchParams({
        anaGrupKodu: filters.anaGrupKodu,
        baslangicTarihi: dates.previousStart,
        bitisTarihi: dates.previousEnd,
        depoKodu: filters.depoKodu || '',
      })

      const response = await fetch(`/api/stok-analiz?${queryParams}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        const allPreviousData = result.data || []
        
        // Eğer ürün kodları verilmişse, sadece o ürünlerin verilerini filtrele
        if (currentProductCodes && currentProductCodes.length > 0) {
          const filteredPreviousData = allPreviousData.filter((item: StokAnalizRaporu) => 
            currentProductCodes.includes(item.stokKodu)
          )
          setPreviousPeriodData(filteredPreviousData)
        } else {
          setPreviousPeriodData(allPreviousData)
        }
      } else {
        console.error('Önceki dönem verisi alınamadı:', result.error)
        setPreviousPeriodData([])
      }
    } catch (error) {
      console.error('Önceki dönem verisi yükleme hatası:', error)
      setPreviousPeriodData([])
    } finally {
      setLoadingPreviousData(false)
    }
  }, [calculateCompareDates, filters.anaGrupKodu, filters.depoKodu, compareMode])

  // Kıyaslama modu değişim handler'ı
  const handleCompareChange = (mode: 'week' | 'month') => {
    setCompareMode(mode)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setPreviousPeriodData([])
    }
  }, [])

  return {
    compareMode,
    setCompareMode,
    previousPeriodData,
    loadingPreviousData,
    handleCompareChange,
    loadPreviousPeriodData
  }
}