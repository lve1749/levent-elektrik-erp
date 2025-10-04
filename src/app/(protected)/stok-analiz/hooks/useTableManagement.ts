'use client'

import { safeLocalStorage } from '@/lib/safe-storage'
import { useState, useEffect, useCallback } from 'react'
import { TableColumn } from '@/components/filters/column-filter'

interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}

interface UseTableManagementReturn {
  tableSearchTerm: string
  setTableSearchTerm: (value: string) => void
  selectedItems: Set<string>
  setSelectedItems: (value: Set<string>) => void
  sortConfig: SortConfig
  setSortConfig: (value: SortConfig) => void
  visibleColumns: TableColumn[]
  setVisibleColumns: (value: TableColumn[]) => void
  columns: TableColumn[] // Add columns to interface
  currentPage: number
  setCurrentPage: (value: number) => void
  rowsPerPage: number
  setRowsPerPage: (value: number) => void
  handleSort: (key: string) => void
  handleSelectAll: (checked: boolean, allIds: string[]) => void
  handleSelectItem: (id: string) => void
  clearSelection: () => void
}

// Varsayılan kolonlar
const defaultColumns: TableColumn[] = [
  { key: 'checkbox', label: '', visible: true },
  { key: 'stokKodu', label: 'Stok Kodu', visible: true },
  { key: 'stokIsmi', label: 'Stok İsmi', visible: true },
  { key: 'anaGrup', label: 'Ana Grup', visible: true },
  { key: 'altGrup', label: 'Alt Grup', visible: true },
  { key: 'depo', label: 'Depo', visible: false },
  { key: 'girisMiktari', label: 'Giriş Miktarı', visible: true },
  { key: 'cikisMiktari', label: 'Çıkış Miktarı', visible: true },
  { key: 'kalanMiktar', label: 'Kalan Miktar', visible: true },
  { key: 'verilenSiparis', label: 'Verilen Sipariş', visible: true },
  { key: 'alinanSiparis', label: 'Alınan Sipariş', visible: true },
  { key: 'stokBekleyen', label: 'Stok + Bekleyen', visible: false },
  { key: 'toplamEksik', label: 'Toplam Eksik', visible: false },
  { key: 'aylikOrtalamaSatis', label: 'Aylık Ort. Satış', visible: true },
  { key: 'ortalamaAylikStok', label: 'Ort. Aylık Stok', visible: true },
  { key: 'onerilenSiparis', label: 'Önerilen Sipariş', visible: true },
  { key: 'hareketDurumu', label: 'Hareket Durumu', visible: true },
  { key: 'devirHiziGun', label: 'Devir Hızı', visible: true },
  { key: 'mevsimselPattern', label: 'Mevsimsellik', visible: true },
  { key: 'islemler', label: 'İşlemler', visible: true }
]

export function useTableManagement(): UseTableManagementReturn {
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [visibleColumns, setVisibleColumns] = useState<TableColumn[]>(defaultColumns)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // LocalStorage'dan kolon görünürlüğünü yükle
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedColumns = safeLocalStorage.getItem<TableColumn[]>('stockAnalysisVisibleColumns', null)
    if (storedColumns !== null) {
      // VALIDATION: Tüm key'lerin columnMap'te olup olmadığını kontrol et
      const validKeys = new Set([
        'checkbox', 'stokKodu', 'stokIsmi', 'anaGrup', 'altGrup', 'depo',
        'girisMiktari', 'cikisMiktari', 'kalanMiktar', 'verilenSiparis',
        'alinanSiparis', 'stokBekleyen', 'toplamEksik', 'aylikOrtalamaSatis',
        'ortalamaAylikStok', 'onerilenSiparis', 'hareketDurumu', 'devirHiziGun',
        'mevsimselPattern', 'islemler'
      ])
      
      const hasInvalidKeys = storedColumns.some((col: any) => !validKeys.has(col.key))
      
      if (hasInvalidKeys) {
        console.warn('Old column format detected, resetting to defaults')
        safeLocalStorage.removeItem('stockAnalysisVisibleColumns')
        setVisibleColumns(defaultColumns)
      } else {
        setVisibleColumns(storedColumns)
      }
    } else {
      setVisibleColumns(defaultColumns)
    }

    const storedRowsPerPage = safeLocalStorage.getItem<number>('stockAnalysisRowsPerPage', 50)
    if (storedRowsPerPage !== 50) {
      setRowsPerPage(storedRowsPerPage)
    }
  }, [])

  // Kolon görünürlüğünü LocalStorage'a kaydet
  useEffect(() => {
    if (typeof window === 'undefined') return
    safeLocalStorage.setItem('stockAnalysisVisibleColumns', visibleColumns)
  }, [visibleColumns])

  // Sayfa başına satır sayısını LocalStorage'a kaydet
  useEffect(() => {
    if (typeof window === 'undefined') return
    safeLocalStorage.setItem('stockAnalysisRowsPerPage', rowsPerPage)
  }, [rowsPerPage])

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const handleSelectAll = useCallback((checked: boolean, allIds: string[]) => {
    if (checked) {
      setSelectedItems(new Set(allIds))
    } else {
      setSelectedItems(new Set())
    }
  }, [])

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  return {
    tableSearchTerm,
    setTableSearchTerm,
    selectedItems,
    setSelectedItems,
    sortConfig,
    setSortConfig,
    visibleColumns,
    setVisibleColumns,
    columns: visibleColumns, // Add columns as alias for visibleColumns
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    handleSort,
    handleSelectAll,
    handleSelectItem,
    clearSelection
  }
}