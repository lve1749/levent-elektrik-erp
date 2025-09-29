'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { AnalizFiltre, StokAnalizRaporu } from '@/types'
import { useStockAnalysis } from '@/hooks/use-stock-analysis'
import { useGroups } from '@/hooks/use-groups'
import { useStockAlerts } from '@/hooks/use-stock-alerts'
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper'
import Header from '@/components/layout/header'
import FilterBar from '@/components/filters/filter-bar'
import MultiStatusFilter, { StockStatus } from '@/components/filters/multi-status-filter'
import AdvancedQuantityFilter, { QuantityRange } from '@/components/filters/advanced-quantity-filter'
import MultiMovementFilter, { MovementStatus } from '@/components/filters/multi-movement-filter'
import MultiTurnoverFilter, { TurnoverSpeed } from '@/components/filters/multi-turnover-filter'
import MultiOrderSuggestionFilter, { OrderSuggestionType } from '@/components/filters/multi-order-suggestion-filter'
import ColumnFilter, { TableColumn } from '@/components/filters/column-filter'
import SubgroupFilter from '@/components/filters/subgroup-filter'
import MainGroupFilter from '@/components/filters/maingroup-filter'
// import SummaryCards from '@/components/analytics/summary-cards' // TODO: Removed temporarily
import StockAnalysisTable from '@/components/analytics/stock-analysis-table'
import ExportButton from '@/components/analytics/export-button'
import LoadingSpinner from '@/components/ui/loading-spinner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, Package, Search, X, Layers, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateForSQL, getMonthsFromYearStart } from '@/lib/formatters'
import StockAlertPopover from '@/components/alerts/stock-alert-popover'
import AddToListModal from '@/components/lists/add-to-list-modal'
import { useLists } from '@/hooks/use-lists'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tablo kolonları tanımı
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

// Sıralama tipi
export type SortConfig = {
  key: keyof StokAnalizRaporu | null
  direction: 'asc' | 'desc'
}

export default function Home() {
  const currentYear = 2025
  
  // Default değerler
  const defaultFilters = {
    baslangicTarihi: new Date(currentYear, 0, 1),
    bitisTarihi: new Date(currentYear, 11, 31),
    anaGrupKodu: null,
    aySayisi: getMonthsFromYearStart()
  }
  
  const [filters, setFilters] = useState<AnalizFiltre>(defaultFilters)
  const [columns, setColumns] = useState<TableColumn[]>(defaultColumns)
  const [statusFilter, setStatusFilter] = useState<StockStatus[]>([])
  const [quantityFilter, setQuantityFilter] = useState<QuantityRange[]>([])
  const [movementFilter, setMovementFilter] = useState<MovementStatus[]>([])
  const [turnoverFilter, setTurnoverFilter] = useState<TurnoverSpeed[]>([])
  const [orderSuggestionFilter, setOrderSuggestionFilter] = useState<OrderSuggestionType[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedSubgroups, setSelectedSubgroups] = useState<string[]>([])
  const [selectedMainGroups, setSelectedMainGroups] = useState<string[]>([])
  const [showListModal, setShowListModal] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Refresh state'leri
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshHistory, setRefreshHistory] = useState<Array<{ time: Date; success: boolean; groupName?: string }>>([])
  
  // Kıyaslama state'leri
  const [compareMode, setCompareMode] = useState<'week' | 'month'>('week')
  const [previousPeriodData, setPreviousPeriodData] = useState<StokAnalizRaporu[]>([])
  const [loadingPreviousData, setLoadingPreviousData] = useState(false)
  
  const { data, loading, error, refetch, cleanup } = useStockAnalysis(filters)
  const { groups } = useGroups()
  const { lists, folders, createList, addItemsToList } = useLists()
  
  // Uyarı sistemi hook'u
  const {
    alerts,
    readAlerts,
    stats: alertStats,
    markAsRead,
    dismissAlert,
    markAllAsRead,
    addNote,
    deleteNote
  } = useStockAlerts(data)

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

    return { currentStart, currentEnd, previousStart, previousEnd }
  }, [])

  // Önceki dönem verilerini çekme fonksiyonu
  const fetchPreviousPeriodData = useCallback(async (mode: 'week' | 'month', currentProductCodes?: string[]) => {
    setLoadingPreviousData(true)
    
    try {
      const { previousStart, previousEnd } = calculateCompareDates(mode)
      
      // Ay sayısını hesapla
      const aySayisi = mode === 'week' ? 0.25 : 1 // Hafta için ~0.25 ay, ay için 1 ay
      
      const params = new URLSearchParams({
        baslangicTarih: formatDateForSQL(previousStart),
        bitisTarih: formatDateForSQL(previousEnd),
        aySayisi: aySayisi.toString(),
        ...(filters.anaGrupKodu && { anaGrup: filters.anaGrupKodu })
      })

      const response = await fetch(`/api/stok-analiz?${params}`)
      
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
  }, [calculateCompareDates, filters.anaGrupKodu])

  // Kıyaslama modu değişim handler'ı
  const handleCompareChange = (mode: 'week' | 'month') => {
    setCompareMode(mode)
  }

  // Refresh fonksiyonu
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    
    // Yenileme yapılıyor - filtreleri ve seçimleri sıfırla
    setStatusFilter([])
    setQuantityFilter([])
    setMovementFilter([])
    setTurnoverFilter([])
    setOrderSuggestionFilter([])
    setTableSearchTerm('')
    setSelectedItems(new Set())
    setSelectedSubgroups([])
    setSelectedMainGroups([])
    setSortConfig({ key: null, direction: 'asc' })
    
    const result = await refetch()
    const now = new Date()
    
    if (result && result.success) {
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
      
      // Başarılı güncellemeyi geçmişe ekle
      setRefreshHistory(prev => {
        // Ana grup adını al
        const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
        const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
        
        const newHistory = [
          { time: now, success: true, groupName },
          ...prev.slice(0, 4)
        ]
        localStorage.setItem('refreshHistory', JSON.stringify(newHistory))
        return newHistory
      })
      
      // Toast bildirimi
      const dataCount = result.data?.length || 0
      toast.success('Veriler güncellendi', {
        description: dataCount > 0 ? `${dataCount} kayıt başarıyla yenilendi` : 'Veriler başarıyla güncellendi'
      })
    } else {
      // Başarısız güncellemeyi geçmişe ekle
      setRefreshHistory(prev => {
        // Ana grup adını al
        const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
        const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
        
        const newHistory = [
          { time: now, success: false, groupName },
          ...prev.slice(0, 4)
        ]
        localStorage.setItem('refreshHistory', JSON.stringify(newHistory))
        return newHistory
      })
      
      // Hata toast bildirimi
      toast.error('Güncelleme başarısız', {
        description: result?.error || 'Bağlantı hatası oluştu'
      })
    }
    
    setIsRefreshing(false)
  }, [refetch])

  // Uyarı inspect handler - Ürünü tabloda göster
  const handleAlertInspect = useCallback((stokKodu: string, anaGrupKodu?: string) => {
    // 1. Eğer ana grup varsa, filtreyi değiştir
    if (anaGrupKodu && anaGrupKodu !== filters.anaGrupKodu) {
      setFilters(prev => ({ ...prev, anaGrupKodu }))
    }
    
    // 2. Arama kutusuna stok kodunu yaz
    setTableSearchTerm(stokKodu)
    
    // 3. Seçili öğeleri temizle ve bu ürünü seç
    setSelectedItems(new Set([stokKodu]))
    
    // 4. Sayfayı yukarı kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters.anaGrupKodu])

  // Debounce arama terimi - 300ms gecikme ile
  useEffect(() => {
    // Arama başladığında loading göster
    if (tableSearchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(tableSearchTerm)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [tableSearchTerm])

  // Component mount olduktan sonra sessionStorage'dan verileri yükle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Filters
      const storedFilters = sessionStorage.getItem('stockAnalysisFilters')
      if (storedFilters) {
        try {
          const parsed = JSON.parse(storedFilters)
          if (parsed.baslangicTarihi) parsed.baslangicTarihi = new Date(parsed.baslangicTarihi)
          if (parsed.bitisTarihi) parsed.bitisTarihi = new Date(parsed.bitisTarihi)
          setFilters(parsed)
        } catch {}
      }
      
      // Columns
      const storedColumns = sessionStorage.getItem('stockAnalysisColumns')
      if (storedColumns) {
        try {
          setColumns(JSON.parse(storedColumns))
        } catch {}
      }
      
      // Status Filter
      const storedStatusFilter = sessionStorage.getItem('stockAnalysisStatusFilter')
      if (storedStatusFilter) {
        try {
          setStatusFilter(JSON.parse(storedStatusFilter))
        } catch {}
      }
      
      // Quantity Filter
      const storedQuantityFilter = sessionStorage.getItem('stockAnalysisQuantityFilter')
      if (storedQuantityFilter) {
        try {
          setQuantityFilter(JSON.parse(storedQuantityFilter))
        } catch {}
      }
      
      // Movement Filter - Multiselect
      const storedMovementFilter = sessionStorage.getItem('stockAnalysisMovementFilter')
      if (storedMovementFilter) {
        try {
          const parsed = JSON.parse(storedMovementFilter)
          // Handle old single value format
          if (typeof parsed === 'string') {
            setMovementFilter(parsed === 'all' ? [] : [parsed as MovementStatus])
          } else if (Array.isArray(parsed)) {
            setMovementFilter(parsed)
          } else {
            setMovementFilter([])
          }
        } catch {
          setMovementFilter([])
        }
      }
      
      // Turnover Filter
      const storedTurnoverFilter = sessionStorage.getItem('stockAnalysisTurnoverFilter')
      if (storedTurnoverFilter) {
        try {
          setTurnoverFilter(JSON.parse(storedTurnoverFilter))
        } catch {}
      }
      
      // Order Suggestion Filter
      const storedOrderSuggestionFilter = sessionStorage.getItem('stockAnalysisOrderSuggestionFilter')
      if (storedOrderSuggestionFilter) {
        try {
          setOrderSuggestionFilter(JSON.parse(storedOrderSuggestionFilter))
        } catch {}
      }
      
      // Sort Config
      const storedSortConfig = sessionStorage.getItem('stockAnalysisSortConfig')
      if (storedSortConfig) {
        try {
          setSortConfig(JSON.parse(storedSortConfig))
        } catch {}
      }
      
      // Search Term
      const storedSearchTerm = sessionStorage.getItem('stockAnalysisSearchTerm')
      if (storedSearchTerm) {
        try {
          setTableSearchTerm(JSON.parse(storedSearchTerm))
        } catch {}
      }
      
      // Selected Items
      const storedSelectedItems = sessionStorage.getItem('stockAnalysisSelectedItems')
      if (storedSelectedItems) {
        try {
          const parsed = JSON.parse(storedSelectedItems)
          setSelectedItems(new Set(parsed))
        } catch {}
      }
      
      // Subgroups
      const storedSubgroups = sessionStorage.getItem('stockAnalysisSubgroups')
      if (storedSubgroups) {
        try {
          setSelectedSubgroups(JSON.parse(storedSubgroups))
        } catch {}
      }
      
      // Main Groups
      const storedMainGroups = sessionStorage.getItem('stockAnalysisMainGroups')
      if (storedMainGroups) {
        try {
          setSelectedMainGroups(JSON.parse(storedMainGroups))
        } catch {}
      }
      
      setIsHydrated(true)
    }
  }, []) // Sadece mount olduğunda çalışsın

  // State'leri sessionStorage'a kaydet (hydration tamamlandıktan sonra)
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisFilters', JSON.stringify(filters))
    }
  }, [filters, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisColumns', JSON.stringify(columns))
    }
  }, [columns, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisStatusFilter', JSON.stringify(statusFilter))
    }
  }, [statusFilter, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisQuantityFilter', JSON.stringify(quantityFilter))
    }
  }, [quantityFilter, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisMovementFilter', JSON.stringify(movementFilter))
    }
  }, [movementFilter, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisTurnoverFilter', JSON.stringify(turnoverFilter))
    }
  }, [turnoverFilter, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisOrderSuggestionFilter', JSON.stringify(orderSuggestionFilter))
    }
  }, [orderSuggestionFilter, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisSortConfig', JSON.stringify(sortConfig))
    }
  }, [sortConfig, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisSearchTerm', JSON.stringify(tableSearchTerm))
    }
  }, [tableSearchTerm, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisSelectedItems', JSON.stringify(Array.from(selectedItems)))
    }
  }, [selectedItems, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisSubgroups', JSON.stringify(selectedSubgroups))
    }
  }, [selectedSubgroups, isHydrated])

  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('stockAnalysisMainGroups', JSON.stringify(selectedMainGroups))
    }
  }, [selectedMainGroups, isHydrated])

  // İlk yüklemede lastRefreshTime'ı ayarla veya localStorage'dan al
  useEffect(() => {
    // localStorage'dan lastRefreshTime'ı kontrol et
    const stored = localStorage.getItem('lastRefreshTime')
    if (stored) {
      setLastRefreshTime(new Date(stored))
    } else if (data.length > 0) {
      const now = new Date()
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
    }
  }, []) // Sadece component mount olduğunda çalışsın
  
  // İlk yüklemede error kontrolü için - kaldırıldı çünkü çift bildirim yapıyordu
  
  // Data değiştiğinde ve lastRefreshTime yoksa güncelle
  useEffect(() => {
    if (data.length > 0 && !lastRefreshTime) {
      const now = new Date()
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toISOString())
    }
  }, [data.length]) // data.length kullanarak referans değişimini önle

  // Refresh history'yi localStorage'dan yükle (client-side only)
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
      } catch (e) {
        console.error('Refresh history parse error:', e)
      }
    }
  }, [])

  // Seçili grup ismini bul
  const selectedGroupName = useMemo(() => {
    if (!filters.anaGrupKodu || !groups.length) return null
    const group = groups.find(g => g.grupKodu === filters.anaGrupKodu)
    return group?.grupIsmi || filters.anaGrupKodu
  }, [filters.anaGrupKodu, groups])

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
    // __NONE__ değeri varsa hiçbir şey gösterme
    if (selectedMainGroups.includes('__NONE__')) {
      filtered = []
    } else if (selectedMainGroups.length > 0) {
      // Normal filtreleme - seçili olanları göster
      filtered = filtered.filter(item => 
        item.anaGrup && selectedMainGroups.includes(item.anaGrup)
      )
    }
    // Boş array ise tümünü göster (varsayılan)
    
    // Alt Grup Filtresi  
    // __NONE__ değeri varsa hiçbir şey gösterme
    if (selectedSubgroups.includes('__NONE__')) {
      filtered = []
    } else if (selectedSubgroups.length > 0) {
      // Normal filtreleme - seçili olanları göster
      filtered = filtered.filter(item => 
        item.altGrup && selectedSubgroups.includes(item.altGrup)
      )
    }
    // Boş array ise tümünü göster (varsayılan)
    
    // Status Filter - Multiselect
    if (statusFilter.length > 0) {
      filtered = filtered.filter(item => {
        const value = item.ortalamaAylikStok
        // En az bir seçili durumla eşleşmeli (OR mantığı)
        return statusFilter.some(status => {
          switch (status) {
            case 'critical':
              return value <= 1
            case 'low':
              return value > 1 && value <= 2
            case 'sufficient':
              return value > 2
            default:
              return false
          }
        })
      })
    }
    
    // Quantity Filter - Multiselect
    if (quantityFilter.length > 0) {
      filtered = filtered.filter(item => {
        const miktar = item.kalanMiktar
        // En az bir seçili aralıkla eşleşmeli (OR mantığı)
        return quantityFilter.some(range => {
          switch (range) {
            case '0-50':
              return miktar >= 0 && miktar <= 50
            case '50-100':
              return miktar > 50 && miktar <= 100
            case '100-500':
              return miktar > 100 && miktar <= 500
            case '500-1000':
              return miktar > 500 && miktar <= 1000
            case '1000-5000':
              return miktar > 1000 && miktar <= 5000
            case '5000+':
              return miktar > 5000
            default:
              return false
          }
        })
      })
    }
    
    // Movement Filter - Multiselect
    if (Array.isArray(movementFilter) && movementFilter.length > 0) {
      filtered = filtered.filter(item => {
        return movementFilter.some(status => {
          switch (status) {
            case 'active':
              return item.hareketDurumu === 'Aktif'
            case 'slow':
              return item.hareketDurumu === 'Yavaş'
            case 'stagnant':
              return item.hareketDurumu === 'Durgun'
            case 'dead':
              return item.hareketDurumu === 'Ölü Stok'
            default:
              return false
          }
        })
      })
    }
    
    // Turnover Filter - Multiselect
    if (Array.isArray(turnoverFilter) && turnoverFilter.length > 0) {
      filtered = filtered.filter(item => {
        const devir = item.devirHiziGun
        return turnoverFilter.some(speed => {
          switch (speed) {
            case 'fast':
              return devir > 0 && devir <= 15
            case 'normal':
              return devir > 15 && devir <= 30
            case 'slow':
              return devir > 30 && devir <= 60
            case 'very-slow':
              return devir > 60
            default:
              return false
          }
        })
      })
    }
    
    // Order Suggestion Filter - Multiselect
    if (Array.isArray(orderSuggestionFilter) && orderSuggestionFilter.length > 0) {
      filtered = filtered.filter(item => {
        const suggestedQty = item.onerilenSiparis
        const orderReason = item.siparisNedeni || ''
        const monthlyStock = item.ortalamaAylikStok
        const movementStatus = item.hareketDurumu
        const pendingOrders = item.verilenSiparis || 0
        const receivedOrders = item.alinanSiparis || 0
        
        return orderSuggestionFilter.some(type => {
          switch (type) {
            case 'ordered':
              // Sipariş verildi: Tedarikçiye sipariş verilmiş ve yeterli durumu
              return pendingOrders > 0 && (suggestedQty == null || suggestedQty <= 0)
              
            case 'partial':
              // Kısmi sipariş: Sipariş verilmiş ama eksik durumu
              return pendingOrders > 0 && suggestedQty != null && suggestedQty > 0
              
            case 'urgent':
              // Acil: Stok tükenme riski var, hemen sipariş verilmeli
              return pendingOrders === 0 && suggestedQty != null && suggestedQty > 0 && monthlyStock < 0.5 && movementStatus === 'Aktif'
              
            case 'critical':
              // Kritik: Stok azalıyor, en kısa sürede sipariş verilmeli
              return pendingOrders === 0 && suggestedQty != null && suggestedQty > 0 && 
                     !((monthlyStock < 0.5 && movementStatus === 'Aktif')) && // Acil değil
                     !((movementStatus === 'Durgun' || movementStatus === 'Yavaş')) // Düşük öncelik değil
              
            case 'low-priority':
              // Düşük öncelik: Durgun veya yavaş hareket eden ürünler
              return pendingOrders === 0 && suggestedQty != null && suggestedQty > 0 && (movementStatus === 'Durgun' || movementStatus === 'Yavaş')
              
            case 'sufficient':
              // Yeterli stok: Mevcut stok ihtiyacı karşılıyor
              return pendingOrders === 0 && (suggestedQty == null || suggestedQty === 0) && 
                     !orderReason.includes('Durgun ürün') && 
                     !orderReason.includes('Ölü stok') && 
                     !orderReason.includes('Özel sipariş') && 
                     !orderReason.includes('Talep') && 
                     !orderReason.includes('Tek seferlik') &&
                     movementStatus !== 'Ölü Stok' &&
                     movementStatus !== 'Durgun'
              
            case 'none':
              // Öneri yok: Ölü stok, durgun ürün, özel sipariş vb.
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
    }
    
    return filtered
  }, [data, selectedMainGroups, selectedSubgroups, statusFilter, quantityFilter, movementFilter, turnoverFilter, orderSuggestionFilter])

  // Sıralanmış verileri hesapla
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

  // Tablo araması için filtreleme - Gelişmiş arama mantığı
  const searchFilteredData = useMemo(() => {
    if (!debouncedSearchTerm) return sortedData

    const searchTerm = debouncedSearchTerm.trim()
    if (!searchTerm) return sortedData

    // Arama terimlerini parse et
    const parseSearchTerms = (term: string): Array<{type: 'exact' | 'word' | 'wildcard' | 'equals', value: string}> => {
      const terms: Array<{type: 'exact' | 'word' | 'wildcard' | 'equals', value: string}> = []
      
      // Tırnak içindeki exact match'leri bul
      const exactMatches = term.match(/"([^"]+)"/g) || []
      let remainingTerm = term
      
      // Exact match'leri işle ve metinden çıkar
      exactMatches.forEach(match => {
        const cleanMatch = match.replace(/"/g, '')
        terms.push({ type: 'exact', value: cleanMatch.toLocaleLowerCase('tr-TR') })
        remainingTerm = remainingTerm.replace(match, ' ')
      })
      
      // Kalan terimleri boşluklardan böl
      const words = remainingTerm.split(/\s+/).filter(w => w.length > 0)
      
      // Her kelimeyi kontrol et
      words.forEach(word => {
        // = ile başlıyorsa tam eşleşme
        if (word.startsWith('=')) {
          const cleanWord = word.substring(1).toLocaleLowerCase('tr-TR')
          if (cleanWord) {
            terms.push({ type: 'equals', value: cleanWord })
          }
        }
        // Wildcard kontrolü (* içeriyor mu?)
        else if (word.includes('*')) {
          terms.push({ type: 'wildcard', value: word.toLocaleLowerCase('tr-TR') })
        }
        // Normal kelime
        else {
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
      
      // Tüm arama terimlerinin eşleşmesi gerekiyor (AND mantığı)
      return searchTerms.every(term => {
        switch (term.type) {
          case 'exact':
            // Tam eşleşme - tırnak içindeki metin aynen geçmeli
            return searchText.includes(term.value)
            
          case 'equals':
            // = ile tam kelime eşleşme - kelime sınırlarında eşleşmeli
            // Kelime sınırı: başında/sonunda boşluk, satır başı/sonu veya başka ayraç olmalı
            const wordBoundaryPattern = `(^|\\s)${term.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`
            const equalsRegex = new RegExp(wordBoundaryPattern)
            return equalsRegex.test(searchText)
            
          case 'wildcard':
            // Wildcard eşleşme - * işaretini regex'e çevir
            const regexPattern = term.value
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Önce tüm regex karakterlerini escape et
              .replace(/\\\*/g, '.*') // Sonra * işaretlerini .* ile değiştir
            const regex = new RegExp(regexPattern)
            return regex.test(searchText)
            
          case 'word':
            // Normal kelime eşleşme
            return searchText.includes(term.value)
            
          default:
            return false
        }
      })
    })
  }, [sortedData, debouncedSearchTerm])

  // Kıyaslama modu değiştiğinde veya filtrelenmiş veri değiştiğinde önceki dönem verilerini çek
  useEffect(() => {
    if (searchFilteredData.length > 0) {
      const productCodes = searchFilteredData.map(item => item.stokKodu)
      fetchPreviousPeriodData(compareMode, productCodes)
    } else {
      setPreviousPeriodData([])
    }
  }, [compareMode, searchFilteredData, fetchPreviousPeriodData])

  // Sıralama işlevi
  const handleSort = (key: keyof StokAnalizRaporu) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Checkbox işlemleri
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(searchFilteredData.map(item => item.stokKodu))
      setSelectedItems(allIds)
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (stokKodu: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(stokKodu)
    } else {
      newSelected.delete(stokKodu)
    }
    setSelectedItems(newSelected)
  }

  const isAllSelected = searchFilteredData.length > 0 && 
    searchFilteredData.every(item => selectedItems.has(item.stokKodu))
  
  const isIndeterminate = searchFilteredData.some(item => selectedItems.has(item.stokKodu)) && 
    !isAllSelected

  // Seçili ürünleri al
  const getSelectedData = () => {
    return searchFilteredData.filter(item => selectedItems.has(item.stokKodu))
  }

  // Component unmount olduğunda cleanup
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <SidebarWrapper
      lastRefreshTime={lastRefreshTime}
      alertCount={alerts.length}
      refreshHistory={refreshHistory}
    >
      <div className="min-h-screen bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]">
        <Header 
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          currentPage="Stok Analiz"
        />
      
      {/* CONTAINER - DAHA GENIŞ - 1920px */}
      <main className="max-w-[1920px] mx-auto px-6 py-4 space-y-4">
        <FilterBar 
          filters={filters} 
          onFiltersChange={setFilters}
          onSearch={async () => {
            // Yeni analiz yapılıyor - filtreleri ve seçimleri sıfırla
            setStatusFilter([])
            setQuantityFilter([])
            setMovementFilter([])
            setTurnoverFilter([])
            setOrderSuggestionFilter([])
            setTableSearchTerm('')
            setSelectedItems(new Set())
            setSelectedSubgroups([])
            setSelectedMainGroups([])
            setSortConfig({ key: null, direction: 'asc' })
            
            const result = await refetch()
            const now = new Date()
            
            if (result && result.success) {
              setLastRefreshTime(now)
              localStorage.setItem('lastRefreshTime', now.toISOString())
              
              // Başarılı güncellemeyi geçmişe ekle
              setRefreshHistory(prev => {
                // Ana grup adını al
                const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
                const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
                
                const newHistory = [
                  { time: now, success: true, groupName },
                  ...prev.slice(0, 4)
                ]
                localStorage.setItem('refreshHistory', JSON.stringify(newHistory))
                return newHistory
              })
              
              // Toast bildirimi
              const dataCount = result.data?.length || 0
              toast.success('Analiz tamamlandı', {
                description: dataCount > 0 ? `${dataCount} kayıt başarıyla analiz edildi` : 'Stok verileri başarıyla analiz edildi'
              })
            } else {
              // Başarısız güncellemeyi geçmişe ekle
              setRefreshHistory(prev => {
                // Ana grup adını al
                const currentGroup = groups.find(g => g.anaGrupKodu === filters.anaGrupKodu)
                const groupName = currentGroup ? currentGroup.anaGrup : (filters.anaGrupKodu ? filters.anaGrupKodu : undefined)
                
                const newHistory = [
                  { time: now, success: false, groupName },
                  ...prev.slice(0, 4)
                ]
                localStorage.setItem('refreshHistory', JSON.stringify(newHistory))
                return newHistory
              })
              
              // Hata toast bildirimi
              toast.error('Analiz başarısız', {
                description: result?.error || 'Bağlantı hatası oluştu'
              })
            }
          }}
        />

        {/* Divider */}
        <div className="w-full h-px bg-[oklch(0.92_0.00_0_/_0.5)] dark:bg-[oklch(0.27_0.00_0_/_0.5)]" />

        {/* Error alert removed - will be shown in empty state */}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : data.length > 0 ? (
          <>
            {/* TODO: Summary Cards removed temporarily
            <SummaryCards 
              data={searchFilteredData} 
              previousPeriodData={previousPeriodData}
              onCompareChange={handleCompareChange}
            /> */}
            
            {/* Arama ve Export Butonları - RESPONSİVE */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                  
                  {/* Mobilde: Arama ve Seçili Ürünler Yan Yana */}
                  <div className="flex items-center gap-2 w-full sm:hidden">
                    {/* Arama Çubuğu */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[oklch(0.92_0.00_0)]" />
                      <Input
                        type="text"
                        placeholder="Stok kodu ara..."
                        value={tableSearchTerm}
                        onChange={(e) => setTableSearchTerm(e.target.value)}
                        className="pl-9 pr-8 h-[34px] w-full text-[13px] rounded-full bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.27_0.00_0)]"
                      />
                      {isSearching && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                        </div>
                      )}
                      {tableSearchTerm && (
                        <Button
                          onClick={() => setTableSearchTerm('')}
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Seçili ürün sayısı - Mobilde kısa */}
                    {selectedItems.size > 0 && (
                      <div className="flex items-center gap-2 px-3 h-[34px] bg-[oklch(0.55_0.22_263)]/10 dark:bg-[oklch(0.55_0.22_263)]/10 rounded-full whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.22_263)] animate-pulse" />
                          <span className="text-[13px] font-medium text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]">
                            {selectedItems.size}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-[oklch(0.55_0.22_263)]/20" />
                        <button
                          onClick={() => setSelectedItems(new Set())}
                          className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] hover:text-[oklch(0.55_0.22_263)] dark:hover:text-[oklch(0.62_0.19_260)] transition-colors"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Tablet ve Desktop: Arama ve Seçili Ürünler */}
                  <div className="hidden sm:flex items-center gap-3 sm:gap-4 flex-1 w-full">
                    {/* Arama Çubuğu */}
                    <div className="relative flex-1 w-full sm:max-w-[240px] md:max-w-[320px] lg:max-w-[384px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[oklch(0.92_0.00_0)]" />
                      <Input
                        type="text"
                        placeholder="Stok kodu veya ismi ara..."
                        value={tableSearchTerm}
                        onChange={(e) => setTableSearchTerm(e.target.value)}
                        className="pl-9 pr-8 h-[34px] w-full text-[13px] rounded-full bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.27_0.00_0)]"
                      />
                      {isSearching && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                        </div>
                      )}
                      {tableSearchTerm && (
                        <Button
                          onClick={() => setTableSearchTerm('')}
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Seçili ürün sayısı - Desktop */}
                    {selectedItems.size > 0 && (
                      <div className="flex items-center gap-3 px-5 h-[34px] bg-[oklch(0.55_0.22_263)]/10 dark:bg-[oklch(0.55_0.22_263)]/10 rounded-full whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.22_263)] animate-pulse" />
                          <span className="text-[13px] font-medium text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]">
                            {selectedItems.size} seçildi
                          </span>
                        </div>
                        <div className="w-px h-4 bg-[oklch(0.55_0.22_263)]/20" />
                        <button
                          onClick={() => setSelectedItems(new Set())}
                          className="text-[13px] text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)] hover:text-[oklch(0.55_0.22_263)] dark:hover:text-[oklch(0.62_0.19_260)] transition-colors"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Export Butonları */}
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  {selectedItems.size > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={true}
                      onClick={() => setShowListModal(true)}
                      className="h-[34px] px-3 sm:px-4 rounded-lg text-[13px] bg-[oklch(0.20_0.00_0)] text-white border border-gray-200 dark:bg-[oklch(0.20_0.00_0)] dark:text-white dark:border-[oklch(0.27_0.00_0)] flex-1 sm:flex-initial min-w-[120px] opacity-50 cursor-not-allowed"
                    >
                      <FolderPlus className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">Listeye Ekle ({selectedItems.size})</span>
                      <span className="sm:hidden whitespace-nowrap">Ekle ({selectedItems.size})</span>
                    </Button>
                  )}
                  <ExportButton 
                    data={searchFilteredData} 
                    selectedData={selectedItems.size > 0 ? getSelectedData() : undefined}
                    columns={columns} 
                    selectedGroup={selectedGroupName}
                    className="flex-1 sm:flex-initial min-w-[120px]" 
                  />
                </div>
            </div>
            
            {/* FİLTRELER - RESPONSİVE */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
              <ColumnFilter
                columns={columns}
                onColumnsChange={setColumns}
              />
              <MainGroupFilter
                mainGroups={availableMainGroups}
                selectedMainGroups={selectedMainGroups}
                onChange={setSelectedMainGroups}
                disabled={availableMainGroups.length === 0}
              />
              <SubgroupFilter
                subgroups={availableSubgroups}
                selectedSubgroups={selectedSubgroups}
                onChange={setSelectedSubgroups}
                disabled={availableSubgroups.length === 0}
              />
              {/* <MultiStatusFilter
                selectedStatuses={statusFilter}
                onChange={setStatusFilter}
              /> */}
              <AdvancedQuantityFilter
                selectedRanges={quantityFilter}
                onChange={setQuantityFilter}
              />
              <MultiMovementFilter
                selectedStatuses={movementFilter}
                onChange={setMovementFilter}
              />
              <MultiTurnoverFilter
                selectedSpeeds={turnoverFilter}
                onChange={setTurnoverFilter}
              />
              <MultiOrderSuggestionFilter
                selectedTypes={orderSuggestionFilter}
                onChange={setOrderSuggestionFilter}
              />
            </div>
            
            <StockAnalysisTable 
              data={searchFilteredData} 
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value)
                setCurrentPage(1)
              }}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              baslangicTarih={formatDateForSQL(filters.baslangicTarihi)}
              bitisTarih={formatDateForSQL(filters.bitisTarihi)}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${error ? 'bg-red-50 dark:bg-red-950/20' : 'bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.27_0.00_0)]'}`}>
                {error ? (
                  <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400 stroke-1" />
                ) : (
                  <svg 
                    className="w-7 h-7 text-[oklch(0.56_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                    />
                  </svg>
                )}
              </div>
              <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                {error ? 'Bağlantı Hatası' : 'Verilerinizi Analiz Edin'}
              </p>
              <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                {error ? 'Bağlantı hatası oluştu' : 'Filtreleri seçip "Analiz Et" butonuna tıklayın'}
              </p>
              {error && (
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-[oklch(0.99_0.00_0)] border-[oklch(0.85_0.00_0)] text-[oklch(0.25_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.23_0.00_0)]"
                >
                  Tekrar Dene
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Liste Ekleme Modalı */}
      <AddToListModal
        open={showListModal}
        onOpenChange={setShowListModal}
        selectedProducts={searchFilteredData.filter(item => selectedItems.has(item.stokKodu))}
        lists={lists}
        folders={folders}
        onAddToList={(listId, items) => {
          addItemsToList(listId, items)
          setSelectedItems(new Set())
        }}
        onCreateList={(list, items) => {
          createList(list, items)
          setSelectedItems(new Set())
        }}
      />
      
          
          <ScrollToTop />
        </div>
    </SidebarWrapper>
  )
}