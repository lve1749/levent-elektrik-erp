'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLists } from '@/hooks/use-lists'
import { useStockAnalysis } from '@/hooks/use-stock-analysis'
import { useStockAlerts } from '@/hooks/use-stock-alerts'
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper'
import Header from '@/components/layout/header'
import { 
  FolderOpen, 
  Plus, 
  Search, 
  List, 
  Kanban,
  Filter,
  Download,
  Share2,
  MoreVertical,
  FileText,
  AlertCircle,
  Lightbulb,
  Zap,
  Cable,
  Star,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder, PurchaseList } from '@/types/lists'
import CreateFolderModal from '@/components/lists/create-folder-modal'
import EditFolderModal from '@/components/lists/edit-folder-modal'
import EditListModal from '@/components/lists/edit-list-modal'
import AddToFolderModal from '@/components/lists/add-to-folder-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { 
  Edit, 
  Copy, 
  Trash2,
  ChevronLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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

// İkon haritası
const iconMap = {
  FolderOpen: FolderOpen,
  AlertCircle: AlertCircle,
  Lightbulb: Lightbulb,
  Zap: Zap,
  Cable: Cable,
  FileText: FileText,
  Star: Star,
  Shield: Shield
}

function ListelerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folder')
  const currentYear = 2025
  const [viewMode, setViewMode] = useState<'folder' | 'list' | 'kanban'>('folder')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(folderId)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [refreshHistory, setRefreshHistory] = useState<Array<{ time: Date; success: boolean }>>([])
  const [statusFilter, setStatusFilter] = useState<PurchaseList['status'] | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<PurchaseList['priority'] | 'all'>('all')
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null)
  const [listToDelete, setListToDelete] = useState<PurchaseList | null>(null)
  const [listToEdit, setListToEdit] = useState<PurchaseList | null>(null)
  const [listToAddToFolder, setListToAddToFolder] = useState<PurchaseList | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showBulkDeleteListDialog, setShowBulkDeleteListDialog] = useState(false)
  
  // Stok analizi verilerini al (alert sayısı için)
  const [filters] = useState({
    baslangicTarihi: new Date(currentYear, 0, 1),
    bitisTarihi: new Date(currentYear, 11, 31),
    anaGrupKodu: null,
    aySayisi: 12
  })
  
  const { data: stockData } = useStockAnalysis(filters)
  const { alerts } = useStockAlerts(stockData)
  
  const { lists, folders, loading, createFolder, createList, exportLists, deleteFolder, updateFolder, deleteList, duplicateList, updateList, bulkDeleteLists } = useLists()
  
  // Seçili klasör varsa, onun bilgilerini al
  const currentFolder = useMemo(() => {
    if (!folderId) return null
    return folders.find(f => f.id === folderId)
  }, [folders, folderId])
  
  // Klasördeki listeleri filtrele
  const folderLists = useMemo(() => {
    if (!folderId) return lists
    return lists.filter(list => list.folderId === folderId)
  }, [lists, folderId])
  
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
  
  // Filtrelenmiş listeler
  const filteredLists = useMemo(() => {
    let filtered = folderId ? folderLists : lists
    
    // Metin araması
    if (searchTerm) {
      filtered = filtered.filter(list => 
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(list => list.status === statusFilter)
    }
    
    // Öncelik filtresi
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(list => list.priority === priorityFilter)
    }
    
    return filtered
  }, [lists, searchTerm, statusFilter, priorityFilter])
  
  // Filtrelenmiş klasörler
  const filteredFolders = useMemo(() => {
    if (!searchTerm) return folders
    
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [folders, searchTerm])
  
  // Excel'e aktar
  const handleExport = async () => {
    const selectedLists = filteredLists.length > 0 ? filteredLists : lists
    if (selectedLists.length === 0) {
      toast.error('Dışa aktarılacak liste bulunamadı')
      return
    }
    
    try {
      const blob = await exportLists(selectedLists.map(l => l.id), 'excel')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `listeler_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      toast.success('Listeler Excel\'e aktarıldı')
    } catch (error) {
      toast.error('Dışa aktarma başarısız')
    }
  }
  
  // Mock veri kaldırıldı - sadece gerçek klasörler gösterilecek
  const mockFolders: Folder[] = []

  const mockLists: PurchaseList[] = []

  const viewModes = [
    { id: 'folder', icon: FolderOpen, label: 'Klasör' },
    { id: 'list', icon: List, label: 'Liste' },
    { id: 'kanban', icon: Kanban, label: 'Kanban' }
  ]

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

  const getPriorityIcon = (priority: PurchaseList['priority']) => {
    if (priority === 'urgent') return <AlertCircle className="h-4 w-4 text-red-500" />
    if (priority === 'high') return <AlertCircle className="h-4 w-4 text-orange-500" />
    return null
  }

  // Checkbox işlemleri - Klasörler
  const handleSelectFolder = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const handleSelectAll = () => {
    const currentFolders = filteredFolders.length > 0 ? filteredFolders : mockFolders
    if (selectedFolders.length === currentFolders.length) {
      setSelectedFolders([])
    } else {
      setSelectedFolders(currentFolders.map(f => f.id))
    }
  }
  
  // Checkbox işlemleri - Listeler
  const handleSelectList = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
  }

  const handleSelectAllLists = () => {
    if (selectedLists.length === filteredLists.length) {
      setSelectedLists([])
    } else {
      setSelectedLists(filteredLists.map(l => l.id))
    }
  }

  const handleBulkDelete = () => {
    selectedFolders.forEach(id => deleteFolder(id))
    setSelectedFolders([])
    setShowBulkDeleteDialog(false)
    toast.success(`${selectedFolders.length} klasör silindi`)
  }
  
  const handleBulkDeleteLists = () => {
    bulkDeleteLists(selectedLists)
    setSelectedLists([])
    setShowBulkDeleteListDialog(false)
  }

  return (
    <SidebarWrapper
      lastRefreshTime={lastRefreshTime}
      alertCount={alerts.length}
      refreshHistory={refreshHistory}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-[oklch(0.14_0.00_0)]">
        <Header 
          currentPage={currentFolder ? currentFolder.name : "Listeler"}
          breadcrumbItems={currentFolder ? [
            { label: 'Listeler', href: '/listeler' },
            { label: currentFolder.name }
          ] : undefined}
        />

      {/* Toolbar */}
      <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Arama */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Liste veya klasör ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[oklch(0.97_0.00_0)] border-[oklch(0.92_0.00_0)] text-[oklch(0.37_0.00_0)] placeholder:text-[oklch(0.37_0.00_0)]/50 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.87_0.00_0)] dark:placeholder:text-[oklch(0.87_0.00_0)]/50"
              />
            </div>

            {/* Filtreler - Sadece liste görünümünde göster */}
            {viewMode === 'list' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrele
                    {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                      <Badge className="ml-2 bg-blue-100 text-blue-700">
                        {[statusFilter !== 'all' && statusFilter, priorityFilter !== 'all' && priorityFilter]
                          .filter(Boolean)
                          .length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Durum Filtresi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'all'}
                  onCheckedChange={() => setStatusFilter('all')}
                >
                  Tümü
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'draft'}
                  onCheckedChange={() => setStatusFilter('draft')}
                >
                  Taslak
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'pending'}
                  onCheckedChange={() => setStatusFilter('pending')}
                >
                  Bekleyen
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'approved'}
                  onCheckedChange={() => setStatusFilter('approved')}
                >
                  Onaylanan
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'ordered'}
                  onCheckedChange={() => setStatusFilter('ordered')}
                >
                  Sipariş Verildi
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'completed'}
                  onCheckedChange={() => setStatusFilter('completed')}
                >
                  Tamamlandı
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Öncelik Filtresi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'all'}
                  onCheckedChange={() => setPriorityFilter('all')}
                >
                  Tümü
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'urgent'}
                  onCheckedChange={() => setPriorityFilter('urgent')}
                >
                  Acil
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'high'}
                  onCheckedChange={() => setPriorityFilter('high')}
                >
                  Yüksek
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'normal'}
                  onCheckedChange={() => setPriorityFilter('normal')}
                >
                  Normal
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'low'}
                  onCheckedChange={() => setPriorityFilter('low')}
                >
                  Düşük
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter('all')
                    setPriorityFilter('all')
                  }}
                  className="text-sm text-gray-600"
                >
                  Filtreleri Temizle
                </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Görünüm Modları - Klasör seçili değilse göster, değilse boş alan bırak */}
          <div className="h-10 flex items-center">
            {!folderId ? (
              <div className="flex items-center gap-1 bg-[oklch(0.97_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] dark:border dark:border-[oklch(0.27_0.00_0)] rounded-lg p-1">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                      viewMode === mode.id 
                        ? "text-[oklch(0.97_0.00_0)] dark:text-[oklch(0.97_0.00_0)]" 
                        : "text-[oklch(0.27_0.00_0)]/60 hover:text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.97_0.00_0)]/60 dark:hover:text-[oklch(0.97_0.00_0)]"
                    )}
                    onClick={() => setViewMode(mode.id as 'folder' | 'list' | 'kanban')}
                  >
                    {viewMode === mode.id && (
                      <motion.div
                        className="absolute inset-0 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] rounded-md shadow-sm transition-colors"
                        layoutId="viewModeActiveTab"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                          mass: 0.4
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      <mode.icon className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">{mode.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="p-6">
        {/* Klasör Başlığı - Klasör seçiliyse göster */}
        {currentFolder && (
          <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/listeler')}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Geri
                </Button>
                <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700" />
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: currentFolder.color + '20' }}
                >
                  {(() => {
                    const IconComponent = iconMap[currentFolder.icon as keyof typeof iconMap] || FolderOpen
                    return <IconComponent className="h-5 w-5" style={{ color: currentFolder.color }} />
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentFolder.name}
                  </h2>
                  {currentFolder.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentFolder.description}
                    </p>
                  )}
                </div>
                {currentFolder.tags && currentFolder.tags.length > 0 && (
                  <div className="flex items-center gap-1 ml-4">
                    {currentFolder.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{ 
                          backgroundColor: currentFolder.color + '20',
                          color: currentFolder.color,
                          border: `1px solid ${currentFolder.color}30`
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{folderLists.length} liste</span>
              </div>
            </div>
          </div>
        )}

        {/* Klasör Görünümü - Sadece klasör seçili değilse göster */}
        {viewMode === 'folder' && !folderId && (
          <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
            <div className="flex items-center justify-between p-4 border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] min-h-[72px]">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Klasörler</h3>
                {selectedFolders.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-9 px-3 flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="h-5 w-5 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{selectedFolders.length}</span>
                          </div>
                          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">seçili</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowBulkDeleteDialog(true)}
                      className="h-9 px-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">Sil</span>
                    </Button>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => setShowCreateFolderModal(true)}
                className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Klasör
              </Button>
            </div>
            
            <table className="w-full">
              <thead className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                <tr>
                  <th className="w-12 p-2">
                    <div className="flex items-center justify-center">
                      <Checkbox 
                        checked={selectedFolders.length > 0 && selectedFolders.length === (filteredFolders.length > 0 ? filteredFolders : mockFolders).length}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Klasör Adı</th>
                  <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Açıklama</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Liste Sayısı</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Etiketler</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Oluşturulma</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Son Güncelleme</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {(filteredFolders.length > 0 ? filteredFolders : mockFolders).map((folder, index) => {
                  const IconComponent = iconMap[folder.icon as keyof typeof iconMap] || FolderOpen
                  const isLastRow = index === ((filteredFolders.length > 0 ? filteredFolders : mockFolders).length - 1)
                  return (
                    <tr 
                      key={folder.id}
                      className={`${!isLastRow ? 'border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]' : ''} hover:bg-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)]`}
                    >
                      <td className="w-12 p-2">
                        <div className="flex items-center justify-center">
                          <Checkbox 
                            checked={selectedFolders.includes(folder.id)}
                            onCheckedChange={() => handleSelectFolder(folder.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      <td 
                        className="p-2 cursor-pointer"
                        onClick={() => router.push(`/listeler?folder=${folder.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: folder.color + '20' }}
                          >
                            <IconComponent 
                              className="h-3.5 w-3.5" 
                              style={{ color: folder.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">{folder.name}</span>
                        </div>
                      </td>
                    <td className="p-2 text-left">
                      <span className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                        {folder.description || '-'}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className="text-sm py-0.5 px-2">
                        {folder.listCount}
                      </Badge>
                    </td>
                    <td className="p-2 text-center">
                      {folder.tags && folder.tags.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          {folder.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-full"
                              style={{ 
                                backgroundColor: folder.color + '20',
                                color: folder.color,
                                border: `1px solid ${folder.color}30`
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-[oklch(0.55_0.00_0)]">-</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                        <div>{new Date(folder.createdAt).toLocaleDateString('tr-TR')}</div>
                        <div className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.55_0.00_0)]">
                          {new Date(folder.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                        <div>{new Date(folder.updatedAt).toLocaleDateString('tr-TR')}</div>
                        <div className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.55_0.00_0)]">
                          {new Date(folder.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <DropdownMenu 
                        open={openDropdownId === folder.id}
                        onOpenChange={(open) => {
                          setOpenDropdownId(open ? folder.id : null)
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              setFolderToEdit(folder)
                              setOpenDropdownId(null)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              const duplicatedFolder = { ...folder, id: `folder-${Date.now()}`, name: `${folder.name} (Kopya)` }
                              createFolder(duplicatedFolder)
                              toast.success('Klasör kopyalandı')
                              setOpenDropdownId(null)
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Kopyala
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFolderToDelete(folder)
                              setOpenDropdownId(null)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-600 dark:text-red-500" />
                            <span className="text-red-600 dark:text-red-500">Sil</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    </tr>
                  )
                })}
                
                {filteredFolders.length === 0 && !mockFolders.length && (
                  <tr>
                    <td colSpan={9} className="py-16">
                      <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                          <FolderOpen className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                        </div>
                        <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                          Klasörlerinizi Organize Edin
                        </p>
                        <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                          Listelerinizi düzenlemek için ilk klasörünüzü oluşturun
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setShowCreateFolderModal(true)}
                          className="mt-4 h-9 px-4 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Klasörü Oluştur
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Klasör İçeriği - Klasör seçiliyse ve folder view modundaysa göster */}
        {viewMode === 'folder' && folderId && (
          <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
            <div className="flex items-center justify-between p-4 border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] min-h-[72px]">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Listeler</h3>
              </div>
              <Button
                size="sm"
                onClick={() => router.push('/')}
                className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Liste
              </Button>
            </div>
            
            <table className="w-full">
              <thead className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                <tr>
                  <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Liste Adı</th>
                  <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Açıklama</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Durum</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Öncelik</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Ürün Sayısı</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Toplam Değer</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Oluşturulma</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {folderLists.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16">
                      <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] flex items-center justify-center">
                          <FileText className="w-7 h-7 text-[oklch(0.56_0.00_0)] dark:text-[oklch(0.44_0.00_0)] stroke-1" />
                        </div>
                        <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                          Listelerinizi Organize Edin
                        </p>
                        <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                          Bu klasörde henüz liste bulunmuyor
                        </p>
                        <Button
                          size="sm"
                          onClick={() => router.push('/')}
                          className="mt-4 h-9 px-4 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Listeyi Oluştur
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  folderLists.map((list, index) => {
                    const totalValue = list.items?.reduce((sum, item) => 
                      sum + ((item.estimatedPrice || 0) * item.quantity), 0
                    ) || 0
                    const isLastRow = index === (folderLists.length - 1)
                    
                    return (
                      <tr 
                        key={list.id}
                        className={`${!isLastRow ? 'border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]' : ''} hover:bg-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] cursor-pointer`}
                        onClick={() => router.push(`/listeler/${list.id}`)}
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <FileText 
                              className="h-3.5 w-3.5 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.44_0.00_0)]" 
                            />
                            <span className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                              {list.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 text-left">
                          <span className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                            {list.description || '-'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={cn(getStatusColor(list.status), 'text-xs py-0.5 px-2')}>
                            {list.status === 'draft' && 'Taslak'}
                            {list.status === 'pending' && 'Bekleyen'}
                            {list.status === 'approved' && 'Onaylanan'}
                            {list.status === 'ordered' && 'Sipariş Verildi'}
                            {list.status === 'completed' && 'Tamamlandı'}
                            {list.status === 'cancelled' && 'İptal'}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          {list.priority === 'urgent' && (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs py-0.5 px-2 rounded-full">
                              Acil
                            </Badge>
                          )}
                          {list.priority === 'high' && (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs py-0.5 px-2 rounded-full">
                              Yüksek
                            </Badge>
                          )}
                          {list.priority === 'normal' && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs py-0.5 px-2 rounded-full">
                              Normal
                            </Badge>
                          )}
                          {list.priority === 'low' && (
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs py-0.5 px-2 rounded-full">
                              Düşük
                            </Badge>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                            {list.items?.length || 0}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <div className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                            <div>{new Date(list.createdAt).toLocaleDateString('tr-TR')}</div>
                            <div className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.55_0.00_0)]">
                              {new Date(list.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <DropdownMenu
                            open={openDropdownId === list.id}
                            onOpenChange={(open) => {
                              setOpenDropdownId(open ? list.id : null)
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setListToEdit(list)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setListToAddToFolder(list)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Klasöre Ekle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicateList(list.id)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Kopyala
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setListToDelete(list)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2 text-red-600 dark:text-red-500" />
                                <span className="text-red-600 dark:text-red-500">Sil</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Liste (Tablo) Görünümü */}
        {viewMode === 'list' && (
          <div className="bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
            <div className="flex items-center justify-between p-4 border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] min-h-[72px]">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">Listeler</h3>
                {selectedLists.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-9 px-3 flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="h-5 w-5 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{selectedLists.length}</span>
                          </div>
                          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">seçili</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowBulkDeleteListDialog(true)}
                      className="h-9 px-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">Sil</span>
                    </Button>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => router.push('/')}
                className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Liste
              </Button>
            </div>
            
            <table className="w-full">
              <thead className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                <tr>
                  <th className="w-12 p-2">
                    <div className="flex items-center justify-center">
                      <Checkbox 
                        checked={selectedLists.length > 0 && selectedLists.length === filteredLists.length}
                        onCheckedChange={handleSelectAllLists}
                      />
                    </div>
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Liste Adı</th>
                  <th className="text-left p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Klasör</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Durum</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Öncelik</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Ürün Sayısı</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Oluşturulma</th>
                  <th className="text-center p-2 text-sm font-medium text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Son Güncelleme</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLists.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16">
                      <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] flex items-center justify-center">
                          <FileText className="w-7 h-7 text-[oklch(0.56_0.00_0)] dark:text-[oklch(0.44_0.00_0)] stroke-1" />
                        </div>
                        <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                          Listelerinizi Organize Edin
                        </p>
                        <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                          İlk listenizi oluşturun ve ürünleri organize edin
                        </p>
                        <Button
                          size="sm"
                          onClick={() => router.push('/')}
                          className="mt-4 h-9 px-4 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Listeyi Oluştur
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLists.map((list, index) => {
                    const folder = folders.find(f => f.id === list.folderId)
                    const totalValue = list.items?.reduce((sum, item) => 
                      sum + ((item.estimatedPrice || 0) * item.quantity), 0
                    ) || 0
                    const isLastRow = index === (filteredLists.length - 1)
                    
                    return (
                      <tr 
                        key={list.id} 
                        className={`${!isLastRow ? 'border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]' : ''} hover:bg-[oklch(0.97_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] cursor-pointer`}
                        onClick={() => router.push(`/listeler/${list.id}`)}
                      >
                        <td className="w-12 p-2">
                          <div className="flex items-center justify-center">
                            <Checkbox 
                              checked={selectedLists.includes(list.id)}
                              onCheckedChange={() => handleSelectList(list.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.44_0.00_0)]" />
                            <span className="text-sm font-medium text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">{list.name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-left">
                          {folder ? (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const IconComponent = iconMap[folder.icon as keyof typeof iconMap] || FolderOpen
                                return (
                                  <div 
                                    className="h-6 w-6 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: folder.color + '20' }}
                                  >
                                    <IconComponent 
                                      className="h-3 w-3" 
                                      style={{ color: folder.color }}
                                    />
                                  </div>
                                )
                              })()}
                              <span className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">{folder.name}</span>
                              {folder.tags && folder.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {folder.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 text-[10px] rounded-full"
                                      style={{ 
                                        backgroundColor: folder.color + '20',
                                        color: folder.color,
                                        border: `1px solid ${folder.color}30`
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-[oklch(0.55_0.00_0)]">-</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={cn(getStatusColor(list.status), 'text-xs py-0.5 px-2')}>
                            {list.status === 'draft' && 'Taslak'}
                            {list.status === 'pending' && 'Bekleyen'}
                            {list.status === 'approved' && 'Onaylanan'}
                            {list.status === 'ordered' && 'Sipariş Verildi'}
                            {list.status === 'completed' && 'Tamamlandı'}
                            {list.status === 'cancelled' && 'İptal'}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          {list.priority === 'urgent' && (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs py-0.5 px-2 rounded-full">
                              Acil
                            </Badge>
                          )}
                          {list.priority === 'high' && (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs py-0.5 px-2 rounded-full">
                              Yüksek
                            </Badge>
                          )}
                          {list.priority === 'normal' && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs py-0.5 px-2 rounded-full">
                              Normal
                            </Badge>
                          )}
                          {list.priority === 'low' && (
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs py-0.5 px-2 rounded-full">
                              Düşük
                            </Badge>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                            {list.items?.length || 0}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <div className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                            <div>{new Date(list.createdAt).toLocaleDateString('tr-TR')}</div>
                            <div className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.55_0.00_0)]">
                              {new Date(list.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="text-sm text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                            <div>{new Date(list.updatedAt).toLocaleDateString('tr-TR')}</div>
                            <div className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.55_0.00_0)]">
                              {new Date(list.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <DropdownMenu
                            open={openDropdownId === list.id}
                            onOpenChange={(open) => {
                              setOpenDropdownId(open ? list.id : null)
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setListToEdit(list)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setListToAddToFolder(list)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Klasöre Ekle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicateList(list.id)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Kopyala
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setListToDelete(list)
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2 text-red-600 dark:text-red-500" />
                                <span className="text-red-600 dark:text-red-500">Sil</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban Görünümü */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['draft', 'pending', 'approved', 'ordered', 'completed'].map((status) => (
              <div key={status} className="flex-shrink-0 w-80">
                <div className="bg-gray-100 rounded-lg p-3">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
                    {status === 'draft' && 'Taslak'}
                    {status === 'pending' && 'Bekleyen'}
                    {status === 'approved' && 'Onaylanan'}
                    {status === 'ordered' && 'Sipariş Verilen'}
                    {status === 'completed' && 'Tamamlanan'}
                  </h3>
                  <div className="space-y-2">
                    {(filteredLists.length > 0 ? filteredLists : mockLists)
                      .filter((list) => list.status === status)
                      .map((list) => (
                        <div
                          key={list.id}
                          className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{list.name}</h4>
                            {getPriorityIcon(list.priority)}
                          </div>
                          {list.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{list.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {list.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Klasör Oluşturma Modalı */}
      <CreateFolderModal
        open={showCreateFolderModal}
        onOpenChange={setShowCreateFolderModal}
        onCreateFolder={(folder) => {
          createFolder(folder)
          setShowCreateFolderModal(false)
        }}
      />
      
      {/* Klasör Düzenleme Modalı - ShadcnUI Dialog */}
      <EditFolderModal
        open={!!folderToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setFolderToEdit(null)
            setOpenDropdownId(null)
          }
        }}
        folder={folderToEdit}
        onUpdateFolder={(folderId, updates) => {
          updateFolder(folderId, updates)
          setFolderToEdit(null)
          setOpenDropdownId(null)
        }}
      />
      
      {/* Klasör Silme Onay Dialogu - ShadcnUI Alert Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => {
        if (!open) {
          setFolderToDelete(null)
          setOpenDropdownId(null)
        }
      }}>
        <AlertDialogContent className="bg-white dark:bg-[oklch(0.20_0.00_0)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Klasörü silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">"{folderToDelete?.name}"</span> klasörü ve içindeki tüm listeler kalıcı olarak silinecektir. 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (folderToDelete) {
                  deleteFolder(folderToDelete.id)
                  setFolderToDelete(null)
                  setOpenDropdownId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sil
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={() => {
                setFolderToDelete(null)
                setOpenDropdownId(null)
              }}
            >
              İptal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Toplu Silme Onay Dialogu */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-[oklch(0.20_0.00_0)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Seçili klasörleri silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{selectedFolders.length} klasör</span> ve içlerindeki tüm listeler kalıcı olarak silinecektir. 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {selectedFolders.length} Klasörü Sil
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={() => setShowBulkDeleteDialog(false)}
            >
              İptal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Toplu Liste Silme Onay Dialogu */}
      <AlertDialog open={showBulkDeleteListDialog} onOpenChange={setShowBulkDeleteListDialog}>
        <AlertDialogContent className="bg-white dark:bg-[oklch(0.20_0.00_0)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Seçili listeleri silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{selectedLists.length} liste</span> ve içlerindeki tüm ürünler kalıcı olarak silinecektir. 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleBulkDeleteLists}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {selectedLists.length} Listeyi Sil
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={() => setShowBulkDeleteListDialog(false)}
            >
              İptal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Liste Silme Onay Dialogu */}
      <AlertDialog open={!!listToDelete} onOpenChange={(open) => {
        if (!open) {
          setListToDelete(null)
          setOpenDropdownId(null)
        }
      }}>
        <AlertDialogContent className="bg-white dark:bg-[oklch(0.20_0.00_0)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Listeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">"{listToDelete?.name}"</span> listesi ve içindeki tüm ürünler kalıcı olarak silinecektir. 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (listToDelete) {
                  deleteList(listToDelete.id)
                  setListToDelete(null)
                  setOpenDropdownId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sil
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={() => {
                setListToDelete(null)
                setOpenDropdownId(null)
              }}
            >
              İptal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Liste Düzenleme Modalı */}
      <EditListModal
        open={!!listToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setListToEdit(null)
            setOpenDropdownId(null)
          }
        }}
        list={listToEdit}
        folders={folders}
        onUpdateList={(listId, updates) => {
          updateList(listId, updates)
          setListToEdit(null)
          setOpenDropdownId(null)
        }}
      />
      
      {/* Klasöre Ekleme Modalı */}
      <AddToFolderModal
        open={!!listToAddToFolder}
        onOpenChange={(open) => {
          if (!open) {
            setListToAddToFolder(null)
            setOpenDropdownId(null)
          }
        }}
        list={listToAddToFolder}
        folders={folders}
        onAddToFolder={(listId, folderId) => {
          updateList(listId, { folderId })
          setListToAddToFolder(null)
          setOpenDropdownId(null)
        }}
      />
      </div>
    </SidebarWrapper>
  )
}

export default function ListelerPage() {
  return (
    <Suspense fallback={null}>
      <ListelerContent />
    </Suspense>
  )
}