'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseStockSelectionReturn {
  selectedItems: Set<string>
  setSelectedItems: (value: Set<string>) => void
  handleSelectAll: (checked: boolean, allIds: string[]) => void
  handleSelectItem: (stokKodu: string, checked: boolean) => void
  clearSelection: () => void
  isHydrated: boolean
}

export function useStockSelection(): UseStockSelectionReturn {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  // SessionStorage'dan yükle
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedSelectedItems = sessionStorage.getItem('stockAnalysisSelectedItems')
    if (storedSelectedItems) {
      try {
        const parsed = JSON.parse(storedSelectedItems)
        setSelectedItems(new Set(parsed))
      } catch {}
    }

    setIsHydrated(true)
  }, [])

  // SessionStorage'a kaydet
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    sessionStorage.setItem('stockAnalysisSelectedItems', JSON.stringify(Array.from(selectedItems)))
  }, [selectedItems, isHydrated])

  const handleSelectAll = useCallback((checked: boolean, allIds: string[]) => {
    if (checked) {
      setSelectedItems(new Set(allIds))
    } else {
      setSelectedItems(new Set())
    }
  }, [])

  const handleSelectItem = useCallback((stokKodu: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(stokKodu)
      } else {
        newSet.delete(stokKodu)
      }
      return newSet
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  return {
    selectedItems,
    setSelectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    isHydrated
  }
}