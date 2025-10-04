'use client'

import { useMemo } from 'react'
import { StokAnalizRaporu } from '@/types'
import { StockStatus } from '@/components/filters/multi-status-filter'
import { QuantityRange } from '@/components/filters/advanced-quantity-filter'
import { MovementStatus } from '@/components/filters/multi-movement-filter'
import { TurnoverSpeed } from '@/components/filters/multi-turnover-filter'
import { OrderSuggestionType } from '@/components/filters/multi-order-suggestion-filter'
import { SortConfig } from './useStockSorting'

interface UseStockDataProcessingParams {
  data: StokAnalizRaporu[]
  selectedMainGroups: string[]
  selectedSubgroups: string[]
  statusFilter: StockStatus[]
  quantityFilter: QuantityRange[]
  movementFilter: MovementStatus[]
  turnoverFilter: TurnoverSpeed[]
  orderSuggestionFilter: OrderSuggestionType[]
  sortConfig: SortConfig
  debouncedSearchTerm: string
}

interface UseStockDataProcessingReturn {
  availableMainGroups: string[]
  availableSubgroups: string[]
  filteredData: StokAnalizRaporu[]
  sortedData: StokAnalizRaporu[]
  searchFilteredData: StokAnalizRaporu[]
}

export function useStockDataProcessing({
  data,
  selectedMainGroups,
  selectedSubgroups,
  statusFilter,
  quantityFilter,
  movementFilter,
  turnoverFilter,
  orderSuggestionFilter,
  sortConfig,
  debouncedSearchTerm
}: UseStockDataProcessingParams): UseStockDataProcessingReturn {
  
  // Mevcut ana grupları bul
  const availableMainGroups = useMemo(() => {
    const mainGroupSet = new Set<string>()
    data.forEach(item => {
      if (item.anaGrup) {
        mainGroupSet.add(item.anaGrup)
      }
    })
    return Array.from(mainGroupSet).sort()
  }, [data])

  // Mevcut alt grupları bul
  const availableSubgroups = useMemo(() => {
    const subgroupSet = new Set<string>()
    data.forEach(item => {
      if (item.altGrup) {
        subgroupSet.add(item.altGrup)
      }
    })
    return Array.from(subgroupSet).sort()
  }, [data])

  // ADIM 1: Ana grup filtrele
  const mainGroupFiltered = useMemo(() => {
    if (selectedMainGroups.includes('__NONE__')) {
      return []
    }
    if (selectedMainGroups.length === 0) {
      return data
    }
    return data.filter(item => 
      item.anaGrup && selectedMainGroups.includes(item.anaGrup)
    )
  }, [data, selectedMainGroups])

  // ADIM 2: Alt grup filtrele
  const subgroupFiltered = useMemo(() => {
    if (selectedSubgroups.includes('__NONE__')) {
      return []
    }
    if (selectedSubgroups.length === 0) {
      return mainGroupFiltered
    }
    return mainGroupFiltered.filter(item => 
      item.altGrup && selectedSubgroups.includes(item.altGrup)
    )
  }, [mainGroupFiltered, selectedSubgroups])

  // ADIM 3: Status filtrele
  const statusFiltered = useMemo(() => {
    if (statusFilter.length === 0) {
      return subgroupFiltered
    }
    return subgroupFiltered.filter(item => {
      const value = item.ortalamaAylikStok
      return statusFilter.some(status => {
        switch (status) {
          case 'critical': return value <= 1
          case 'low': return value > 1 && value <= 2
          case 'sufficient': return value > 2
          default: return false
        }
      })
    })
  }, [subgroupFiltered, statusFilter])

  // ADIM 4: Quantity filtrele
  const quantityFiltered = useMemo(() => {
    if (quantityFilter.length === 0) {
      return statusFiltered
    }
    return statusFiltered.filter(item => {
      const miktar = item.kalanMiktar
      return quantityFilter.some(range => {
        switch (range) {
          case '0-50': return miktar >= 0 && miktar <= 50
          case '50-100': return miktar > 50 && miktar <= 100
          case '100-500': return miktar > 100 && miktar <= 500
          case '500-1000': return miktar > 500 && miktar <= 1000
          case '1000-5000': return miktar > 1000 && miktar <= 5000
          case '5000+': return miktar > 5000
          default: return false
        }
      })
    })
  }, [statusFiltered, quantityFilter])

  // ADIM 5: Movement filtrele
  const movementFiltered = useMemo(() => {
    if (!Array.isArray(movementFilter) || movementFilter.length === 0) {
      return quantityFiltered
    }
    return quantityFiltered.filter(item => {
      return movementFilter.some(status => {
        switch (status) {
          case 'active': return item.hareketDurumu === 'Aktif'
          case 'slow': return item.hareketDurumu === 'Yavaş'
          case 'stagnant': return item.hareketDurumu === 'Durgun'
          case 'dead': return item.hareketDurumu === 'Ölü Stok'
          default: return false
        }
      })
    })
  }, [quantityFiltered, movementFilter])

  // ADIM 6: Turnover filtrele
  const turnoverFiltered = useMemo(() => {
    if (!Array.isArray(turnoverFilter) || turnoverFilter.length === 0) {
      return movementFiltered
    }
    return movementFiltered.filter(item => {
      const devir = item.devirHiziGun
      return turnoverFilter.some(speed => {
        switch (speed) {
          case 'fast': return devir > 0 && devir <= 15
          case 'normal': return devir > 15 && devir <= 30
          case 'slow': return devir > 30 && devir <= 60
          case 'very-slow': return devir > 60
          default: return false
        }
      })
    })
  }, [movementFiltered, turnoverFilter])

  // ADIM 7: Order suggestion filtrele (FINAL)
  const filteredData = useMemo(() => {
    if (!Array.isArray(orderSuggestionFilter) || orderSuggestionFilter.length === 0) {
      return turnoverFiltered
    }
    return turnoverFiltered.filter(item => {
      const suggestedQty = item.onerilenSiparis
      const orderReason = item.siparisNedeni || ''
      const monthlyStock = item.ortalamaAylikStok
      const movementStatus = item.hareketDurumu
      const pendingOrders = item.verilenSiparis || 0

      return orderSuggestionFilter.some(type => {
        switch (type) {
          case 'ordered':
            return pendingOrders > 0 && (suggestedQty == null || suggestedQty <= 0)
          case 'partial':
            return pendingOrders > 0 && suggestedQty != null && suggestedQty > 0
          case 'urgent':
            return pendingOrders === 0 && suggestedQty != null && suggestedQty > 0 && monthlyStock < 0.5 && movementStatus === 'Aktif'
          case 'critical':
            return pendingOrders === 0 && suggestedQty != null && suggestedQty > 0 && 
                   !((monthlyStock < 0.5 && movementStatus === 'Aktif')) &&
                   !((movementStatus === 'Durgun' || movementStatus === 'Yavaş'))
          case 'low-priority':
            return pendingOrders === 0 && suggestedQty != null && suggestedQty > 0 && (movementStatus === 'Durgun' || movementStatus === 'Yavaş')
          case 'sufficient':
            return pendingOrders === 0 && (suggestedQty == null || suggestedQty === 0) && 
                   !orderReason.includes('Durgun ürün') && 
                   !orderReason.includes('Ölü stok') && 
                   !orderReason.includes('Özel sipariş') && 
                   !orderReason.includes('Talep') && 
                   !orderReason.includes('Tek seferlik') &&
                   movementStatus !== 'Ölü Stok' &&
                   movementStatus !== 'Durgun'
          case 'none':
            return pendingOrders === 0 && (suggestedQty == null || suggestedQty === 0) && (
              orderReason.includes('Durgun ürün') || 
              orderReason.includes('Ölü stok') || 
              orderReason.includes('Özel sipariş') || 
              orderReason.includes('Talep') || 
              orderReason.includes('Tek seferlik') ||
              movementStatus === 'Ölü Stok' ||
              movementStatus === 'Durgun'
            )
          default:
            return false
        }
      })
    })
  }, [turnoverFiltered, orderSuggestionFilter])

  // Sırala
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue, 'tr-TR')
          : bValue.localeCompare(aValue, 'tr-TR')
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue
      }

      return 0
    })

    return sorted
  }, [filteredData, sortConfig])

  // Ara
  const searchFilteredData = useMemo(() => {
    if (!debouncedSearchTerm) return sortedData

    const searchTerm = debouncedSearchTerm.trim()
    if (!searchTerm) return sortedData

    const parseSearchTerms = (term: string): Array<{type: 'exact' | 'word' | 'wildcard' | 'equals', value: string}> => {
      const terms: Array<{type: 'exact' | 'word' | 'wildcard' | 'equals', value: string}> = []
      const exactMatches = term.match(/"([^"]+)"/g) || []
      let remainingTerm = term
      
      exactMatches.forEach(match => {
        const cleanMatch = match.replace(/"/g, '')
        terms.push({ type: 'exact', value: cleanMatch.toLocaleLowerCase('tr-TR') })
        remainingTerm = remainingTerm.replace(match, ' ')
      })
      
      const words = remainingTerm.split(/\s+/).filter(w => w.length > 0)
      
      words.forEach(word => {
        if (word.startsWith('=')) {
          const cleanWord = word.substring(1).toLocaleLowerCase('tr-TR')
          if (cleanWord) {
            terms.push({ type: 'equals', value: cleanWord })
          }
        } else if (word.includes('*')) {
          terms.push({ type: 'wildcard', value: word.toLocaleLowerCase('tr-TR') })
        } else {
          terms.push({ type: 'word', value: word.toLocaleLowerCase('tr-TR') })
        }
      })
      
      return terms
    }

    const searchTerms = parseSearchTerms(searchTerm)
    
    return sortedData.filter(item => {
      const stokKodu = item.stokKodu ? item.stokKodu.toLocaleLowerCase('tr-TR') : ''
      const stokIsmi = item.stokIsmi ? item.stokIsmi.toLocaleLowerCase('tr-TR') : ''
      const searchText = `${stokKodu} ${stokIsmi}`
      
      return searchTerms.every(term => {
        switch (term.type) {
          case 'exact':
            return searchText.includes(term.value)
          case 'equals':
            const wordBoundaryPattern = `(^|\\s)${term.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`
            const equalsRegex = new RegExp(wordBoundaryPattern)
            return equalsRegex.test(searchText)
          case 'wildcard':
            const regexPattern = term.value
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .replace(/\\\*/g, '.*')
            const regex = new RegExp(regexPattern)
            return regex.test(searchText)
          case 'word':
            return searchText.includes(term.value)
          default:
            return false
        }
      })
    })
  }, [sortedData, debouncedSearchTerm])

  return {
    availableMainGroups,
    availableSubgroups,
    filteredData,
    sortedData,
    searchFilteredData
  }
}