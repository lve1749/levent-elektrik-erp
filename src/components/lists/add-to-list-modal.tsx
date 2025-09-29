'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { TextMorph } from '@/components/ui/text-morph'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Plus, 
  FolderOpen, 
  FileText, 
  Calendar,
  AlertCircle,
  Package,
  Hash,
  X,
  Lightbulb,
  Zap,
  Cable,
  Star,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react'
import type { PurchaseList, Folder, ListItem } from '@/types/lists'
import type { StokAnalizRaporu } from '@/types'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/formatters'

interface AddToListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProducts: StokAnalizRaporu[]
  lists?: PurchaseList[]
  folders?: Folder[]
  onAddToList: (listId: string, items: Partial<ListItem>[]) => void
  onCreateList: (list: Partial<PurchaseList>, items: Partial<ListItem>[]) => void
}

export default function AddToListModal({
  open,
  onOpenChange,
  selectedProducts,
  lists: propsLists,
  folders: propsFolders,
  onAddToList,
  onCreateList
}: AddToListModalProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing')
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [priority, setPriority] = useState<PurchaseList['priority']>('normal')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [modifiedQuantities, setModifiedQuantities] = useState<Set<string>>(new Set())

  // Props'tan gelen veya localStorage'dan listeleri ve klasörleri al
  const [lists, setLists] = useState<PurchaseList[]>([])
  const [folders, setFolders] = useState<Folder[]>([])

  useEffect(() => {
    // Props'tan gelen verileri kullan ve sadece taslak durumundaki listeleri filtrele
    if (propsLists) {
      const draftLists = propsLists.filter(list => list.status === 'draft')
      setLists(draftLists)
    }
    
    if (propsFolders) {
      setFolders(propsFolders)
    }

    // Varsayılan miktarları ayarla (önerilen sipariş miktarı - yuvarlanmış)
    const defaultQuantities: Record<string, number> = {}
    selectedProducts.forEach(product => {
      defaultQuantities[product.stokKodu] = Math.round(product.onerilenSiparis || 0)
    })
    setQuantities(defaultQuantities)
  }, [selectedProducts, propsLists, propsFolders])

  const handleQuantityChange = (stokKodu: string, value: string) => {
    const num = parseInt(value) || 0
    const product = selectedProducts.find(p => p.stokKodu === stokKodu)
    const suggestedQty = Math.round(product?.onerilenSiparis || 0)
    
    setQuantities(prev => ({ ...prev, [stokKodu]: num }))
    
    // Önerilen miktardan farklıysa işaretle
    if (num !== suggestedQty) {
      setModifiedQuantities(prev => new Set(prev).add(stokKodu))
    } else {
      setModifiedQuantities(prev => {
        const newSet = new Set(prev)
        newSet.delete(stokKodu)
        return newSet
      })
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = () => {
    const items: Partial<ListItem>[] = selectedProducts.map(product => ({
      id: `item-${Date.now()}-${Math.random()}`,
      stokKodu: product.stokKodu,
      stokIsmi: product.stokIsmi,
      quantity: quantities[product.stokKodu] || 0,
      suggestedQuantity: Math.round(product.onerilenSiparis || 0),
      currentStock: product.kalanMiktar,
      unit: 'Adet', // TODO: Birim bilgisi eklenmeli
      isModified: modifiedQuantities.has(product.stokKodu), // Değiştirildi mi?
      priority: priority,
      status: 'pending',
      addedAt: new Date()
    }))

    if (activeTab === 'existing' && selectedListId) {
      onAddToList(selectedListId, items)
      // Show toast directly from modal
      const list = lists.find(l => l.id === selectedListId)
      if (list) {
        toast.success(`${items.length} ürün listeye eklendi`, {
          description: `"${list.name}" listesine başarıyla eklendi`,
          action: {
            label: 'Göster',
            onClick: () => {
              window.location.href = `/listeler/${selectedListId}`
            }
          },
          duration: 5000
        })
      }
    } else if (activeTab === 'new' && newListName) {
      const newList: Partial<PurchaseList> = {
        id: `list-${Date.now()}`,
        name: newListName,
        description: newListDescription,
        folderId: selectedFolderId === 'no-folder' ? undefined : selectedFolderId || undefined,
        status: 'draft',
        priority: priority,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user',
        tags: tags
      }
      onCreateList(newList, items)
      toast.success(`Yeni liste oluşturuldu`, {
        description: `"${newListName}" listesi başarıyla oluşturuldu`,
        duration: 5000
      })
    }

    // Formu sıfırla
    setNewListName('')
    setNewListDescription('')
    setTags([])
    setPriority('normal')
    setSelectedListId('')
    setActiveTab('existing')
    
    // Modalı kapat
    onOpenChange(false)
  }

  // Modal kapandığında state'leri temizle
  useEffect(() => {
    if (!open) {
      // Modal kapandığında formu sıfırla
      setNewListName('')
      setNewListDescription('')
      setTags([])
      setPriority('normal')
      setSelectedListId('')
      setActiveTab('existing')
      setTagInput('')
    }
  }, [open])

  const getPriorityColor = (p: PurchaseList['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600',
      normal: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600',
      high: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600',
      urgent: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600'
    }
    return colors[p]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]">
        <DialogHeader className="px-3 py-3">
          <DialogTitle>Listeye Ekle</DialogTitle>
          <DialogDescription>
            {selectedProducts.length} ürünü bir listeye ekleyin veya yeni liste oluşturun
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto modal-scrollbar px-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'existing' | 'new')}>
            <TabsList className="grid w-full grid-cols-2 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.15_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)] overflow-hidden">
              <TabsTrigger 
                value="existing" 
                className="relative data-[state=active]:text-[oklch(0.97_0.00_0)] data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent transition-colors duration-200 [&[data-state=active]_svg]:text-[oklch(0.97_0.00_0)]"
              >
                {activeTab === 'existing' && (
                  <motion.div
                    className="absolute inset-0 bg-[oklch(0.55_0.22_263)] rounded-md"
                    layoutId="addToListActiveTab"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.4
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Mevcut Listeye Ekle
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="relative data-[state=active]:text-[oklch(0.97_0.00_0)] data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent transition-colors duration-200 [&[data-state=active]_svg]:text-[oklch(0.97_0.00_0)]"
              >
                {activeTab === 'new' && (
                  <motion.div
                    className="absolute inset-0 bg-[oklch(0.55_0.22_263)] rounded-md"
                    layoutId="addToListActiveTab"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.4
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Liste Oluştur
                </span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === 'existing' && (
                <motion.div
                  key="existing"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 }
                  }}
                >
                  <TabsContent value="existing" className="space-y-4" forceMount>
              {lists.length > 0 ? (
                <div>
                  <Label>Liste Seçin</Label>
                  <Select value={selectedListId} onValueChange={setSelectedListId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Bir liste seçin" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                      {lists.map((list) => {
                        const folder = folders.find(f => f.id === list.folderId)
                        return (
                          <SelectItem key={list.id} value={list.id} className="dark:text-[oklch(0.92_0.00_0)]">
                            <div className="flex items-center gap-2 w-full">
                              <FileText className="h-4 w-4 text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]" />
                              <span className="flex-1">{list.name}</span>
                              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-[10px] py-0 px-1.5 rounded-full">
                                Taslak
                              </Badge>
                              {folder && (
                                <div className="flex items-center gap-1">
                                  <div 
                                    className="h-4 w-4 rounded flex items-center justify-center"
                                    style={{ backgroundColor: folder.color + '20' }}
                                  >
                                    <FolderOpen
                                      className="h-3 w-3" 
                                      style={{ color: folder.color }}
                                    />
                                  </div>
                                  <span className="text-xs text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]">
                                    {folder.name}
                                  </span>
                                </div>
                              )}
                              {list.tags && list.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {list.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 text-[10px] rounded-full bg-[oklch(0.95_0.00_0)] dark:bg-[oklch(0.27_0.00_0)] text-[oklch(0.55_0.00_0)] dark:text-[oklch(0.62_0.00_0)]"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {list.items?.length || 0} ürün
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 dark:bg-gray-950/20 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-[oklch(0.45_0.00_0)] dark:text-[oklch(0.65_0.00_0)] font-inter text-sm font-medium">
                      Taslak Liste Bulunamadı
                    </p>
                    <p className="text-[oklch(0.60_0.00_0)] dark:text-[oklch(0.50_0.00_0)] font-inter text-xs mt-1.5">
                      Sadece "Taslak" durumundaki listelere ürün ekleyebilirsiniz
                    </p>
                    <p className="text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.40_0.00_0)] font-inter text-[11px] mt-3 max-w-xs mx-auto">
                      Yeni bir liste oluşturun veya mevcut listeleri taslak durumuna getirin
                    </p>
                  </div>
                </div>
              )}
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === 'new' && (
                <motion.div
                  key="new"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.2 }
                  }}
                >
                  <TabsContent value="new" className="space-y-4" forceMount>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Liste Adı *</Label>
                  <Input
                    id="name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Örn: Mart Ayı Siparişleri"
                    className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
                  />
                </div>

                <div>
                  <Label htmlFor="folder">Klasör</Label>
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Klasör seçin" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                      <SelectItem value="no-folder" className="dark:text-[oklch(0.92_0.00_0)]">
                        <span className="text-gray-500">Klasör Yok</span>
                      </SelectItem>
                      {folders.map((folder) => {
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
                        const IconComponent = iconMap[folder.icon as keyof typeof iconMap] || FolderOpen
                        return (
                          <SelectItem key={folder.id} value={folder.id} className="dark:text-[oklch(0.92_0.00_0)]">
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-4 w-4 rounded flex items-center justify-center"
                                style={{ backgroundColor: folder.color + '20' }}
                              >
                                <IconComponent 
                                  className="h-3 w-3" 
                                  style={{ color: folder.color }}
                                />
                              </div>
                              <span>{folder.name}</span>
                              {folder.tags && folder.tags.length > 0 && (
                                <div className="flex items-center gap-1 ml-auto">
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
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Liste hakkında notlar..."
                    className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
                  />
                </div>

                <div>
                  <Label>Etiketler</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Etiket ekle..."
                      className="flex-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddTag} 
                      className="h-9 px-3 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-[oklch(0.97_0.00_286)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_286)] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!tagInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div>
                <Label>Öncelik</Label>
                <div className="flex gap-2 mt-2">
                  {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "relative overflow-hidden",
                        priority === p ? getPriorityColor(p) : "border-gray-200 dark:border-[oklch(0.27_0.00_0)]"
                      )}
                    >
                      <AnimatePresence>
                        {priority === p && (
                          <motion.div
                            className={cn(
                              "absolute inset-0",
                              p === 'low' && "bg-green-100 dark:bg-green-900/30",
                              p === 'normal' && "bg-blue-100 dark:bg-blue-900/30",
                              p === 'high' && "bg-orange-100 dark:bg-orange-900/30",
                              p === 'urgent' && "bg-red-100 dark:bg-red-900/30"
                            )}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.15,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </AnimatePresence>
                      <span className="relative z-10 flex items-center">
                        {p === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {p === 'low' && 'Düşük'}
                        {p === 'normal' && 'Normal'}
                        {p === 'high' && 'Yüksek'}
                        {p === 'urgent' && 'Acil'}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>

          {/* Seçili Ürünler */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Label className="mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Eklenecek Ürünler ({selectedProducts.length})
            </Label>
            <motion.div 
              className="bg-white dark:bg-[oklch(0.14_0.00_0)] border rounded-lg border-gray-200 dark:border-[oklch(0.27_0.00_0)] max-h-72 overflow-y-auto font-inter modal-scrollbar"
              layout
              transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
            >
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[oklch(0.27_0.00_0)] sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] font-inter border-b border-gray-200 dark:border-[oklch(0.27_0.00_0)]">Stok Kodu</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] font-inter border-b border-gray-200 dark:border-[oklch(0.27_0.00_0)]">Stok İsmi</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] font-inter border-b border-gray-200 dark:border-[oklch(0.27_0.00_0)]">Mevcut</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] font-inter border-b border-gray-200 dark:border-[oklch(0.27_0.00_0)]">Önerilen</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-[oklch(0.92_0.00_0)] font-inter border-b border-gray-200 dark:border-[oklch(0.27_0.00_0)] min-w-[200px]">Miktar</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product) => {
                    const hasPendingOrder = product.verilenSiparis && product.verilenSiparis > 0
                    return (
                      <tr key={product.stokKodu} className="border-b border-gray-100 dark:border-[oklch(0.27_0.00_0)] hover:bg-gray-50 dark:hover:bg-[oklch(0.27_0.00_0)]/30">
                        <td className="px-4 py-3 font-inter text-[13px] font-medium text-gray-900 dark:text-[oklch(0.87_0.00_0)]">
                          <div className="flex items-center gap-2">
                            {product.stokKodu}
                            {hasPendingOrder && (
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs py-0.5 px-2 rounded-full font-inter cursor-help">
                                      Bekliyor
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    className="bg-white dark:bg-[oklch(0.20_0.00_0)] border border-gray-200 dark:border-[oklch(0.27_0.00_0)] text-gray-900 dark:text-[oklch(0.92_0.00_0)] shadow-xl p-0 max-w-xs rounded-lg overflow-hidden"
                                    sideOffset={5}
                                  >
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-[oklch(0.25_0.00_0)] dark:to-[oklch(0.27_0.00_0)] px-4 py-2 border-b border-gray-200 dark:border-[oklch(0.30_0.00_0)]">
                                      <h3 className="font-semibold text-sm text-gray-900 dark:text-[oklch(0.92_0.00_0)]">Bekleyen Sipariş</h3>
                                    </div>
                                    <div className="p-4 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Verilen Sipariş:</span>
                                        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                                          {formatNumber(product.verilenSiparis)} adet
                                        </span>
                                      </div>
                                      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-md p-2">
                                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                                          Bu ürün için bekleyen siparişiniz mevcut
                                        </p>
                                        <p className="text-[10px] text-gray-600 dark:text-[oklch(0.70_0.00_0)] mt-1">
                                          Tekrar sipariş vermeden önce mevcut siparişin durumunu kontrol ediniz.
                                        </p>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-inter text-[13px] text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                          <div className="max-w-[250px] truncate" title={product.stokIsmi}>
                            {product.stokIsmi}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-inter text-[13px] text-gray-900 dark:text-[oklch(0.87_0.00_0)]">
                          <div>
                            {formatNumber(product.kalanMiktar)}
                            {hasPendingOrder && (
                              <div className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5">
                                +{formatNumber(product.verilenSiparis)} yolda
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-medium font-inter text-[13px]">
                          {product.onerilenSiparis ? formatNumber(product.onerilenSiparis) : '-'}
                        </td>
                        <td className="px-4 py-3 relative">
                          <div className="flex items-center justify-center">
                            {modifiedQuantities.has(product.stokKodu) && (
                              <div className="absolute left-4">
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full flex items-center justify-center cursor-help">
                                        <span className="text-blue-700 dark:text-blue-400 text-xs font-bold">!</span>
                                      </div>
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
                                          <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Önerilen Miktar:</span>
                                          <span className="text-xs font-mono font-semibold text-gray-700 dark:text-[oklch(0.87_0.00_0)]">
                                            {formatNumber(Math.round(product.onerilenSiparis || 0))} adet
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-500 dark:text-[oklch(0.65_0.00_0)]">Girilen Miktar:</span>
                                          <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                                            {formatNumber(quantities[product.stokKodu])} adet
                                          </span>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-2 mt-2">
                                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                            Bilgilendirme
                                          </p>
                                          <p className="text-[10px] text-gray-600 dark:text-[oklch(0.70_0.00_0)] mt-1">
                                            Sistem tarafından önerilen miktar değiştirildi. Girdiğiniz miktar ile devam edilecektir.
                                          </p>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                            <Input
                              type="number"
                              value={quantities[product.stokKodu] || 0}
                              onChange={(e) => handleQuantityChange(product.stokKodu, e.target.value)}
                              className={cn(
                                "w-24 h-8 text-center font-inter",
                                modifiedQuantities.has(product.stokKodu) && "border-blue-500 dark:border-blue-400"
                              )}
                              min="0"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </div>

        <DialogFooter className="px-3 py-3">
          <Button 
            onClick={handleSubmit}
            disabled={
              (activeTab === 'existing' && !selectedListId) ||
              (activeTab === 'new' && !newListName)
            }
            className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-[oklch(0.97_0.00_286)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_286)] min-w-[180px]"
          >
            <TextMorph 
              className="font-medium"
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                mass: 0.5,
              }}
            >
              {activeTab === 'existing' ? 'Listeye Ekle' : 'Liste Oluştur ve Ekle'}
            </TextMorph>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:hover:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]"
          >
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}