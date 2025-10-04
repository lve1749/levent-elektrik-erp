'use client'

import { useState, useEffect } from 'react'

interface UseStockSearchReturn {
  tableSearchTerm: string
  setTableSearchTerm: (value: string) => void
  debouncedSearchTerm: string
  isSearching: boolean
  isHydrated: boolean
}

export function useStockSearch(): UseStockSearchReturn {
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // SessionStorage'dan yükle
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedSearchTerm = sessionStorage.getItem('stockAnalysisSearchTerm')
    if (storedSearchTerm) {
      try {
        const parsed = JSON.parse(storedSearchTerm)
        setTableSearchTerm(parsed)
        setDebouncedSearchTerm(parsed)
      } catch {}
    }

    setIsHydrated(true)
  }, [])

  // Debounce logic
  useEffect(() => {
    if (tableSearchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(tableSearchTerm)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [tableSearchTerm])

  // SessionStorage'a kaydet
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    sessionStorage.setItem('stockAnalysisSearchTerm', JSON.stringify(tableSearchTerm))
  }, [tableSearchTerm, isHydrated])

  return {
    tableSearchTerm,
    setTableSearchTerm,
    debouncedSearchTerm,
    isSearching,
    isHydrated
  }
}