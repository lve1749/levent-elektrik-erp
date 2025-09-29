'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'
import type { PurchaseList, Folder, ListItem, ListFilter, ListSort, ListStatistics } from '@/types/lists'

// IndexedDB setup for better persistence
const DB_NAME = 'StockListsDB'
const DB_VERSION = 1
const LISTS_STORE = 'lists'
const FOLDERS_STORE = 'folders'

interface ListsContextType {
  // Data
  lists: PurchaseList[]
  folders: Folder[]
  loading: boolean
  statistics: ListStatistics | null
  deletedLists: PurchaseList[]
  deletedFolders: Folder[]
  
  // List Operations
  createList: (list: Partial<PurchaseList>, items?: Partial<ListItem>[]) => PurchaseList
  updateList: (listId: string, updates: Partial<PurchaseList>) => void
  deleteList: (listId: string, permanent?: boolean) => void
  restoreList: (listId: string) => void
  duplicateList: (listId: string) => PurchaseList
  mergeLists: (sourceIds: string[], targetId: string) => void
  
  // Item Operations
  addItemsToList: (listId: string, items: Partial<ListItem>[]) => void
  removeItemFromList: (listId: string, itemId: string) => void
  updateListItem: (listId: string, itemId: string, updates: Partial<ListItem>) => void
  moveItems: (sourceListId: string, targetListId: string, itemIds: string[]) => void
  
  // Folder Operations
  createFolder: (folder: Partial<Folder>) => Folder
  updateFolder: (folderId: string, updates: Partial<Folder>) => void
  deleteFolder: (folderId: string, permanent?: boolean) => void
  restoreFolder: (folderId: string) => void
  
  // Bulk Operations
  bulkUpdateLists: (listIds: string[], updates: Partial<PurchaseList>) => void
  bulkDeleteLists: (listIds: string[]) => void
  exportLists: (listIds: string[], format: 'excel' | 'pdf' | 'json') => Promise<Blob>
  importLists: (file: File) => Promise<void>
  
  // Filtering & Sorting
  filter: ListFilter
  setFilter: (filter: ListFilter) => void
  sort: ListSort
  setSort: (sort: ListSort) => void
  
  // Utils
  getListById: (id: string) => PurchaseList | undefined
  getFolderById: (id: string) => Folder | undefined
  refreshStatistics: () => void
  clearAllData: () => void
}

const ListsContext = createContext<ListsContextType | undefined>(undefined)

// IndexedDB helper functions
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(LISTS_STORE)) {
        db.createObjectStore(LISTS_STORE, { keyPath: 'id' })
      }
      
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' })
      }
    }
  })
}

const saveToIndexedDB = async (storeName: string, data: any[]) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    // Clear existing data
    await new Promise((resolve, reject) => {
      const clearReq = store.clear()
      clearReq.onsuccess = () => resolve(true)
      clearReq.onerror = () => reject(clearReq.error)
    })
    
    // Add new data
    for (const item of data) {
      store.add(item)
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error('IndexedDB save error:', error)
    // Fallback to localStorage
    localStorage.setItem(storeName, JSON.stringify(data))
  }
}

const loadFromIndexedDB = async (storeName: string): Promise<any[]> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => {
        // Fallback to localStorage
        const data = localStorage.getItem(storeName)
        resolve(data ? JSON.parse(data) : [])
      }
    })
  } catch (error) {
    console.error('IndexedDB load error:', error)
    // Fallback to localStorage
    const data = localStorage.getItem(storeName)
    return data ? JSON.parse(data) : []
  }
}

export const ListsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<PurchaseList[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [deletedLists, setDeletedLists] = useState<PurchaseList[]>([])
  const [deletedFolders, setDeletedFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<ListStatistics | null>(null)
  const [filter, setFilter] = useState<ListFilter>({})
  const [sort, setSort] = useState<ListSort>({ field: 'updatedAt', direction: 'desc' })

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [listsData, foldersData] = await Promise.all([
          loadFromIndexedDB(LISTS_STORE),
          loadFromIndexedDB(FOLDERS_STORE)
        ])
        
        // Debug: Log loaded data
        console.log('Loaded lists from IndexedDB:', listsData)
        console.log('Loaded folders from IndexedDB:', foldersData)
        
        // Parse dates and separate deleted items
        const allLists = listsData.map(list => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          dueDate: list.dueDate ? new Date(list.dueDate) : undefined,
          deletedAt: list.deletedAt ? new Date(list.deletedAt) : undefined,
          items: list.items || []
        }))
        
        const allFolders = foldersData.map(folder => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
          deletedAt: folder.deletedAt ? new Date(folder.deletedAt) : undefined
        }))
        
        // Separate active and deleted items
        const activeLists = allLists.filter(list => !list.isDeleted)
        const deletedListsData = allLists.filter(list => list.isDeleted)
        const activeFolders = allFolders.filter(folder => !folder.isDeleted)
        const deletedFoldersData = allFolders.filter(folder => folder.isDeleted)
        
        setLists(activeLists)
        setDeletedLists(deletedListsData)
        setFolders(activeFolders)
        setDeletedFolders(deletedFoldersData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Veri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Save data to IndexedDB whenever it changes
  useEffect(() => {
    if (!loading) {
      // Combine active and deleted lists for storage
      const allLists = [...lists, ...deletedLists]
      saveToIndexedDB(LISTS_STORE, allLists)
    }
  }, [lists, deletedLists, loading])

  useEffect(() => {
    if (!loading) {
      // Combine active and deleted folders for storage
      const allFolders = [...folders, ...deletedFolders]
      saveToIndexedDB(FOLDERS_STORE, allFolders)
    }
  }, [folders, deletedFolders, loading])

  // Calculate statistics
  useEffect(() => {
    const stats: ListStatistics = {
      totalLists: lists.length,
      totalItems: lists.reduce((sum, list) => sum + (list.items?.length || 0), 0),
      totalValue: lists.reduce((sum, list) => {
        return sum + (list.items?.reduce((itemSum, item) => {
          return itemSum + ((item.estimatedPrice || 0) * item.quantity)
        }, 0) || 0)
      }, 0),
      byStatus: {
        draft: lists.filter(l => l.status === 'draft').length,
        pending: lists.filter(l => l.status === 'pending').length,
        approved: lists.filter(l => l.status === 'approved').length,
        ordered: lists.filter(l => l.status === 'ordered').length,
        completed: lists.filter(l => l.status === 'completed').length,
        cancelled: lists.filter(l => l.status === 'cancelled').length
      },
      byPriority: {
        low: lists.filter(l => l.priority === 'low').length,
        normal: lists.filter(l => l.priority === 'normal').length,
        high: lists.filter(l => l.priority === 'high').length,
        urgent: lists.filter(l => l.priority === 'urgent').length
      },
      recentActivity: [], // TODO: Implement activity log
      upcomingDueDates: lists.filter(l => l.dueDate && new Date(l.dueDate) > new Date()),
      pendingApprovals: lists.filter(l => l.status === 'pending')
    }
    setStatistics(stats)
  }, [lists])


  // Update folder statistics when lists change
  useEffect(() => {
    if (!loading && folders.length > 0) {
      setFolders(prevFolders => {
        const updatedFolders = prevFolders.map(folder => {
          const folderLists = lists.filter(list => list.folderId === folder.id)
          const totalItems = folderLists.reduce((sum, list) => sum + (list.items?.length || 0), 0)
          const totalValue = folderLists.reduce((sum, list) => {
            return sum + (list.items?.reduce((itemSum, item) => {
              return itemSum + ((item.estimatedPrice || 0) * item.quantity)
            }, 0) || 0)
          }, 0)
          
          // Only update if values have changed
          if (folder.listCount !== folderLists.length || 
              folder.totalItems !== totalItems || 
              folder.totalValue !== totalValue) {
            return {
              ...folder,
              listCount: folderLists.length,
              totalItems,
              totalValue
            }
          }
          return folder
        })
        
        // Check if any folder has changed
        const hasChanges = updatedFolders.some((folder, index) => 
          folder.listCount !== prevFolders[index].listCount ||
          folder.totalItems !== prevFolders[index].totalItems ||
          folder.totalValue !== prevFolders[index].totalValue
        )
        
        return hasChanges ? updatedFolders : prevFolders
      })
    }
  }, [lists, loading, folders.length])

  // List Operations with Optimistic Updates
  const createList = useCallback((list: Partial<PurchaseList>, items?: Partial<ListItem>[]): PurchaseList => {
    const newList: PurchaseList = {
      id: list.id || `list-${Date.now()}`,
      name: list.name || 'Yeni Liste',
      description: list.description,
      folderId: list.folderId,
      status: list.status || 'draft',
      priority: list.priority || 'normal',
      items: (items as ListItem[]) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: list.createdBy || 'user',
      tags: list.tags || []
    }
    
    // Optimistic update
    setLists(prev => [...prev, newList])
    
    toast.success(`"${newList.name}" listesi oluşturuldu`, {
      description: items && items.length > 0 ? `${items.length} ürün eklendi` : undefined,
      action: {
        label: 'Göster',
        onClick: () => {
          // Navigate to lists page with the specific list
          window.location.href = `/listeler/${newList.id}`
        }
      }
    })
    
    return newList
  }, [])

  const updateList = useCallback((listId: string, updates: Partial<PurchaseList>) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return { ...list, ...updates, updatedAt: new Date() }
      }
      return list
    }))
    
    toast.success('Liste güncellendi')
  }, [])

  const deleteList = useCallback((listId: string, permanent?: boolean) => {
    if (permanent) {
      // Permanent delete from trash
      const list = deletedLists.find(l => l.id === listId)
      if (list) {
        setDeletedLists(prev => prev.filter(l => l.id !== listId))
        toast.success(`"${list.name}" listesi kalıcı olarak silindi`)
      }
    } else {
      // Soft delete - move to trash
      const list = lists.find(l => l.id === listId)
      if (list) {
        const deletedList = {
          ...list,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: 'user'
        }
        setLists(prev => prev.filter(l => l.id !== listId))
        setDeletedLists(prev => [...prev, deletedList])
        toast.success(`"${list.name}" listesi arşive taşındı`, {
          action: {
            label: 'Geri Al',
            onClick: () => restoreList(listId)
          }
        })
      }
    }
  }, [lists, deletedLists])
  
  const restoreList = useCallback((listId: string) => {
    const list = deletedLists.find(l => l.id === listId)
    if (list) {
      const restoredList = {
        ...list,
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined
      }
      setDeletedLists(prev => prev.filter(l => l.id !== listId))
      setLists(prev => [...prev, restoredList])
      toast.success(`"${list.name}" listesi geri yüklendi`)
    }
  }, [deletedLists])

  const duplicateList = useCallback((listId: string): PurchaseList => {
    const originalList = lists.find(l => l.id === listId)
    if (!originalList) {
      throw new Error('Liste bulunamadı')
    }
    
    const duplicatedList: PurchaseList = {
      ...originalList,
      id: `list-${Date.now()}`,
      name: `${originalList.name} (Kopya)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    }
    
    setLists(prev => [...prev, duplicatedList])
    toast.success(`"${originalList.name}" listesi kopyalandı`)
    
    return duplicatedList
  }, [lists])

  const mergeLists = useCallback((sourceIds: string[], targetId: string) => {
    const targetList = lists.find(l => l.id === targetId)
    if (!targetList) return
    
    const sourceLists = lists.filter(l => sourceIds.includes(l.id))
    const allItems = sourceLists.flatMap(l => l.items || [])
    
    setLists(prev => prev.map(list => {
      if (list.id === targetId) {
        return {
          ...list,
          items: [...(list.items || []), ...allItems],
          updatedAt: new Date()
        }
      }
      return list
    }).filter(l => !sourceIds.includes(l.id)))
    
    toast.success(`${sourceIds.length} liste birleştirildi`)
  }, [lists])

  // Item Operations
  const addItemsToList = useCallback((listId: string, items: Partial<ListItem>[]) => {
    // Find the list before updating
    const targetList = lists.find(l => l.id === listId)
    
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        const newItems = items.map(item => ({
          ...item,
          id: item.id || `item-${Date.now()}-${Math.random()}`,
          addedAt: new Date()
        } as ListItem))
        
        return {
          ...list,
          items: [...(list.items || []), ...newItems],
          updatedAt: new Date()
        }
      }
      return list
    }))
    
    // Show toast notification
    if (targetList) {
      toast.success(`${items.length} ürün listeye eklendi`, {
        description: `"${targetList.name}" listesine başarıyla eklendi`,
        action: {
          label: 'Göster',
          onClick: () => {
            // Navigate to lists page with the specific list
            window.location.href = `/listeler/${listId}`
          }
        },
        duration: 5000
      })
    }
  }, [lists])

  const removeItemFromList = useCallback((listId: string, itemId: string) => {
    let removedItem: ListItem | undefined
    
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        removedItem = list.items?.find(item => item.id === itemId)
        return {
          ...list,
          items: list.items?.filter(item => item.id !== itemId) || [],
          updatedAt: new Date()
        }
      }
      return list
    }))
    
    if (removedItem) {
      toast.success('Ürün listeden çıkarıldı', {
        description: `${removedItem.stokKodu} - ${removedItem.stokIsmi}`
      })
    }
  }, [])

  const updateListItem = useCallback((listId: string, itemId: string, updates: Partial<ListItem>) => {
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items?.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          ) || [],
          updatedAt: new Date()
        }
      }
      return list
    }))
  }, [])

  const moveItems = useCallback((sourceListId: string, targetListId: string, itemIds: string[]) => {
    const sourceList = lists.find(l => l.id === sourceListId)
    const targetList = lists.find(l => l.id === targetListId)
    
    if (!sourceList || !targetList) return
    
    const itemsToMove = sourceList.items?.filter(item => itemIds.includes(item.id)) || []
    
    setLists(prev => prev.map(list => {
      if (list.id === sourceListId) {
        return {
          ...list,
          items: list.items?.filter(item => !itemIds.includes(item.id)) || [],
          updatedAt: new Date()
        }
      }
      if (list.id === targetListId) {
        return {
          ...list,
          items: [...(list.items || []), ...itemsToMove],
          updatedAt: new Date()
        }
      }
      return list
    }))
    
    toast.success(`${itemIds.length} ürün taşındı`, {
      description: `"${sourceList.name}" → "${targetList.name}"`
    })
  }, [lists])

  // Folder Operations
  const createFolder = useCallback((folder: Partial<Folder>): Folder => {
    const newFolder: Folder = {
      id: folder.id || `folder-${Date.now()}`,
      name: folder.name || 'Yeni Klasör',
      description: folder.description,
      color: folder.color || '#3b82f6',
      icon: folder.icon || 'FolderOpen',
      createdAt: new Date(),
      updatedAt: new Date(),
      listCount: 0,
      totalItems: 0,
      tags: folder.tags || []
    }
    
    setFolders(prev => [...prev, newFolder])
    toast.success(`"${newFolder.name}" klasörü oluşturuldu`)
    
    return newFolder
  }, [])

  const updateFolder = useCallback((folderId: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, ...updates, updatedAt: new Date() }
      }
      return folder
    }))
  }, [])

  const deleteFolder = useCallback((folderId: string, permanent?: boolean) => {
    if (permanent) {
      // Permanent delete from trash
      const folder = deletedFolders.find(f => f.id === folderId)
      if (folder) {
        setDeletedFolders(prev => prev.filter(f => f.id !== folderId))
        toast.success(`"${folder.name}" klasörü kalıcı olarak silindi`)
      }
    } else {
      // Soft delete - move to trash
      const folder = folders.find(f => f.id === folderId)
      if (folder) {
        const deletedFolder = {
          ...folder,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: 'user'
        }
        // Remove folder reference from active lists
        setLists(prev => prev.map(list => {
          if (list.folderId === folderId) {
            return { ...list, folderId: undefined }
          }
          return list
        }))
        setFolders(prev => prev.filter(f => f.id !== folderId))
        setDeletedFolders(prev => [...prev, deletedFolder])
        toast.success(`"${folder.name}" klasörü arşive taşındı`, {
          action: {
            label: 'Geri Al',
            onClick: () => restoreFolder(folderId)
          }
        })
      }
    }
  }, [folders, deletedFolders])
  
  const restoreFolder = useCallback((folderId: string) => {
    const folder = deletedFolders.find(f => f.id === folderId)
    if (folder) {
      const restoredFolder = {
        ...folder,
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined
      }
      setDeletedFolders(prev => prev.filter(f => f.id !== folderId))
      setFolders(prev => [...prev, restoredFolder])
      toast.success(`"${folder.name}" klasörü geri yüklendi`)
    }
  }, [deletedFolders])

  // Bulk Operations
  const bulkUpdateLists = useCallback((listIds: string[], updates: Partial<PurchaseList>) => {
    setLists(prev => prev.map(list => {
      if (listIds.includes(list.id)) {
        return { ...list, ...updates, updatedAt: new Date() }
      }
      return list
    }))
    
    toast.success(`${listIds.length} liste güncellendi`)
  }, [])

  const bulkDeleteLists = useCallback((listIds: string[]) => {
    setLists(prev => prev.filter(list => !listIds.includes(list.id)))
    toast.success(`${listIds.length} liste silindi`)
  }, [])

  const exportLists = useCallback(async (listIds: string[], format: 'excel' | 'pdf' | 'json'): Promise<Blob> => {
    const listsToExport = lists.filter(l => listIds.includes(l.id))
    
    if (format === 'json') {
      const json = JSON.stringify(listsToExport, null, 2)
      return new Blob([json], { type: 'application/json' })
    }
    
    // TODO: Implement Excel and PDF export
    toast.info(`${format.toUpperCase()} export özelliği yakında eklenecek`)
    return new Blob()
  }, [lists])

  const importLists = useCallback(async (file: File): Promise<void> => {
    try {
      const text = await file.text()
      const importedLists = JSON.parse(text)
      
      if (Array.isArray(importedLists)) {
        const processedLists = importedLists.map(list => ({
          ...list,
          id: `list-${Date.now()}-${Math.random()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
        
        setLists(prev => [...prev, ...processedLists])
        toast.success(`${processedLists.length} liste içe aktarıldı`)
      }
    } catch (error) {
      toast.error('İçe aktarma başarısız')
      throw error
    }
  }, [])

  // Utils
  const getListById = useCallback((id: string) => {
    return lists.find(l => l.id === id)
  }, [lists])

  const getFolderById = useCallback((id: string) => {
    return folders.find(f => f.id === id)
  }, [folders])

  const refreshStatistics = useCallback(() => {
    // Statistics are automatically updated via useEffect
    toast.success('İstatistikler güncellendi')
  }, [])

  const clearAllData = useCallback(async () => {
    // State'leri temizle
    setLists([])
    setFolders([])
    
    // localStorage'ı temizle
    localStorage.removeItem(LISTS_STORE)
    localStorage.removeItem(FOLDERS_STORE)
    localStorage.removeItem('purchaseLists')
    localStorage.removeItem('folders')
    
    // IndexedDB'yi temizle
    try {
      const db = await initDB()
      const transaction = db.transaction([LISTS_STORE, FOLDERS_STORE], 'readwrite')
      
      await Promise.all([
        transaction.objectStore(LISTS_STORE).clear(),
        transaction.objectStore(FOLDERS_STORE).clear()
      ])
      
      console.log('All data cleared from IndexedDB and localStorage')
    } catch (error) {
      console.error('Error clearing IndexedDB:', error)
    }
    
    toast.success('Tüm veriler temizlendi')
  }, [])

  const value: ListsContextType = {
    lists,
    folders,
    loading,
    statistics,
    deletedLists,
    deletedFolders,
    createList,
    updateList,
    deleteList,
    restoreList,
    duplicateList,
    mergeLists,
    addItemsToList,
    removeItemFromList,
    updateListItem,
    moveItems,
    createFolder,
    updateFolder,
    deleteFolder,
    restoreFolder,
    bulkUpdateLists,
    bulkDeleteLists,
    exportLists,
    importLists,
    filter,
    setFilter,
    sort,
    setSort,
    getListById,
    getFolderById,
    refreshStatistics,
    clearAllData
  }

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
}

export const useLists = () => {
  const context = useContext(ListsContext)
  if (context === undefined) {
    throw new Error('useLists must be used within a ListsProvider')
  }
  return context
}