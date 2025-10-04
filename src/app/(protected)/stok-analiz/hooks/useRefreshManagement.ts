'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRefresh } from '@/contexts/RefreshContext'
import { useGroups } from '@/hooks/use-groups'
import { AnalizFiltre } from '@/types'

interface RefreshResult {
  success: boolean
  data?: any[]
  error?: string
}

interface UseRefreshManagementProps {
  filters: AnalizFiltre
  refetch: () => Promise<RefreshResult>
  data: any[]
  clearAllFilters: () => void
  clearSelection: () => void
}

interface UseRefreshManagementReturn {
  lastRefreshTime: Date | null
  isRefreshing: boolean
  refreshHistory: Array<{ time: Date; success: boolean; groupName?: string }>
  handleRefresh: () => Promise<void>
  handleAnalysisRefresh: () => Promise<void>
}

export function useRefreshManagement({
  filters,
  refetch,
  data,
  clearAllFilters,
  clearSelection
}: UseRefreshManagementProps): UseRefreshManagementReturn {
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshHistory, setRefreshHistory] = useState<Array<{ time: Date; success: boolean; groupName?: string }>>([])
  
  const refreshContext = useRefresh()
  const { groups } = useGroups()

  // İlk yüklemede localStorage'dan verileri al
  useEffect(() => {
    const stored = localStorage.getItem('lastRefreshTime')
    if (stored) {
      const storedTime = new Date(stored)
      setLastRefreshTime(storedTime)
      refreshContext.setLastRefreshTime(storedTime)
    } else if (data.length > 0) {
      const now = new Date()
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
      refreshContext.setLastRefreshTime(now)
    }
  }, [])

  // Data değiştiğinde lastRefreshTime'ı güncelle
  useEffect(() => {
    if (data.length > 0 && !lastRefreshTime) {
      const now = new Date()
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
      refreshContext.setLastRefreshTime(now)
    }
  }, [data.length, lastRefreshTime])

  // Refresh history'yi localStorage'dan yükle
  useEffect(() => {
    const saved = localStorage.getItem('refreshHistory')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const history = parsed.map((item: any) => ({
          ...item,
          time: new Date(item.time)
        }))
        setRefreshHistory(history)
        // Context'e de kaydet
        history.forEach((item: any) => {
          refreshContext.addRefreshHistory(item)
        })
      } catch (e) {
        console.error('Refresh history parse error:', e)
      }
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    
    // Filtreleri ve seçimleri sıfırla
    clearAllFilters()
    clearSelection()
    
    const result = await refetch()
    const now = new Date()
    
    if (result && result.success) {
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
      
      // Başarılı güncellemeyi geçmişe ekle
      const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
      const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
      
      const newHistory = { time: now, success: true, groupName }
      setRefreshHistory(prev => {
        const newArr = [newHistory, ...prev.slice(0, 4)]
        return newArr.slice(0, 5) // Max 5 item
      })
      
      const historyForStorage = [newHistory, ...refreshHistory.slice(0, 4)]
      localStorage.setItem('refreshHistory', JSON.stringify(historyForStorage))
      
      // Context'e kaydet
      refreshContext.setLastRefreshTime(now)
      refreshContext.addRefreshHistory(newHistory)
      
      // Toast bildirimi
      const dataCount = result.data?.length || 0
      toast.success('Veriler güncellendi', {
        description: dataCount > 0 ? `${dataCount} kayıt başarıyla yenilendi` : 'Veriler başarıyla güncellendi'
      })
    } else {
      // Başarısız güncellemeyi geçmişe ekle
      const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
      const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
      
      const newHistory = { time: now, success: false, groupName }
      setRefreshHistory(prev => {
        const newArr = [newHistory, ...prev.slice(0, 4)]
        return newArr.slice(0, 5) // Max 5 item
      })
      
      const historyForStorage = [newHistory, ...refreshHistory.slice(0, 4)]
      localStorage.setItem('refreshHistory', JSON.stringify(historyForStorage))
      
      // Context'e kaydet
      refreshContext.addRefreshHistory(newHistory)
      
      // Hata toast bildirimi
      toast.error('Güncelleme başarısız', {
        description: result?.error || 'Bağlantı hatası oluştu'
      })
    }
    
    setIsRefreshing(false)
  }, [refetch, refreshContext, groups, filters.anaGrupKodu, clearAllFilters, clearSelection, refreshHistory])

  const handleAnalysisRefresh = useCallback(async () => {
    // Filtreleri ve seçimleri sıfırla
    clearAllFilters()
    clearSelection()
    
    const result = await refetch()
    const now = new Date()
    
    if (result && result.success) {
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
      
      // Başarılı güncellemeyi geçmişe ekle
      const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
      const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
      
      const newHistory = { time: now, success: true, groupName }
      setRefreshHistory(prev => {
        const newArr = [newHistory, ...prev.slice(0, 4)]
        return newArr.slice(0, 5) // Max 5 item
      })
      
      const historyForStorage = [newHistory, ...refreshHistory.slice(0, 4)]
      localStorage.setItem('refreshHistory', JSON.stringify(historyForStorage))
      
      // Context'e kaydet
      refreshContext.setLastRefreshTime(now)
      refreshContext.addRefreshHistory(newHistory)
      
      // Toast bildirimi
      const dataCount = result.data?.length || 0
      toast.success('Analiz tamamlandı', {
        description: dataCount > 0 ? `${dataCount} kayıt başarıyla analiz edildi` : 'Stok verileri başarıyla analiz edildi'
      })
    } else {
      // Başarısız güncellemeyi geçmişe ekle
      const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
      const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
      
      const newHistory = { time: now, success: false, groupName }
      setRefreshHistory(prev => {
        const newArr = [newHistory, ...prev.slice(0, 4)]
        return newArr.slice(0, 5) // Max 5 item
      })
      
      const historyForStorage = [newHistory, ...refreshHistory.slice(0, 4)]
      localStorage.setItem('refreshHistory', JSON.stringify(historyForStorage))
      
      // Context'e kaydet
      refreshContext.addRefreshHistory(newHistory)
      
      // Hata toast bildirimi
      toast.error('Analiz başarısız', {
        description: result?.error || 'Bağlantı hatası oluştu'
      })
    }
    
    return result
  }, [refetch, refreshContext, groups, filters.anaGrupKodu, clearAllFilters, clearSelection, refreshHistory])

  // Cleanup
  useEffect(() => {
    return () => {
      setRefreshHistory([])
    }
  }, [])

  return {
    lastRefreshTime,
    isRefreshing,
    refreshHistory,
    handleRefresh,
    handleAnalysisRefresh
  }
}