'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLists } from '@/hooks/use-lists'
import { useStockAnalysis } from '@/hooks/use-stock-analysis'
import { useStockAlerts } from '@/hooks/use-stock-alerts'
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper'
import Header from '@/components/layout/header'
import { 
  Plus, 
  Search,
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PurchaseList } from '@/types/lists'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
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

// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import {
  CSS
} from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'

// Draggable Card Component
function DraggableCard({ list, folder, onDelete, openDropdownId, setOpenDropdownId }: { 
  list: PurchaseList, 
  folder?: any,
  onDelete: (list: PurchaseList) => void,
  openDropdownId: string | null,
  setOpenDropdownId: (id: string | null) => void
}) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const getPriorityIcon = (priority: PurchaseList['priority']) => {
    if (priority === 'urgent') return <AlertCircle className="h-4 w-4 text-red-500" />
    if (priority === 'high') return <AlertCircle className="h-4 w-4 text-orange-500" />
    return null
  }

  const getPriorityColor = (priority: PurchaseList['priority']) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
    }
    return colors[priority]
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-lg p-3 shadow-sm hover:shadow-md transition-all",
        "border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] line-clamp-2 flex-1">
          {list.name}
        </h4>
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
              className="h-6 w-6 p-0 hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] rounded-md"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/listeler/${list.id}`)
                setOpenDropdownId(null)
              }}
            >
              <Eye className="h-3 w-3 mr-2" />
              Listeyi İncele
            </DropdownMenuItem>
            {folder && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/siparisler/klasorler?folder=${folder.id}`)
                  setOpenDropdownId(null)
                }}
              >
                <FolderOpen className="h-3 w-3 mr-2" />
                Klasörü İncele
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(list)
                setOpenDropdownId(null)
              }}
            >
              <Trash2 className="h-3 w-3 mr-2 text-red-600 dark:text-red-500" />
              <span className="text-red-600 dark:text-red-500">Sil</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Description */}
      {list.description && (
        <p className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)] mb-2 line-clamp-2">
          {list.description}
        </p>
      )}
      
      {/* Status Row - Priority and Item Count */}
      <div className="flex items-center justify-between mb-2">
        {/* Priority Badge */}
        {list.priority && (
          <div className="flex items-center gap-1.5">
            {getPriorityIcon(list.priority) && (
              <div className="scale-75">
                {getPriorityIcon(list.priority)}
              </div>
            )}
            <Badge className={cn(getPriorityColor(list.priority), 'text-[11px] py-0.5 px-2 h-5')}>
              {list.priority === 'urgent' && 'Acil'}
              {list.priority === 'high' && 'Yüksek'}
              {list.priority === 'normal' && 'Normal'}
              {list.priority === 'low' && 'Düşük'}
            </Badge>
          </div>
        )}
        
        {/* Item Count */}
        <span className="text-xs font-medium text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
          {list.items?.length || 0} ürün
        </span>
      </div>
      
      {/* Folder Badge */}
      {folder && (
        <div className="flex items-center gap-1.5 mb-2">
          <FolderOpen className="h-3.5 w-3.5 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]" />
          <span className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
            {folder.name}
          </span>
        </div>
      )}
      
      {/* Tags */}
      {list.tags && list.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {list.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)] text-[11px] rounded-md"
            >
              {tag}
            </span>
          ))}
          {list.tags.length > 3 && (
            <span className="px-2 py-0.5 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)] text-[11px]">
              +{list.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Droppable Column Component
function DroppableColumn({ status, children, count }: { 
  status: string, 
  children: React.ReactNode,
  count: number 
}) {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: status,
  })

  const getStatusTitle = (status: string) => {
    const titles = {
      draft: 'Taslak',
      pending: 'Bekleyen',
      approved: 'Onaylanan',
      ordered: 'Sipariş Verilen',
      completed: 'Tamamlanan'
    }
    return titles[status as keyof typeof titles] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-400 dark:bg-gray-600',
      pending: 'bg-yellow-400 dark:bg-yellow-600',
      approved: 'bg-green-400 dark:bg-green-600',
      ordered: 'bg-blue-400 dark:bg-blue-600',
      completed: 'bg-emerald-400 dark:bg-emerald-600'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-400 dark:bg-gray-600'
  }

  return (
    <div 
      ref={setNodeRef}
      className="min-w-0"
    >
      <div className={cn(
        "rounded-lg border transition-all duration-200",
        "bg-[oklch(0.98_0.00_0)] dark:bg-[oklch(0.18_0.00_0)] border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]",
        isOver && "ring-2 ring-[oklch(0.55_0.22_263)] ring-offset-1"
      )}>
        {/* Column Header */}
        <div className="px-3 py-2 border-b border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                getStatusColor(status)
              )} />
              <h3 className="text-sm font-medium text-[oklch(0.37_0.00_0)] dark:text-[oklch(0.87_0.00_0)]">
                {getStatusTitle(status)}
              </h3>
            </div>
            <Badge variant="outline" className="text-xs h-5 px-1.5 bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
              {count}
            </Badge>
          </div>
        </div>
        
        {/* Cards Container */}
        <div className="p-2 space-y-2 min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto kanban-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const router = useRouter()
  const currentYear = 2025
  const [searchTerm, setSearchTerm] = useState('')
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [refreshHistory, setRefreshHistory] = useState<Array<{ time: Date; success: boolean }>>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Stok analizi verilerini al (alert sayısı için)
  const [filters] = useState({
    baslangicTarihi: new Date(currentYear, 0, 1),
    bitisTarihi: new Date(currentYear, 11, 31),
    anaGrupKodu: null,
    aySayisi: 12
  })
  
  const { data: stockData } = useStockAnalysis(filters)
  const { alerts } = useStockAlerts(stockData)
  
  const { lists, folders, updateList, deleteList } = useLists()
  const [listToDelete, setListToDelete] = useState<PurchaseList | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
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
    if (!searchTerm) return lists
    
    return lists.filter(list =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [lists, searchTerm])

  // Organize lists by status
  const listsByStatus = useMemo(() => {
    const statuses = ['draft', 'pending', 'approved', 'ordered', 'completed']
    const organized: Record<string, PurchaseList[]> = {}
    
    statuses.forEach(status => {
      organized[status] = filteredLists.filter(list => list.status === status)
    })
    
    return organized
  }, [filteredLists])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    
    // Eğer geçerli bir alana bırakılmadıysa, hiçbir şey yapma (liste eski yerinde kalır)
    if (!over) return
    
    const activeList = lists.find(list => list.id === active.id)
    if (!activeList) return
    
    // Sadece geçerli status kolonlarına bırakıldığında güncelle
    const validStatuses = ['draft', 'pending', 'approved', 'ordered', 'completed']
    if (validStatuses.includes(over.id as string)) {
      const newStatus = over.id as PurchaseList['status']
      if (activeList.status !== newStatus) {
        updateList(activeList.id, { status: newStatus })
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeList = lists.find(list => list.id === active.id)
    if (!activeList) return
    
    // Sadece kolonlar arası geçişte güncelleme yap
    const overId = over.id as string
    const validStatuses = ['draft', 'pending', 'approved', 'ordered', 'completed']
    
    // Eğer başka bir kolona geçildiyse
    if (validStatuses.includes(overId)) {
      const newStatus = overId as PurchaseList['status']
      if (activeList.status !== newStatus) {
        updateList(activeList.id, { status: newStatus })
      }
    }
  }

  const activeList = activeId ? lists.find(list => list.id === activeId) : null

  return (
    <SidebarWrapper
      lastRefreshTime={lastRefreshTime}
      alertCount={alerts.length}
      refreshHistory={refreshHistory}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-[oklch(0.14_0.00_0)]">
        <Header 
          currentPage="Kanban"
          breadcrumbItems={[
            { label: 'Siparişler', href: '#' },
            { label: 'Kanban' }
          ]}
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
                  placeholder="Liste ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-[oklch(0.97_0.00_0)] border-[oklch(0.92_0.00_0)] text-[oklch(0.37_0.00_0)] placeholder:text-[oklch(0.37_0.00_0)]/50 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.87_0.00_0)] dark:placeholder:text-[oklch(0.87_0.00_0)]/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board with DnD Kit */}
        <div className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="grid grid-cols-5 gap-3">
              {['draft', 'pending', 'approved', 'ordered', 'completed'].map((status) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  count={listsByStatus[status]?.length || 0}
                >
                  <SortableContext
                    items={listsByStatus[status]?.map(list => list.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    {listsByStatus[status]?.map((list) => {
                      const folder = folders.find(f => f.id === list.folderId)
                      return (
                        <DraggableCard
                          key={list.id}
                          list={list}
                          folder={folder}
                          onDelete={(list) => setListToDelete(list)}
                          openDropdownId={openDropdownId}
                          setOpenDropdownId={setOpenDropdownId}
                        />
                      )
                    })}
                  </SortableContext>
                  
                  {/* Empty State */}
                  {(!listsByStatus[status] || listsByStatus[status].length === 0) && (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] flex items-center justify-center mb-1">
                        <Plus className="h-3 w-3 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]" />
                      </div>
                      <p className="text-[9px] text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">Liste yok</p>
                    </div>
                  )}
                </DroppableColumn>
              ))}
            </div>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeList ? (
                <div className={cn(
                  "bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-md p-2.5",
                  "border-2 border-[oklch(0.55_0.22_263)] dark:border-[oklch(0.62_0.19_260)]",
                  "shadow-2xl cursor-grabbing",
                  "transform scale-105 transition-transform"
                )}>
                  <div className="opacity-90">
                    <h4 className="font-medium text-xs text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                      {activeList.name}
                    </h4>
                    {activeList.description && (
                      <p className="text-[10px] text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)] mt-1 line-clamp-2">
                        {activeList.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                        {activeList.items?.length || 0} ürün
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        
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
      </div>
    </SidebarWrapper>
  )
}