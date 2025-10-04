'use client'

import { useState, useEffect, useCallback } from 'react'
import { StokAnalizRaporu } from '@/types'

export type SortConfig = {
  key: keyof StokAnalizRaporu | null
  direction: 'asc' | 'desc'
}

interface UseStockSortingReturn {
  sortConfig: SortConfig
  handleSort: (key: keyof StokAnalizRaporu) => void
  isHydrated: boolean
}

export function useStockSorting(): UseStockSortingReturn {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [isHydrated, setIsHydrated] = useState(false)

  // SessionStorage'dan yükle
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedSortConfig = sessionStorage.getItem('stockAnalysisSortConfig')
    if (storedSortConfig) {
      try {
        setSortConfig(JSON.parse(storedSortConfig))
      } catch {}
    }

    setIsHydrated(true)
  }, [])

  // SessionStorage'a kaydet
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    sessionStorage.setItem('stockAnalysisSortConfig', JSON.stringify(sortConfig))
  }, [sortConfig, isHydrated])

  const handleSort = useCallback((key: keyof StokAnalizRaporu) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  return {
    sortConfig,
    handleSort,
    isHydrated
  }
}