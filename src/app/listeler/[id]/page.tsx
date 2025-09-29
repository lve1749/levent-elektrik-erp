'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import Header from '@/components/layout/header'
import { useStockAnalysis } from '@/hooks/use-stock-analysis'
import { useStockAlerts } from '@/hooks/use-stock-alerts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit,
  Plus,
  Package,
  AlertCircle,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLists } from '@/hooks/use-lists'
import type { PurchaseList, ListItem } from '@/types/lists'
import EditListModal from '@/components/lists/edit-list-modal'
import ListExportButton from '@/components/lists/list-export-button'

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string
  const currentYear = 2025
  
  const { lists, folders, updateList, removeItemFromList, deleteList } = useLists()
  const [list, setList] = useState<PurchaseList | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [quantityValue, setQuantityValue] = useState('')
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [refreshHistory, setRefreshHistory] = useState<Array<{ time: Date; success: boolean }>>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('') // Arama terimi state'i
  
  // Stok analizi verilerini al (alert sayısı için)
  const [filters] = useState({
    baslangicTarihi: new Date(currentYear, 0, 1),
    bitisTarihi: new Date(currentYear, 11, 31),
    anaGrupKodu: null,
    aySayisi: 12
  })
  
  const { data: stockData } = useStockAnalysis(filters)
  const { alerts } = useStockAlerts(stockData)

  useEffect(() => {
    const foundList = lists.find(l => l.id === listId)
    if (foundList) {
      setList(foundList)
    }
  }, [lists, listId])

  // localStorage'dan refresh bilgilerini al
  useEffect(() => {
    const storedTime = localStorage.getItem('lastRefreshTime')
    if (storedTime) {
      setLastRefreshTime(new Date(storedTime))
    }
    
    const storedHistory = localStorage.getItem('refreshHistory')
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory)
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

  if (!list) {
    return (
      <SidebarProvider>
        <AppSidebar 
        lastRefreshTime={lastRefreshTime}
        alertCount={alerts.length}
        refreshHistory={refreshHistory}
      />
        <SidebarInset className="overflow-hidden">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Liste bulunamadı</p>
          <Button 
            onClick={() => router.push('/listeler')}
            className="mt-4"
          >
            Listelere Dön
          </Button>
        </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    const updatedItems = list.items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    updateList(listId, { items: updatedItems })
    setEditingQuantity(null)
  }

  const handleRemoveItems = () => {
    const remainingItems = list.items.filter(item => !selectedItems.has(item.id))
    updateList(listId, { items: remainingItems })
    setSelectedItems(new Set())
    setShowDeleteConfirm(false)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = filteredItems.map(item => item.id)
      setSelectedItems(new Set(filteredIds))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleApproveList = () => {
    updateList(listId, { status: 'pending' })
    toast.success('Liste başarıyla onaylandı', {
      description: 'Liste durumu "Bekleyen" olarak güncellendi'
    })
  }

  const getStatusColor = (status: PurchaseList['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-full',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full',
      ordered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: PurchaseList['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full',
      normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-full',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full'
    }
    return colors[priority]
  }

  // Arama terimine göre ürünleri filtrele
  const filteredItems = list.items.filter(item => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      item.stokKodu.toLowerCase().includes(search) ||
      item.stokIsmi.toLowerCase().includes(search)
    )
  })


  return (
    <SidebarProvider>
      <AppSidebar 
        lastRefreshTime={lastRefreshTime}
        alertCount={alerts.length}
        refreshHistory={refreshHistory}
      />
      <SidebarInset className="overflow-hidden">
        <div className="min-h-screen bg-gray-50 dark:bg-[oklch(0.14_0.00_0)]">
          <Header 
            currentPage={list.name}
            breadcrumbItems={[
              { label: 'Siparişler', href: '#' },
              { label: 'Listeler', href: '/siparisler/listeler' },
              { label: list.name }
            ]}
          />
          

      {/* İçerik */}
      <div className="p-6">
        {/* Bilgi Kartı */}
        <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] p-4 mb-4">
          <div className="flex items-center justify-between divide-x divide-[oklch(0.92_0.00_0)] dark:divide-[oklch(0.27_0.00_0)]">
            {/* 1. Kısım - Liste Adı ve Açıklama */}
            <div className="flex-1 pr-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Liste Adı:</span>
                  <span className="text-sm font-semibold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                    {list.name}
                  </span>
                </div>
                {list.description && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Açıklama:</span>
                    <span className="text-sm text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                      {list.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 2. Kısım - Durum ve Öncelik Badge'leri */}
            <div className="flex-1 px-6">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Durum:</span>
                  <Badge className={cn(getStatusColor(list.status), 'text-xs py-0.5 px-2')}>
                    {list.status === 'draft' && 'Taslak'}
                    {list.status === 'pending' && 'Bekleyen'}
                    {list.status === 'approved' && 'Onaylanan'}
                    {list.status === 'ordered' && 'Sipariş Verildi'}
                    {list.status === 'completed' && 'Tamamlandı'}
                    {list.status === 'cancelled' && 'İptal'}
                  </Badge>
                  {/* İptal durumunda iptal nedenini göster */}
                  {list.status === 'cancelled' && list.cancellationReason && (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          type="button" 
                          className="inline-flex items-center justify-center rounded-full h-5 w-5 ml-1 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        sideOffset={5}
                        className="max-w-sm p-3 bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.37_0.00_0)] shadow-lg"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                            <p className="text-xs font-semibold">İptal Nedeni</p>
                          </div>
                          <p className="text-xs leading-relaxed text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.71_0.00_0)]">
                            {list.cancellationReason}
                          </p>
                          {list.updatedAt && (
                            <p className="text-[10px] text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)] pt-1 border-t border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.37_0.00_0)]">
                              İptal tarihi: {new Date(list.updatedAt).toLocaleDateString('tr-TR')} - {new Date(list.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Öncelik:</span>
                  <Badge className={cn(getPriorityColor(list.priority), 'text-xs py-0.5 px-2')}>
                    {list.priority === 'low' && 'Düşük'}
                    {list.priority === 'normal' && 'Normal'}
                    {list.priority === 'high' && 'Yüksek'}
                    {list.priority === 'urgent' && 'Acil'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* 3. Kısım - Tarih Bilgileri */}
            <div className="flex-1 px-6">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Oluşturma:</span>
                  <span className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                    {new Date(list.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Güncelleme:</span>
                  <span className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                    {new Date(list.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 4. Kısım - İşlem Butonları */}
            <div className="flex-1 pl-6">
              <div className="flex items-center justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)] transition-colors duration-200"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Düzenle
                </Button>
                <ListExportButton 
                  items={filteredItems}
                  listName={list.name}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                  onClick={() => setShowDeleteListConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Listeyi Sil
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] min-h-[72px]">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Liste Ürünleri</h3>
              
              {/* Arama Input Alanı */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[oklch(0.92_0.00_0)]" />
                <Input
                  type="text"
                  placeholder="Stok kodu veya ismi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 h-9 w-full bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.27_0.00_0)]"
                />
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-9 px-3 flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-5 w-5 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{selectedItems.size}</span>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">seçili</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-9 px-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Sil</span>
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {list.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApproveList}
                  className="h-8 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Listeyi Onayla
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => router.push('/')}
                className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </div>
          </div>
          
          <table className="w-full">
            <thead className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
              <tr>
                <th className="w-12 p-2">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="w-12 p-2 text-center text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                  No
                </th>
                <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                  Stok Kodu
                </th>
                <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                  Stok İsmi
                </th>
                <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                  Mevcut Stok
                </th>
                <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                  Önerilen
                </th>
                <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)] min-w-[180px]">
                  Miktar
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                        <Package className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                      </div>
                      <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Bu Listede Ürün Yok'}
                      </p>
                      <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                        {searchTerm ? 'Farklı bir arama terimi deneyin' : 'Listeye ürün ekleyerek başlayın'}
                      </p>
                      {!searchTerm && (
                        <Button
                          size="sm"
                          onClick={() => router.push('/')}
                          className="mt-4 h-9 px-4 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Ürünü Ekle
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isLastRow = index === filteredItems.length - 1
                  return (
                    <tr 
                      key={item.id} 
                      className={`${
                        !isLastRow ? 'border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]' : ''
                      } transition-colors ${
                        selectedItems.has(item.id) 
                          ? 'bg-[oklch(0.93_0.03_256)] hover:bg-[oklch(0.90_0.04_256)] dark:bg-[oklch(0.28_0.09_268)] dark:hover:bg-[oklch(0.31_0.11_268)]'
                          : 'hover:bg-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)]'
                      }`}
                    >
                    <td className="w-12 p-2">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => 
                            handleSelectItem(item.id, checked as boolean)
                          }
                        />
                      </div>
                    </td>
                    <td className="w-12 p-2 text-center text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                      {index + 1}
                    </td>
                    <td className="p-2 text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">{item.stokKodu}</td>
                    <td className="p-2 text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">{item.stokIsmi}</td>
                    <td className="p-2 text-center text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                      {item.currentStock.toLocaleString('de-DE')}
                    </td>
                    <td className="p-2 text-center text-sm text-[oklch(0.55_0.22_263)] dark:text-[oklch(0.62_0.19_260)]">
                      {item.suggestedQuantity.toLocaleString('de-DE')}
                    </td>
                    <td className="p-2 relative">
                      <div className="flex items-center justify-center">
                        {item.isModified && (
                          <div className="absolute left-2">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs py-0.5 px-2 rounded-full font-inter cursor-help">
                                    Değiştirildi
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent 
                                  className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
                                  sideOffset={5}
                                >
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Miktar Değiştirildi</h3>
                                  </div>
                                  <div className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Sistem Önerisi:</span>
                                      <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                                        {item.suggestedQuantity.toLocaleString('de-DE')} adet
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Girilen Miktar:</span>
                                      <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                                        {item.quantity.toLocaleString('de-DE')} adet
                                      </span>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-2 mt-2">
                                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                        Bilgilendirme
                                      </p>
                                      <p className="text-[10px] text-gray-600 dark:text-[oklch(0.70_0.00_0)] mt-1">
                                        Bu ürün için sistem önerisi değiştirilmiş. Listeye eklenirken manuel olarak ayarlanmış miktar kullanılıyor.
                                      </p>
                                    </div>
                                    {item.quantity > item.suggestedQuantity && (
                                      <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium mt-1">
                                        Önerilen miktardan {(item.quantity - item.suggestedQuantity).toLocaleString('de-DE')} adet fazla
                                      </div>
                                    )}
                                    {item.quantity < item.suggestedQuantity && (
                                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                                        Önerilen miktardan {(item.suggestedQuantity - item.quantity).toLocaleString('de-DE')} adet az
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                        {editingQuantity === item.id ? (
                          <Input
                            type="number"
                            value={quantityValue}
                            onChange={(e) => setQuantityValue(e.target.value)}
                            onBlur={() => {
                              handleQuantityUpdate(item.id, parseInt(quantityValue) || 0)
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleQuantityUpdate(item.id, parseInt(quantityValue) || 0)
                              }
                            }}
                            className="w-20 h-7 text-center"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setEditingQuantity(item.id)
                              setQuantityValue(item.quantity.toString())
                            }}
                            className="hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] px-2 py-0.5 rounded text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]"
                          >
                            {item.quantity.toLocaleString('de-DE')}
                          </button>
                        )}
                      </div>
                    </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot>
                <tr className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-t border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                  <td colSpan={6} className="p-2 text-right text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                    Toplam:
                  </td>
                  <td className="p-2 text-center text-sm font-bold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                    {filteredItems.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('de-DE')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Ürün Silme Onay Dialogu */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="bg-white dark:bg-[oklch(0.20_0.00_0)]">
            <AlertDialogHeader>
              <AlertDialogTitle>Seçili ürünleri silmek istediğinize emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{selectedItems.size} ürün</span> listeden kalıcı olarak silinecektir. 
                Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={handleRemoveItems}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {selectedItems.size} Ürünü Sil
              </AlertDialogAction>
              <AlertDialogCancel 
                onClick={() => setShowDeleteConfirm(false)}
              >
                İptal
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Liste Silme Onay Dialogu */}
        <AlertDialog open={showDeleteListConfirm} onOpenChange={setShowDeleteListConfirm}>
          <AlertDialogContent className="bg-white dark:bg-[oklch(0.20_0.00_0)]">
            <AlertDialogHeader>
              <AlertDialogTitle>Listeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{list.name}</span> listesi ve içindeki tüm ürünler kalıcı olarak silinecektir. 
                Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  deleteList(listId)
                  setShowDeleteListConfirm(false)
                  toast.success('Liste başarıyla silindi')
                  router.push('/siparisler/listeler')
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Listeyi Sil
              </AlertDialogAction>
              <AlertDialogCancel 
                onClick={() => setShowDeleteListConfirm(false)}
              >
                İptal
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Liste Düzenleme Modalı */}
        {list && (
          <EditListModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            list={list}
            folders={folders}
            onUpdateList={(id, updates) => {
              updateList(id, updates)
              setShowEditModal(false)
            }}
          />
        )}
      </div>
    </div>
      </SidebarInset>
    </SidebarProvider>
  )
}