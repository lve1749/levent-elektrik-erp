'use client'

import { safeSessionStorage } from '@/lib/safe-storage'
import { useState, useEffect, useCallback } from 'react'
import { StockStatus } from '@/components/filters/multi-status-filter'
import { QuantityRange } from '@/components/filters/advanced-quantity-filter'
import { MovementStatus } from '@/components/filters/multi-movement-filter'
import { TurnoverSpeed } from '@/components/filters/multi-turnover-filter'
import { OrderSuggestionType } from '@/components/filters/multi-order-suggestion-filter'

interface UseStockFiltersReturn {
  statusFilter: StockStatus[]
  setStatusFilter: (value: StockStatus[]) => void
  quantityFilter: QuantityRange[]
  setQuantityFilter: (value: QuantityRange[]) => void
  movementFilter: MovementStatus[]
  setMovementFilter: (value: MovementStatus[]) => void
  turnoverFilter: TurnoverSpeed[]
  setTurnoverFilter: (value: TurnoverSpeed[]) => void
  orderSuggestionFilter: OrderSuggestionType[]
  setOrderSuggestionFilter: (value: OrderSuggestionType[]) => void
  selectedSubgroups: string[]
  setSelectedSubgroups: (value: string[]) => void
  selectedMainGroups: string[]
  setSelectedMainGroups: (value: string[]) => void
  clearAllFilters: () => void
  isHydrated: boolean
}

export function useStockFilters(): UseStockFiltersReturn {
  const [statusFilter, setStatusFilter] = useState<StockStatus[]>([])
  const [quantityFilter, setQuantityFilter] = useState<QuantityRange[]>([])
  const [movementFilter, setMovementFilter] = useState<MovementStatus[]>([])
  const [turnoverFilter, setTurnoverFilter] = useState<TurnoverSpeed[]>([])
  const [orderSuggestionFilter, setOrderSuggestionFilter] = useState<OrderSuggestionType[]>([])
  const [selectedSubgroups, setSelectedSubgroups] = useState<string[]>([])
  const [selectedMainGroups, setSelectedMainGroups] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // SessionStorage'dan yükle
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedStatusFilter = safeSessionStorage.getItem<StockStatus[]>('stockAnalysisStatusFilter', [])
    if (storedStatusFilter.length > 0) {
      setStatusFilter(storedStatusFilter)
    }

    const storedQuantityFilter = safeSessionStorage.getItem<QuantityRange[]>('stockAnalysisQuantityFilter', [])
    if (storedQuantityFilter.length > 0) {
      setQuantityFilter(storedQuantityFilter)
    }

    const storedMovementFilter = safeSessionStorage.getItem<MovementStatus[] | string>('stockAnalysisMovementFilter', [])
    if (typeof storedMovementFilter === 'string') {
      setMovementFilter(storedMovementFilter === 'all' ? [] : [storedMovementFilter as MovementStatus])
    } else if (Array.isArray(storedMovementFilter) && storedMovementFilter.length > 0) {
      setMovementFilter(storedMovementFilter)
    }

    const storedTurnoverFilter = safeSessionStorage.getItem<TurnoverSpeed[]>('stockAnalysisTurnoverFilter', [])
    if (storedTurnoverFilter.length > 0) {
      setTurnoverFilter(storedTurnoverFilter)
    }

    const storedOrderSuggestionFilter = safeSessionStorage.getItem<OrderSuggestionType[]>('stockAnalysisOrderSuggestionFilter', [])
    if (storedOrderSuggestionFilter.length > 0) {
      setOrderSuggestionFilter(storedOrderSuggestionFilter)
    }

    const storedSubgroups = safeSessionStorage.getItem<string[]>('stockAnalysisSubgroups', [])
    if (storedSubgroups.length > 0) {
      setSelectedSubgroups(storedSubgroups)
    }

    const storedMainGroups = safeSessionStorage.getItem<string[]>('stockAnalysisMainGroups', [])
    if (storedMainGroups.length > 0) {
      setSelectedMainGroups(storedMainGroups)
    }

    setIsHydrated(true)
  }, [])

  // SessionStorage'a kaydet
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisStatusFilter', statusFilter)
  }, [statusFilter, isHydrated])

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisQuantityFilter', quantityFilter)
  }, [quantityFilter, isHydrated])

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisMovementFilter', movementFilter)
  }, [movementFilter, isHydrated])

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisTurnoverFilter', turnoverFilter)
  }, [turnoverFilter, isHydrated])

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisOrderSuggestionFilter', orderSuggestionFilter)
  }, [orderSuggestionFilter, isHydrated])

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisSubgroups', selectedSubgroups)
  }, [selectedSubgroups, isHydrated])

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    safeSessionStorage.setItem('stockAnalysisMainGroups', selectedMainGroups)
  }, [selectedMainGroups, isHydrated])

  const clearAllFilters = useCallback(() => {
    setStatusFilter([])
    setQuantityFilter([])
    setMovementFilter([])
    setTurnoverFilter([])
    setOrderSuggestionFilter([])
    setSelectedSubgroups([])
    setSelectedMainGroups([])
  }, [])

  return {
    statusFilter,
    setStatusFilter,
    quantityFilter,
    setQuantityFilter,
    movementFilter,
    setMovementFilter,
    turnoverFilter,
    setTurnoverFilter,
    orderSuggestionFilter,
    setOrderSuggestionFilter,
    selectedSubgroups,
    setSelectedSubgroups,
    selectedMainGroups,
    setSelectedMainGroups,
    clearAllFilters,
    isHydrated
  }
}