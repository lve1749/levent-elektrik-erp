'use client'

import { ErrorBoundary } from '@/components/errors/error-boundary'
import { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react'
import { AnalizFiltre } from '@/types'
import { useStockAnalysis } from '@/hooks/use-stock-analysis'
import { useGroups } from '@/hooks/use-groups'
import { useRefresh } from '@/contexts/RefreshContext'

// Custom hooks
import { useStockFilters } from './hooks/useStockFilters'
import { useTableManagement } from './hooks/useTableManagement'
import { useRefreshManagement } from './hooks/useRefreshManagement'
import { useComparisonData } from './hooks/useComparisonData'
import { useDataFiltering } from './hooks/useDataFiltering'
import { useStockSearch } from './hooks/useStockSearch'
import { useStockDataProcessing } from './hooks/useStockDataProcessing'

import Header from '@/components/layout/header'
import FilterBar from '@/components/filters/filter-bar'
import MultiStatusFilter from '@/components/filters/multi-status-filter'
import AdvancedQuantityFilter from '@/components/filters/advanced-quantity-filter'
import MultiMovementFilter from '@/components/filters/multi-movement-filter'
import MultiTurnoverFilter from '@/components/filters/multi-turnover-filter'
import MultiOrderSuggestionFilter from '@/components/filters/multi-order-suggestion-filter'
import ColumnFilter from '@/components/filters/column-filter'
import SubgroupFilter from '@/components/filters/subgroup-filter'
import MainGroupFilter from '@/components/filters/maingroup-filter'
const StockAnalysisTable = lazy(() => import('@/components/analytics/stock-analysis-table'))
const ExportButton = lazy(() => import('@/components/analytics/export-button'))
import LoadingSpinner from '@/components/ui/loading-spinner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, Package, Search, X, Layers, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMonthsFromYearStart, formatDateForSQL } from '@/lib/formatters'
import AddToListModal from '@/components/lists/add-to-list-modal'
import { useLists } from '@/hooks/use-lists'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StokAnalizPage() {
  const currentYear = 2025
  
  // Default değerler
  const defaultFilters = {
    baslangicTarihi: new Date(currentYear, 0, 1),
    bitisTarihi: new Date(currentYear, 11, 31),
    anaGrupKodu: null,
    aySayisi: getMonthsFromYearStart()
  }
  
  const [filters, setFilters] = useState<AnalizFiltre>(defaultFilters)
  const [showListModal, setShowListModal] = useState(false)
  
  // Core hooks
  const { data, loading, error, refetch } = useStockAnalysis(filters)
  const { groups } = useGroups()
  const { lists, folders, createList, addItemsToList } = useLists()
  const refreshContext = useRefresh()
  
  // Custom hooks
  const stockFilters = useStockFilters()
  const search = useStockSearch()
  const table = useTableManagement()
  const refresh = useRefreshManagement({ 
    filters, 
    refetch, 
    data,
    clearAllFilters: stockFilters.clearAllFilters,
    clearSelection: table.clearSelection
  })
  const comparison = useComparisonData({ filters })
  const processing = useDataFiltering({
    data,
    statusFilter: stockFilters.statusFilter,
    quantityFilter: stockFilters.quantityFilter,
    movementFilter: stockFilters.movementFilter,
    turnoverFilter: stockFilters.turnoverFilter,
    orderSuggestionFilter: stockFilters.orderSuggestionFilter,
    selectedSubgroups: stockFilters.selectedSubgroups,
    selectedMainGroups: stockFilters.selectedMainGroups,
    tableSearchTerm: search.tableSearchTerm,
    sortConfig: table.sortConfig
  })
  const advancedProcessing = useStockDataProcessing({
    data,
    selectedMainGroups: stockFilters.selectedMainGroups,
    selectedSubgroups: stockFilters.selectedSubgroups,
    statusFilter: stockFilters.statusFilter,
    quantityFilter: stockFilters.quantityFilter,
    movementFilter: stockFilters.movementFilter,
    turnoverFilter: stockFilters.turnoverFilter,
    orderSuggestionFilter: stockFilters.orderSuggestionFilter,
    sortConfig: table.sortConfig,
    debouncedSearchTerm: search.debouncedSearchTerm
  })
  
  // Seçili grup ismini bul
  const selectedGroupName = useMemo(() => {
    if (!filters.anaGrupKodu || !groups.length) return null
    const group = groups.find(g => g.grupKodu === filters.anaGrupKodu)
    return group?.grupIsmi || filters.anaGrupKodu
  }, [filters.anaGrupKodu, groups])

  // Seçilen itemlerin verilerini çek
  const getSelectedData = useCallback(() => {
    return Array.from(table.selectedItems).map(stokKodu => 
      advancedProcessing.filteredData.find(item => item.stokKodu === stokKodu)
    ).filter(Boolean)
  }, [table.selectedItems, advancedProcessing.filteredData])

  // Debounced search handler
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const debouncedAnalysisRefresh = useCallback(() => {
    // Önceki timeout'u temizle
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Yeni timeout oluştur
    searchTimeoutRef.current = setTimeout(() => {
      refresh.handleAnalysisRefresh()
    }, 300) // 300ms debounce
  }, [refresh])

  // Pagination is handled inside StockAnalysisTable component

  // Master cleanup - Component unmount'ta tüm state'leri temizle
  useEffect(() => {
    return () => {
      // Timeout'u temizle
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Filtreleri temizle
      stockFilters.clearAllFilters()
      
      // Seçimleri temizle
      table.clearSelection()
      
      // Arama terimini temizle
      search.setTableSearchTerm('')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Empty state conditions
  const isInitialLoad = !loading && !error && data.length === 0 && !filters.anaGrupKodu
  const isEmptyResult = !loading && !error && data.length === 0 && filters.anaGrupKodu
  const hasError = !loading && error

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]">
        <Header 
          currentPage="Stok Analiz"
        />
      
      <main className="max-w-[1920px] mx-auto px-6 py-4 space-y-4">
        <FilterBar 
          filters={filters} 
          onFiltersChange={setFilters}
          onSearch={debouncedAnalysisRefresh}
        />

        <div className="w-full h-px bg-[oklch(0.92_0.00_0_/_0.5)] dark:bg-[oklch(0.27_0.00_0_/_0.5)]" />

        {loading ? (
          <LoadingSpinner />
        ) : isInitialLoad ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Package className="h-16 w-16 mb-4 text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.45_0.00_0)]" />
            <h3 className="text-xl font-medium mb-2 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.95_0.00_0)]">
              Stok Analizine Başlayın
            </h3>
            <p className="text-center text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
              Yukarıdan bir grup seçin ve "Analiz Et" butonuna tıklayın
            </p>
          </div>
        ) : isEmptyResult ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Package className="h-16 w-16 mb-4 text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.45_0.00_0)]" />
            <h3 className="text-xl font-medium mb-2 text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.95_0.00_0)]">
              Veri Bulunamadı
            </h3>
            <p className="text-center text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
              {selectedGroupName ? `${selectedGroupName} grubunda` : 'Seçili kriterlerde'} veri bulunamadı
            </p>
          </div>
        ) : hasError ? (
          <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              {error || 'Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyerek tekrar deneyin.'}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Filter Controls */}
            <div className="flex flex-col gap-4">
              {/* Arama ve Export Butonları - RESPONSIVE */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full lg:w-auto">
                  {/* Mobilde: Arama ve Seçili Ürünler Yan Yana */}
                  <div className="flex items-center gap-2 w-full sm:hidden">
                    {/* Arama Çubuğu */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[oklch(0.92_0.00_0)]" />
                      <Input
                        type="text"
                        placeholder="Stok kodu ara..."
                        value={search.tableSearchTerm}
                        onChange={(e) => search.setTableSearchTerm(e.target.value)}
                        className="pl-9 pr-8 h-[34px] w-full text-[13px] rounded-full bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.27_0.00_0)]"
                      />
                      {search.isSearching && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                        </div>
                      )}
                      {search.tableSearchTerm && (
                        <Button
                          onClick={() => search.setTableSearchTerm('')}
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Seçili ürün sayısı - Mobilde kısa */}
                    {table.selectedItems.size > 0 && (
                      <div className="flex items-center gap-2 px-3 h-[34px] bg-[oklch(0.55_0.22_263)]/10 dark:bg-[oklch(0.55_0.22_263)]/10 rounded-full whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.22_263)] animate-pulse" />
                          <span className="text-[13px] font-medium text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]">
                            {table.selectedItems.size}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-[oklch(0.55_0.22_263)]/20" />
                        <button
                          onClick={() => table.setSelectedItems(new Set())}
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
                        value={search.tableSearchTerm}
                        onChange={(e) => search.setTableSearchTerm(e.target.value)}
                        className="pl-9 pr-8 h-[34px] w-full text-[13px] rounded-full bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.27_0.00_0)]"
                      />
                      {search.isSearching && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                        </div>
                      )}
                      {search.tableSearchTerm && (
                        <Button
                          onClick={() => search.setTableSearchTerm('')}
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Seçili ürün sayısı - Desktop */}
                    {table.selectedItems.size > 0 && (
                      <div className="flex items-center gap-3 px-5 h-[34px] bg-[oklch(0.55_0.22_263)]/10 dark:bg-[oklch(0.55_0.22_263)]/10 rounded-full whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.22_263)] animate-pulse" />
                          <span className="text-[13px] font-medium text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]">
                            {table.selectedItems.size} seçildi
                          </span>
                        </div>
                        <div className="w-px h-4 bg-[oklch(0.55_0.22_263)]/20" />
                        <button
                          onClick={() => table.setSelectedItems(new Set())}
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
                  {table.selectedItems.size > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={true}
                      onClick={() => setShowListModal(true)}
                      className="h-[34px] px-3 sm:px-4 rounded-lg text-[13px] bg-[oklch(0.20_0.00_0)] text-white border border-gray-200 dark:bg-[oklch(0.20_0.00_0)] dark:text-white dark:border-[oklch(0.27_0.00_0)] flex-1 sm:flex-initial min-w-[120px] opacity-50 cursor-not-allowed"
                    >
                      <FolderPlus className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">Listeye Ekle ({table.selectedItems.size})</span>
                      <span className="sm:hidden whitespace-nowrap">Ekle ({table.selectedItems.size})</span>
                    </Button>
                  )}
                  <Suspense fallback={
                    <div className="h-[34px] px-4 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-w-[120px]">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                    </div>
                  }>
                    <ExportButton 
                      data={advancedProcessing.searchFilteredData} 
                      selectedData={table.selectedItems.size > 0 ? getSelectedData() : undefined}
                      columns={table.visibleColumns} 
                      selectedGroup={selectedGroupName}
                      className="flex-1 sm:flex-initial min-w-[120px]" 
                    />
                  </Suspense>
                </div>
              </div>
              
              {/* FİLTRELER - 7 KOLON GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                <ColumnFilter
                  columns={table.visibleColumns}
                  onColumnsChange={table.setVisibleColumns}
                />
                <MainGroupFilter
                  mainGroups={advancedProcessing.availableMainGroups}
                  selectedMainGroups={stockFilters.selectedMainGroups}
                  onChange={stockFilters.setSelectedMainGroups}
                  disabled={advancedProcessing.availableMainGroups.length === 0}
                />
                <SubgroupFilter
                  subgroups={advancedProcessing.availableSubgroups}
                  selectedSubgroups={stockFilters.selectedSubgroups}
                  onChange={stockFilters.setSelectedSubgroups}
                  disabled={advancedProcessing.availableSubgroups.length === 0}
                />
                <AdvancedQuantityFilter
                  selectedRanges={stockFilters.quantityFilter}
                  onChange={stockFilters.setQuantityFilter}
                />
                <MultiMovementFilter
                  selectedStatuses={stockFilters.movementFilter}
                  onChange={stockFilters.setMovementFilter}
                />
                <MultiTurnoverFilter
                  selectedSpeeds={stockFilters.turnoverFilter}
                  onChange={stockFilters.setTurnoverFilter}
                />
                <MultiOrderSuggestionFilter
                  selectedTypes={stockFilters.orderSuggestionFilter}
                  onChange={stockFilters.setOrderSuggestionFilter}
                />
              </div>
            </div>

            {/* Table */}
            <Suspense fallback={
              <div className="bg-white dark:bg-[oklch(0.14_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tablo yükleniyor...</p>
                </div>
              </div>
            }>
              <StockAnalysisTable 
                data={advancedProcessing.searchFilteredData}
                columns={table.visibleColumns}
                sortConfig={table.sortConfig}
                onSort={table.handleSort}
                selectedItems={table.selectedItems}
                onSelectItem={table.handleSelectItem}
                onSelectAll={table.handleSelectAll}
                itemsPerPage={table.rowsPerPage}
                onItemsPerPageChange={(value) => {
                  table.setRowsPerPage(value)
                  table.setCurrentPage(1)
                }}
                currentPage={table.currentPage}
                onPageChange={table.setCurrentPage}
                baslangicTarih={formatDateForSQL(filters.baslangicTarihi)}
                bitisTarih={formatDateForSQL(filters.bitisTarihi)}
              />
            </Suspense>

            {/* List Modal */}
            {showListModal && (
              <AddToListModal
                isOpen={showListModal}
                onClose={() => setShowListModal(false)}
                selectedItems={getSelectedData()}
                lists={lists}
                folders={folders}
                onCreateList={createList}
                onAddToList={addItemsToList}
              />
            )}
          </>
        )}
      </main>

        <ScrollToTop />
      </div>
    </ErrorBoundary>
  )
}