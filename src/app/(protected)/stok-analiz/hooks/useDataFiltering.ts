'use client'

import { useMemo } from 'react'
import { StokAnalizRaporu } from '@/types'
import { StockStatus } from '@/components/filters/multi-status-filter'
import { QuantityRange } from '@/components/filters/advanced-quantity-filter'
import { MovementStatus } from '@/components/filters/multi-movement-filter'
import { TurnoverSpeed } from '@/components/filters/multi-turnover-filter'
import { OrderSuggestionType } from '@/components/filters/multi-order-suggestion-filter'

interface UseDataFilteringProps {
  data: StokAnalizRaporu[]
  statusFilter: StockStatus[]
  quantityFilter: QuantityRange[]
  movementFilter: MovementStatus[]
  turnoverFilter: TurnoverSpeed[]
  orderSuggestionFilter: OrderSuggestionType[]
  selectedSubgroups: string[]
  selectedMainGroups: string[]
  tableSearchTerm: string
  sortConfig: {
    key: string | null
    direction: 'asc' | 'desc'
  }
}

interface UseDataFilteringReturn {
  filteredData: StokAnalizRaporu[]
  sortedAndFilteredData: StokAnalizRaporu[]
  availableMainGroups: string[]
  availableSubgroups: string[]
}

export function useDataFiltering({
  data,
  statusFilter,
  quantityFilter,
  movementFilter,
  turnoverFilter,
  orderSuggestionFilter,
  selectedSubgroups,
  selectedMainGroups,
  tableSearchTerm,
  sortConfig
}: UseDataFilteringProps): UseDataFilteringReturn {
  // Mevcut verideki benzersiz ana grupları bul
  const availableMainGroups = useMemo(() => {
    const mainGroupSet = new Set<string>()
    data.forEach(item => {
      if (item.anaGrup) {
        mainGroupSet.add(item.anaGrup)
      }
    })
    return Array.from(mainGroupSet).sort()
  }, [data])

  // Mevcut verideki benzersiz alt grupları bul
  const availableSubgroups = useMemo(() => {
    const subgroupSet = new Set<string>()
    data.forEach(item => {
      if (item.altGrup) {
        subgroupSet.add(item.altGrup)
      }
    })
    return Array.from(subgroupSet).sort()
  }, [data])

  // Durum filtresine göre verileri filtrele
  const filteredData = useMemo(() => {
    let filtered = [...data]
    
    // Ana Grup Filtresi
    if (selectedMainGroups.includes('__NONE__')) {
      filtered = []
    } else if (selectedMainGroups.length > 0) {
      filtered = filtered.filter(item => 
        item.anaGrup && selectedMainGroups.includes(item.anaGrup)
      )
    }
    
    // Alt Grup Filtresi  
    if (selectedSubgroups.includes('__NONE__')) {
      filtered = []
    } else if (selectedSubgroups.length > 0) {
      filtered = filtered.filter(item => 
        item.altGrup && selectedSubgroups.includes(item.altGrup)
      )
    }
    
    // Status Filter - Multiselect
    if (statusFilter.length > 0) {
      filtered = filtered.filter(item => {
        const value = item.ortalamaAylikStok
        return statusFilter.some(status => {
          switch (status) {
            case 'critical':
              return value <= 1
            case 'low':
              return value > 1 && value <= 2
            case 'normal':
              return value > 2 && value <= 3
            case 'sufficient':
              return value > 3
            default:
              return false
          }
        })
      })
    }
    
    // Quantity Filter - Multiselect
    if (quantityFilter.length > 0) {
      filtered = filtered.filter(item => {
        const value = item.mevcutStok
        return quantityFilter.some(range => {
          switch (range) {
            case 'zero':
              return value === 0
            case 'veryLow':
              return value > 0 && value <= 10
            case 'low':
              return value > 10 && value <= 50
            case 'medium':
              return value > 50 && value <= 100
            case 'high':
              return value > 100 && value <= 500
            case 'veryHigh':
              return value > 500
            default:
              return false
          }
        })
      })
    }
    
    // Movement Filter - Multiselect
    if (movementFilter.length > 0) {
      filtered = filtered.filter(item => {
        const hasInput = item.girisMiktari > 0
        const hasOutput = item.cikisMiktari > 0
        
        return movementFilter.some(status => {
          switch (status) {
            case 'active':
              return hasInput && hasOutput
            case 'onlyInput':
              return hasInput && !hasOutput
            case 'onlyOutput':
              return !hasInput && hasOutput
            case 'inactive':
              return !hasInput && !hasOutput
            default:
              return false
          }
        })
      })
    }
    
    // Turnover Filter - Multiselect
    if (turnoverFilter.length > 0) {
      filtered = filtered.filter(item => {
        const rate = item.devir || 0
        return turnoverFilter.some(speed => {
          switch (speed) {
            case 'verySlow':
              return rate < 0.5
            case 'slow':
              return rate >= 0.5 && rate < 1
            case 'normal':
              return rate >= 1 && rate < 2
            case 'fast':
              return rate >= 2 && rate < 4
            case 'veryFast':
              return rate >= 4
            default:
              return false
          }
        })
      })
    }
    
    // Order Suggestion Filter - Multiselect
    if (orderSuggestionFilter.length > 0) {
      filtered = filtered.filter(item => {
        const suggestion = item.onerilenSiparisMiktari
        const avgMonthly = item.ortalamaAylikStok
        
        return orderSuggestionFilter.some(type => {
          switch (type) {
            case 'urgent':
              return suggestion > 0 && avgMonthly < 1
            case 'required':
              return suggestion > 0 && avgMonthly >= 1 && avgMonthly < 2
            case 'suggested':
              return suggestion > 0 && avgMonthly >= 2
            case 'notRequired':
              return suggestion === 0
            default:
              return false
          }
        })
      })
    }
    
    return filtered
  }, [data, statusFilter, quantityFilter, movementFilter, turnoverFilter, 
      orderSuggestionFilter, selectedSubgroups, selectedMainGroups])

  // Sıralama ve arama filtreleme
  const sortedAndFilteredData = useMemo(() => {
    let sorted = [...filteredData]
    
    // Sıralama
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof StokAnalizRaporu]
        const bVal = b[sortConfig.key as keyof StokAnalizRaporu]
        
        // Null/undefined kontrolleri
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        // Sayısal karşılaştırma
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        // String karşılaştırma
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr, 'tr-TR')
        } else {
          return bStr.localeCompare(aStr, 'tr-TR')
        }
      })
    }
    
    // Arama filtreleme
    if (tableSearchTerm) {
      const search = tableSearchTerm.toLowerCase()
      sorted = sorted.filter(item => 
        item.stokKodu.toLowerCase().includes(search) ||
        item.stokIsmi.toLowerCase().includes(search)
      )
    }
    
    return sorted
  }, [filteredData, sortConfig, tableSearchTerm])

  return {
    filteredData,
    sortedAndFilteredData,
    availableMainGroups,
    availableSubgroups
  }
}