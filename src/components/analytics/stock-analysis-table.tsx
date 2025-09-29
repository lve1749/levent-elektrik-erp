import * as React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { StokAnalizRaporu } from '@/types'
import { formatNumber, roundOrderQuantity, formatOrderNumber } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { TableColumn } from '@/components/filters/column-filter'
import { Check, Copy, ChevronUp, ChevronDown, ChevronsUpDown, Info, Eye, Ellipsis } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SortConfig } from '@/app/page'
import SeasonalityBadge from './seasonality-badge'
import MovementStatusBadge from './movement-status-badge'
import OrderSuggestionBadge from './order-suggestion-badge'
import TurnoverSpeedBadge from './turnover-speed-badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import HareketDetayDialog from '@/components/stok-analiz/HareketDetayDialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StockAnalysisTableProps {
  data: StokAnalizRaporu[]
  columns: TableColumn[]
  sortConfig?: SortConfig
  onSort?: (key: keyof StokAnalizRaporu) => void
  selectedItems?: Set<string>
  onSelectItem?: (stokKodu: string, checked: boolean) => void
  onSelectAll?: (checked: boolean) => void
  isAllSelected?: boolean
  isIndeterminate?: boolean
  itemsPerPage?: number
  onItemsPerPageChange?: (value: number) => void
  currentPage?: number
  onPageChange?: (page: number) => void
  baslangicTarih?: string
  bitisTarih?: string
}

export default function StockAnalysisTable({ 
  data, 
  columns, 
  sortConfig, 
  onSort,
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
  isAllSelected = false,
  isIndeterminate = false,
  itemsPerPage: itemsPerPageProp,
  onItemsPerPageChange,
  currentPage: currentPageProp,
  onPageChange,
  baslangicTarih = '2025-01-01',
  bitisTarih = '2025-12-31'
}: StockAnalysisTableProps) {
  const { copy, copied } = useCopyToClipboard()
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [stokIsmiWidth, setStokIsmiWidth] = React.useState(250) // Stok ismi kolonu genişliği
  const [isResizing, setIsResizing] = React.useState(false)
  const resizeStartX = React.useRef(0)
  const resizeStartWidth = React.useRef(0)
  
  // Hareket detay dialog state'leri
  const [showHareketDetay, setShowHareketDetay] = React.useState(false)
  const [selectedStok, setSelectedStok] = React.useState<{ kod: string; isim: string } | null>(null)
  
  // Pagination state - use props if provided, otherwise local state
  const [localCurrentPage, setLocalCurrentPage] = React.useState(1)
  const [localItemsPerPage, setLocalItemsPerPage] = React.useState(50)
  
  const currentPage = currentPageProp ?? localCurrentPage
  const itemsPerPage = itemsPerPageProp ?? localItemsPerPage
  const setCurrentPage = onPageChange ?? setLocalCurrentPage
  const setItemsPerPage = onItemsPerPageChange ?? setLocalItemsPerPage

  // Pagination hesaplamaları
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedData = data.slice(startIndex, endIndex)
  
  // Sayfa değiştiğinde scroll'u en üste al
  React.useEffect(() => {
    // ScrollArea otomatik olarak yönetecek
  }, [currentPage])
  
  // Veri değiştiğinde ilk sayfaya dön
  React.useEffect(() => {
    setCurrentPage(1)
  }, [data.length])
  
  // ScrollArea için scroll durumu takibi gerekmiyor

  const handleCopy = (text: string, id: string) => {
    copy(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }
  
  // Hareket detayını göster
  const handleShowHareketDetay = (stokKodu: string, stokIsmi: string) => {
    setSelectedStok({ kod: stokKodu, isim: stokIsmi })
    setShowHareketDetay(true)
  }

  // Resize işlemleri - Performans optimizasyonu ile
  const animationFrameId = React.useRef<number>()
  const currentWidth = React.useRef(stokIsmiWidth)
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStartX.current = e.clientX
    resizeStartWidth.current = stokIsmiWidth
    currentWidth.current = stokIsmiWidth
    
    // Body'ye cursor style ekle
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  React.useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      // Önceki animasyon frame'i iptal et
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      
      // requestAnimationFrame kullanarak smooth update
      animationFrameId.current = requestAnimationFrame(() => {
        const diff = e.clientX - resizeStartX.current
        const newWidth = Math.max(150, Math.min(500, resizeStartWidth.current + diff))
        
        // Sadece değişiklik varsa güncelle
        if (Math.abs(newWidth - currentWidth.current) > 0) {
          currentWidth.current = newWidth
          setStokIsmiWidth(newWidth)
        }
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      
      // Cursor ve selection'ı resetle
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      // Animasyon frame'i temizle
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      
      // Genişliği localStorage'a kaydet
      localStorage.setItem('stokIsmiColumnWidth', currentWidth.current.toString())
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseUp) // Mouse sayfadan çıkarsa

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseUp)
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isResizing])

  // Component mount olduğunda kayıtlı genişliği yükle
  React.useEffect(() => {
    const savedWidth = localStorage.getItem('stokIsmiColumnWidth')
    if (savedWidth) {
      setStokIsmiWidth(parseInt(savedWidth, 10))
    }
  }, [])

  const columnMap: Record<string, { 
    header: string | React.ReactNode
    render: (row: StokAnalizRaporu) => React.ReactNode
    className?: string
    headerClassName?: string
    sticky?: boolean
    sortable?: boolean
  }> = {
    checkbox: {
      header: (
        <div className="flex items-center justify-center h-full">
          <Checkbox
            checked={isAllSelected}
            data-state={isIndeterminate ? "indeterminate" : isAllSelected ? "checked" : "unchecked"}
            onCheckedChange={(checked) => onSelectAll?.(checked as boolean)}
            size="sm"
            className="relative top-0"
          />
        </div>
      ),
      render: (row) => (
        <div className="flex items-center justify-center h-full">
          <Checkbox
            checked={selectedItems.has(row.stokKodu)}
            onCheckedChange={(checked) => onSelectItem?.(row.stokKodu, checked as boolean)}
            size="sm"
            className="relative top-0"
          />
        </div>
      ),
      sticky: true,
      headerClassName: '!px-2 text-center',
      className: '!px-2 text-center'
    },
    stokKodu: {
      header: 'Stok Kodu',
      render: (row) => (
        <div className="group/code flex items-center gap-2">
          <span className="font-inter text-xs font-medium font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)]">{row.stokKodu}</span>
          <button
            className={cn(
              "transition-opacity p-0.5",
              copiedId === `stok-${row.stokKodu}` ? "opacity-100" : "opacity-0 group-hover/code:opacity-60"
            )}
            onClick={() => handleCopy(row.stokKodu, `stok-${row.stokKodu}`)}
          >
            <AnimatePresence mode="wait">
              {copiedId === `stok-${row.stokKodu}` ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      ),
      sticky: true,
      headerClassName: 'text-left',
      sortable: true
    },
    stokIsmi: {
      header: 'Stok İsmi',
      render: (row) => {
        return (
          <div 
            className="group/name flex items-center gap-2" 
            style={{ width: `${stokIsmiWidth}px`, minWidth: '150px', maxWidth: '500px' }}
          >
            <span 
              className="font-inter text-xs font-medium text-gray-700 dark:text-[oklch(0.87_0.00_0)] truncate flex-1"
              title={row.stokIsmi} // Hover'da tam ismi göster
            >
              {row.stokIsmi}
            </span>
            <button
              className={cn(
                "transition-opacity flex-shrink-0 p-0.5",
                copiedId === `isim-${row.stokKodu}` ? "opacity-100" : "opacity-0 group-hover/name:opacity-60"
              )}
              onClick={() => handleCopy(row.stokIsmi, `isim-${row.stokKodu}`)}
            >
              <AnimatePresence mode="wait">
                {copiedId === `isim-${row.stokKodu}` ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" strokeWidth={1.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        )
      },
      headerClassName: 'text-left',
      sortable: true
    },
    anaGrup: {
      header: 'Ana Grup',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-600 dark:text-[oklch(0.87_0.00_0)]">{row.anaGrup || '-'}</span>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
      sortable: true
    },
    altGrup: {
      header: 'Alt Grup',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-600 dark:text-[oklch(0.87_0.00_0)]">{row.altGrup || '-'}</span>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
      sortable: true
    },
    depo: {
      header: 'Depo',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-600 dark:text-[oklch(0.87_0.00_0)]">{row.depo}</span>
      ),
      headerClassName: 'text-center',
      className: 'text-center'
    },
    girisMiktari: {
      header: 'Giriş Miktarı',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)]">{formatNumber(row.girisMiktari)}</span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    cikisMiktari: {
      header: 'Çıkış Miktarı',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)]">{formatNumber(row.cikisMiktari)}</span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    kalanMiktar: {
      header: 'Kalan Miktar',
      render: (row) => (
        <span className={cn(
          "font-inter text-xs font-semibold",
          row.kalanMiktar < 0 
            ? "text-red-600 dark:text-red-500" 
            : "text-gray-900 dark:text-[oklch(0.87_0.00_0)]"
        )}>
          {formatNumber(row.kalanMiktar)}
        </span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    verilenSiparis: {
      header: 'Verilen Sipariş',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)]">{formatNumber(row.verilenSiparis)}</span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    alinanSiparis: {
      header: 'Alınan Sipariş',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)]">{formatNumber(row.alinanSiparis)}</span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    stokBekleyen: {
      header: 'Stok + Bekleyen',
      render: (row) => (
        <span className="font-inter text-xs font-medium font-semibold text-blue-600">
          {formatNumber(row.stokBekleyen)}
        </span>
      ),
      className: 'text-right',
      headerClassName: 'text-right text-blue-600',
      sortable: true
    },
    toplamEksik: {
      header: 'Toplam Eksik',
      render: (row) => (
        <span className={cn(
          "font-inter text-xs font-semibold",
          row.toplamEksik < 0 ? "text-red-600" : "text-green-600"
        )}>
          {formatNumber(row.toplamEksik)}
        </span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    aylikOrtalamaSatis: {
      header: 'Aylık Ort. Satış',
      render: (row) => (
        <span className="font-inter text-xs font-medium text-gray-700 dark:text-[oklch(0.87_0.00_0)]">{formatNumber(row.aylikOrtalamaSatis)}</span>
      ),
      className: 'text-right',
      headerClassName: 'text-right',
      sortable: true
    },
    ortalamaAylikStok: {
      header: 'Ort. Aylık Stok',
      render: (row) => {
        const value = row.ortalamaAylikStok
        const displayValue = formatNumber(value)
        
        // Stok durumuna göre renk belirleme
        let colorClass = ""
        
        if (value < 1) {
          colorClass = "bg-red-500 dark:bg-red-400" // Kritik düşük stok
        } else if (value < 2) {
          colorClass = "bg-orange-500 dark:bg-orange-400" // Düşük stok uyarısı
        } else {
          colorClass = "bg-green-500 dark:bg-green-400" // Yeterli stok
        }
        
        return (
          <div className="flex items-center justify-start gap-2">
            <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
            <span className="font-inter text-xs font-medium text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
              {displayValue}
            </span>
          </div>
        )
      },
      className: 'text-left',
      headerClassName: 'text-left',
      sortable: true
    },
    // YENİ: Hareket Durumu
    hareketDurumu: {
      header: 'Hareket',
      render: (row) => {
        if (!row.hareketDurumu) return '-'
        
        return (
          <MovementStatusBadge 
            status={row.hareketDurumu}
            lastMovementDate={row.sonHareketTarihi}
            averageMonthlySales={row.aylikOrtalamaSatis}
            remainingStock={row.kalanMiktar}
            last30DaysMovements={row.son30GunCikisSayisi}
            last60DaysMovements={row.son60GunCikisSayisi}
            last180DaysMovements={row.son180GunCikisSayisi}
            last365DaysMovements={row.son365GunCikisSayisi}
          />
        )
      },
      className: 'text-center',
      headerClassName: 'text-center',
      sortable: true
    },
    // YENİ: Devir Hızı
    devirHiziGun: {
      header: 'Devir Hızı',
      render: (row) => {
        if (!row.devirHiziGun || row.devirHiziGun === 0) return null
        
        return (
          <TurnoverSpeedBadge 
            turnoverDays={row.devirHiziGun}
            monthlyAverage={row.aylikOrtalamaSatis}
            currentStock={row.kalanMiktar}
            movementStatus={row.hareketDurumu}
          />
        )
      },
      className: 'text-left',
      headerClassName: 'text-left',
      sortable: true
    },
    // YENİ: Mevsimsellik
    mevsimselPattern: {
      header: 'Mevsimsellik',
      render: (row) => {
        return (
          <SeasonalityBadge 
            pattern={row.mevsimselPattern} 
            risk={row.mevsimselRisk}
            size="sm"
          />
        )
      },
      className: 'text-center',
      headerClassName: 'text-center'
    },
    // YENİ: Önerilen Sipariş
    onerilenSiparis: {
      header: 'Önerilen Sipariş',
      render: (row) => {
        return (
          <OrderSuggestionBadge 
            suggestedQuantity={row.onerilenSiparis}
            currentStock={row.kalanMiktar}
            monthlyAverage={row.aylikOrtalamaSatis}
            monthlyStock={row.ortalamaAylikStok}
            pendingOrders={row.verilenSiparis}
            receivedOrders={row.alinanSiparis}
            movementStatus={row.hareketDurumu}
            turnoverDays={row.devirHiziGun}
            orderReason={row.siparisNedeni}
          />
        )
      },
      className: 'text-left',
      headerClassName: 'text-left',
      sortable: true
    },
    // İşlemler kolonu
    islemler: {
      header: 'İşlemler',
      render: (row) => {
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    "hover:bg-[oklch(0.90_0.00_0)] dark:hover:bg-[oklch(0.25_0.00_0)]",
                    "hover:scale-105 active:scale-95",
                    "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  )}
                  aria-label="İşlemler menüsü"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[180px]"
              >
                <DropdownMenuItem 
                  onClick={() => handleShowHareketDetay(row.stokKodu, row.stokIsmi)}
                  className="flex items-center gap-2 text-[13px] font-inter cursor-pointer hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.25_0.00_0)] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Hareket Detayı</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      className: 'text-center',
      headerClassName: 'text-center',
      sortable: false
    }
  }

  const visibleColumns = columns.filter(col => col.visible)
  
  // Pagination page numbers generation
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const getSortIcon = (columnKey: string) => {
    const config = columnMap[columnKey]
    if (!config.sortable || !onSort) return null

    const isActive = sortConfig?.key === columnKey
    const direction = sortConfig?.direction

    return (
      <button
        onClick={() => onSort(columnKey as keyof StokAnalizRaporu)}
        className="ml-1 inline-flex items-center opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
      >
        {isActive ? (
          direction === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3" />
        )}
      </button>
    )
  }

  // Satır arka plan rengini hesapla
  const getRowBackground = (index: number, isSelected: boolean) => {
    if (isSelected) return "bg-[oklch(0.93_0.03_256)] hover:bg-[oklch(0.90_0.04_256)] dark:bg-[oklch(0.21_0.04_266)] dark:hover:bg-[oklch(0.24_0.05_266)]"
    if (index % 2 === 0) return "bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.93_0.01_265)] dark:bg-[oklch(0.14_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)]"
    return "bg-[oklch(0.97_0.00_0)] hover:bg-[oklch(0.93_0.01_265)] dark:bg-[oklch(0.17_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)]"
  }

  // Hücre arka plan rengini hesapla
  const getCellBackground = (index: number, isSelected: boolean, isSticky: boolean) => {
    if (!isSticky) return ""
    
    if (isSelected) return "bg-[oklch(0.93_0.03_256)] group-hover:bg-[oklch(0.90_0.04_256)] dark:bg-[oklch(0.21_0.04_266)] dark:group-hover:bg-[oklch(0.24_0.05_266)]"
    if (index % 2 === 0) return "bg-[oklch(0.99_0.00_0)] group-hover:bg-[oklch(0.93_0.01_265)] dark:bg-[oklch(0.14_0.00_0)] dark:group-hover:bg-[oklch(0.27_0.00_0)]"
    return "bg-[oklch(0.97_0.00_0)] group-hover:bg-[oklch(0.93_0.01_265)] dark:bg-[oklch(0.17_0.00_0)] dark:group-hover:bg-[oklch(0.27_0.00_0)]"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-[oklch(0.14_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] font-inter h-[calc(100vh-340px)] overflow-hidden">
        {/* Ana Scrollable Container - ScrollArea ile hem yatay hem dikey scroll */}
        <ScrollArea className="h-full" orientation="both">
          <div className="w-max min-w-full" style={{ willChange: isResizing ? 'width' : 'auto' }}>
            <table className="w-full border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-40">
            <tr className={cn(
              "transition-all duration-300",
              isScrolled ? [
                "bg-[oklch(0.95_0.00_0)]/90 dark:bg-[oklch(0.20_0.00_0)]/90 backdrop-blur-xl",
                "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
              ] : "bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]"
            )}>
              {visibleColumns.map((column) => {
                const config = columnMap[column.key]
                return (
                  <th 
                    key={column.key} 
                    className={cn(
                      "py-3.5 px-3 text-xs font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] group whitespace-nowrap relative",
                      "border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]",
                      !config.sticky && "border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]",
                      config.headerClassName,
                      config.sticky && "sticky z-40",
                      config.sticky && column.key === 'checkbox' && "shadow-[inset_-1px_0_0_0_oklch(0.94_0.00_0)] dark:shadow-[inset_-1px_0_0_0_oklch(0.25_0.00_0)]",
                      config.sticky && column.key === 'stokKodu' && "shadow-[inset_-1px_0_0_0_oklch(0.94_0.00_0)] dark:shadow-[inset_-1px_0_0_0_oklch(0.25_0.00_0)]",
                      column.key === 'checkbox' && "left-0 w-10",
                      column.key === 'stokKodu' && "left-10 min-w-[100px]",
                      config.sticky && (isScrolled ? "bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]" : "bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]")
                    )}
                    style={column.key === 'stokIsmi' ? { width: `${stokIsmiWidth}px` } : undefined}
                  >
                    <div className={cn(
                      "flex items-center",
                      column.key === 'checkbox' && "justify-center",
                      (column.key === 'verilenSiparis' || column.key === 'alinanSiparis') && "justify-end"
                    )}>
                      {typeof config.header === 'string' ? (
                        <>
                          {(column.key === 'verilenSiparis' || column.key === 'alinanSiparis') ? (
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <span>{config.header}</span>
                                    <Info className="h-3 w-3 text-gray-400 opacity-60" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] max-w-xs">
                                  <div className="p-2 space-y-1">
                                    {column.key === 'verilenSiparis' ? (
                                      <>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                                          Tedarikçiye Verilen Sipariş
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-[oklch(0.70_0.00_0)]">
                                          Tedarikçilerinize verdiğiniz ve henüz teslim almadığınız sipariş miktarları. 
                                          Bu miktar stokunuza eklenecek olan ürünleri gösterir.
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                          ↓ Stoğa girecek ürünler
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                                          Müşteriden Alınan Sipariş
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-[oklch(0.70_0.00_0)]">
                                          Müşterilerinizden aldığınız ve henüz teslim edilmemiş sipariş miktarları. 
                                          Bu miktar stokunuzdan düşecek olan ürünleri gösterir.
                                        </p>
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                                          ↑ Stoktan çıkacak ürünler
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span>{config.header}</span>
                          )}
                          {getSortIcon(column.key)}
                        </>
                      ) : (
                        config.header
                      )}
                    </div>
                    {/* Resize handle sadece stok ismi kolonunda */}
                    {column.key === 'stokIsmi' && (
                      <div
                        className={cn(
                          "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50",
                          "after:content-[''] after:absolute after:inset-y-0 after:-left-1 after:-right-1 after:w-3", // Tıklama alanını genişlet
                          isResizing ? "bg-blue-500 dark:bg-blue-400" : "bg-transparent hover:bg-blue-500/50 dark:hover:bg-blue-400/50"
                        )}
                        style={{
                          willChange: isResizing ? 'background-color' : 'auto'
                        }}
                        onMouseDown={handleMouseDown}
                      />
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="relative">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={visibleColumns.length} 
                  className="h-[400px]"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.25_0.00_0)] flex items-center justify-center">
                        <svg 
                          className="w-6 h-6 text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)]" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M3 6h18M3 12h18M3 18h18" 
                          />
                        </svg>
                      </div>
                      <p className="text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)] font-inter text-sm font-medium">
                        Veri bulunamadı
                      </p>
                      <p className="text-[oklch(0.65_0.00_0)] dark:text-[oklch(0.45_0.00_0)] font-inter text-xs mt-1">
                        Filtreleri değiştirin
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const isSelected = selectedItems.has(row.stokKodu)
                return (
                  <ContextMenu key={row.stokKodu}>
                    <ContextMenuTrigger asChild>
                      <tr 
                        className={cn(
                          "group transition-colors duration-100 will-change-[background-color] border-b border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]",
                          getRowBackground(index, isSelected)
                        )}
                      >
                        {visibleColumns.map((column) => {
                          const config = columnMap[column.key]
                          return (
                            <td 
                              key={column.key}
                              className={cn(
                                "py-2.5 px-3 whitespace-nowrap transition-colors duration-100 will-change-[background-color]",
                                !config.sticky && "border-r border-[oklch(0.94_0.00_0)] dark:border-[oklch(0.25_0.00_0)]",
                                config.className,
                                config.sticky && "sticky z-30",
                                config.sticky && column.key === 'checkbox' && "shadow-[inset_-1px_0_0_0_oklch(0.94_0.00_0)] dark:shadow-[inset_-1px_0_0_0_oklch(0.25_0.00_0)]",
                                config.sticky && column.key === 'stokKodu' && "shadow-[inset_-1px_0_0_0_oklch(0.94_0.00_0)] dark:shadow-[inset_-1px_0_0_0_oklch(0.25_0.00_0)]",
                                column.key === 'checkbox' && "left-0",
                                column.key === 'stokKodu' && "left-10",
                                config.sticky && getCellBackground(index, isSelected, true)
                              )}
                            >
                              {config.render(row)}
                            </td>
                          )
                        })}
                      </tr>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-[180px]">
                      <ContextMenuItem 
                        onClick={() => handleShowHareketDetay(row.stokKodu, row.stokIsmi)}
                        className="flex items-center gap-2 text-[13px] font-inter cursor-pointer hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.25_0.00_0)] transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Hareket Detayı</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })
            )}
          </tbody>
        </table>
          </div>
        </ScrollArea>
      </div>
      
      {/* Pagination Controls - Her zaman görünsün */}
      <div className="flex items-center justify-between px-2 flex-nowrap min-w-0">
        {/* Sol taraf - Sayfa başına seçici */}
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground flex-shrink-0">
          <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">Sayfa başına:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => {
              const newValue = Number(value)
              setItemsPerPage(newValue)
              setCurrentPage(1)
              // External handler varsa onu da çağır
              if (onItemsPerPageChange) {
                onItemsPerPageChange(newValue)
              }
            }}
          >
            <SelectTrigger className="h-[34px] w-[70px] text-[13px] rounded-[8px] bg-[oklch(0.99_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.22_0.00_0)] transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[8px] bg-[oklch(0.99_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-2 whitespace-nowrap text-gray-600 dark:text-gray-400">
            {totalItems > 0 ? `${startIndex + 1}-${endIndex} / ${totalItems} kayıt` : '0 kayıt'}
          </span>
        </div>
        
        {/* Sağ taraf - Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end flex-1">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    size="default"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={cn(
                      "cursor-pointer",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        size="icon"
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    size="default"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={cn(
                      "cursor-pointer",
                      currentPage === totalPages && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      
      {/* Hareket Detay Dialog */}
      {selectedStok && (
        <HareketDetayDialog
          isOpen={showHareketDetay}
          onClose={() => {
            setShowHareketDetay(false)
            setSelectedStok(null)
          }}
          stokKodu={selectedStok.kod}
          stokIsmi={selectedStok.isim}
          baslangicTarih={baslangicTarih}
          bitisTarih={bitisTarih}
        />
      )}
    </div>
  )
}