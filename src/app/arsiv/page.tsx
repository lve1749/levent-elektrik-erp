'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLists } from '@/hooks/use-lists'
import Header from '@/components/layout/header'
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
  Trash2, 
  RotateCcw, 
  FileText, 
  FolderOpen,
  Clock,
  Package,
  AlertCircle,
  X,
  Archive
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function ArchivePage() {
  const router = useRouter()
  const { 
    deletedLists, 
    deletedFolders, 
    deleteList, 
    deleteFolder, 
    restoreList, 
    restoreFolder 
  } = useLists()
  
  const [activeTab, setActiveTab] = useState<'lists' | 'folders'>('lists')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmptyDialog, setShowEmptyDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'list' | 'folder' } | null>(null)

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Arşiv' }
  ]

  // Handle permanent delete
  const handlePermanentDelete = (id: string, name: string, type: 'list' | 'folder') => {
    setItemToDelete({ id, name, type })
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'list') {
        deleteList(itemToDelete.id, true)
      } else {
        deleteFolder(itemToDelete.id, true)
      }
      setShowDeleteDialog(false)
      setItemToDelete(null)
    }
  }

  // Handle restore
  const handleRestore = (id: string, type: 'list' | 'folder') => {
    if (type === 'list') {
      restoreList(id)
    } else {
      restoreFolder(id)
    }
  }

  // Handle empty archive
  const handleEmptyArchive = () => {
    setShowEmptyDialog(true)
  }

  const confirmEmptyArchive = () => {
    // Delete all items permanently
    deletedLists.forEach(list => deleteList(list.id, true))
    deletedFolders.forEach(folder => deleteFolder(folder.id, true))
    setShowEmptyDialog(false)
    toast.success('Arşiv temizlendi')
  }

  // Calculate stats
  const totalDeleted = deletedLists.length + deletedFolders.length

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      ordered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  return (
    <SidebarWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-[oklch(0.14_0.00_0)]">
        <Header 
          currentPage="Arşiv"
          breadcrumbItems={breadcrumbItems}
        />

        <main className="max-w-[1920px] mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                  Arşiv
                </h1>
                <p className="text-sm text-gray-500 dark:text-[oklch(0.65_0.00_0)]">
                  {totalDeleted} öğe arşivde
                </p>
              </div>
            </div>
            
            {totalDeleted > 0 && (
              <Button
                variant="outline"
                onClick={handleEmptyArchive}
                className="h-9 px-4 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-400 dark:border-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Arşivi Temizle
              </Button>
            )}
          </div>

          {/* Content */}
          {totalDeleted === 0 ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                  Arşiv Boş
                </p>
                <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                  Arşivlenen öğeler burada görünecek
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-gray-200 dark:border-[oklch(0.27_0.00_0)]">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lists' | 'folders')}>
                <div className="border-b border-gray-200 dark:border-[oklch(0.27_0.00_0)] px-6 pt-4">
                  <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger
                      value="lists"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[oklch(0.55_0.22_263)] rounded-none pb-3 px-4"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Listeler ({deletedLists.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="folders"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[oklch(0.55_0.22_263)] rounded-none pb-3 px-4"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Klasörler ({deletedFolders.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="lists" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Ad</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Öncelik</TableHead>
                        <TableHead>Ürün Sayısı</TableHead>
                        <TableHead>Silinme Tarihi</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedLists.map((list) => (
                        <TableRow key={list.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{list.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", getStatusColor(list.status))}>
                              {list.status === 'draft' && 'Taslak'}
                              {list.status === 'pending' && 'Beklemede'}
                              {list.status === 'approved' && 'Onaylandı'}
                              {list.status === 'ordered' && 'Sipariş Verildi'}
                              {list.status === 'completed' && 'Tamamlandı'}
                              {list.status === 'cancelled' && 'İptal'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", getPriorityColor(list.priority))}>
                              {list.priority === 'low' && 'Düşük'}
                              {list.priority === 'normal' && 'Normal'}
                              {list.priority === 'high' && 'Yüksek'}
                              {list.priority === 'urgent' && 'Acil'}
                            </Badge>
                          </TableCell>
                          <TableCell>{list.items?.length || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {list.deletedAt && formatDistanceToNow(new Date(list.deletedAt), { 
                                addSuffix: true, 
                                locale: tr 
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRestore(list.id, 'list')}
                                className="h-8 px-3"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Geri Yükle
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePermanentDelete(list.id, list.name, 'list')}
                                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="folders" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Ad</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Liste Sayısı</TableHead>
                        <TableHead>Silinme Tarihi</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedFolders.map((folder) => (
                        <TableRow key={folder.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-8 w-8 rounded flex items-center justify-center"
                                style={{ backgroundColor: (folder.color || '#3b82f6') + '20' }}
                              >
                                <FolderOpen 
                                  className="h-4 w-4" 
                                  style={{ color: folder.color || '#3b82f6' }}
                                />
                              </div>
                              <span className="font-medium">{folder.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {folder.description || '-'}
                          </TableCell>
                          <TableCell>{folder.listCount || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {folder.deletedAt && formatDistanceToNow(new Date(folder.deletedAt), { 
                                addSuffix: true, 
                                locale: tr 
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRestore(folder.id, 'folder')}
                                className="h-8 px-3"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Geri Yükle
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePermanentDelete(folder.id, folder.name, 'folder')}
                                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kalıcı Olarak Sil</AlertDialogTitle>
              <AlertDialogDescription>
                "{itemToDelete?.name}" öğesini kalıcı olarak silmek istediğinizden emin misiniz? 
                Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Kalıcı Olarak Sil
              </AlertDialogAction>
              <AlertDialogCancel>İptal</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Empty Archive Confirmation Dialog */}
        <AlertDialog open={showEmptyDialog} onOpenChange={setShowEmptyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arşivi Temizle</AlertDialogTitle>
              <AlertDialogDescription>
                Arşivdeki tüm öğeler kalıcı olarak silinecek. 
                Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={confirmEmptyArchive}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Tümünü Sil
              </AlertDialogAction>
              <AlertDialogCancel>İptal</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarWrapper>
  )
}