'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/animated-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText,
  FolderOpen,
  AlertCircle,
  Lightbulb,
  Zap,
  Cable,
  Star,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PurchaseList, Folder } from '@/types/lists'

interface EditListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: PurchaseList | null
  folders: Folder[]
  onUpdateList: (listId: string, updates: Partial<PurchaseList>) => void
}

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

export default function EditListModal({
  open,
  onOpenChange,
  list,
  folders,
  onUpdateList
}: EditListModalProps) {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [folderId, setFolderId] = useState<string>('')
  const [status, setStatus] = useState<PurchaseList['status']>('draft')
  const [priority, setPriority] = useState<PurchaseList['priority']>('normal')
  const [cancellationReason, setCancellationReason] = useState<string>('')
  const [showCancellationError, setShowCancellationError] = useState(false)

  // List değiştiğinde state'leri güncelle
  useEffect(() => {
    if (list) {
      setName(list.name || '')
      setDescription(list.description || '')
      setFolderId(list.folderId || '')
      setStatus(list.status || 'draft')
      setPriority(list.priority || 'normal')
      setCancellationReason(list.cancellationReason || '')
      setShowCancellationError(false)
    }
  }, [list])

  const handleSubmit = () => {
    if (!list) return

    // Liste adı boş olamaz
    if (!name.trim()) {
      return
    }

    // İptal durumunda iptal nedeni zorunlu
    if (status === 'cancelled' && !cancellationReason.trim()) {
      setShowCancellationError(true)
      return
    }

    const updates: Partial<PurchaseList> = {
      name: name.trim(),
      description: description.trim() || undefined,
      folderId: folderId || undefined,
      status,
      priority,
      cancellationReason: status === 'cancelled' ? cancellationReason : undefined,
      updatedAt: new Date()
    }

    onUpdateList(list.id, updates)
    onOpenChange(false)
  }

  const selectedFolder = folders.find(f => f.id === folderId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]">
        <DialogHeader className="px-3 py-3">
          <DialogTitle>Listeyi Düzenle</DialogTitle>
          <DialogDescription>
            Liste bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-3">
          
          {/* Liste Adı */}
          <div>
            <Label htmlFor="name">
              Liste Adı
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Liste adını giriniz"
              className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
            />
          </div>

          {/* Açıklama */}
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Açıklama giriniz (opsiyonel)"
              className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
            />
          </div>

          {/* Klasör Seçimi */}
          <div>
            <Label htmlFor="folder">Klasör</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                <SelectValue placeholder="Klasör seçin (opsiyonel)">
                  {selectedFolder ? (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = iconMap[selectedFolder.icon as keyof typeof iconMap] || FolderOpen
                        return (
                          <div 
                            className="h-4 w-4 rounded flex items-center justify-center"
                            style={{ backgroundColor: selectedFolder.color + '20' }}
                          >
                            <IconComponent 
                              className="h-3 w-3" 
                              style={{ color: selectedFolder.color }}
                            />
                          </div>
                        )
                      })()}
                      <span>{selectedFolder.name}</span>
                      {selectedFolder.tags && selectedFolder.tags.length > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                          {selectedFolder.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[10px] rounded-full"
                              style={{ 
                                backgroundColor: selectedFolder.color + '20',
                                color: selectedFolder.color,
                                border: `1px solid ${selectedFolder.color}30`
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    "Klasör seçin (opsiyonel)"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                <SelectItem value=" " className="dark:text-[oklch(0.92_0.00_0)]">
                  <span className="text-gray-500">Klasör yok</span>
                </SelectItem>
                {folders.map((folder) => {
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

          {/* Durum ve Öncelik */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={status} onValueChange={(value) => {
                setStatus(value as PurchaseList['status'])
                // İptal seçilmediğinde iptal nedenini ve hata mesajını temizle
                if (value !== 'cancelled') {
                  setCancellationReason('')
                  setShowCancellationError(false)
                } else {
                  // İptal seçildiğinde hata mesajını temizle
                  setShowCancellationError(false)
                }
              }}>
                <SelectTrigger className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                  <SelectItem value="draft" className="dark:text-[oklch(0.92_0.00_0)]">Taslak</SelectItem>
                  <SelectItem value="pending" className="dark:text-[oklch(0.92_0.00_0)]">Bekleyen</SelectItem>
                  <SelectItem value="approved" className="dark:text-[oklch(0.92_0.00_0)]">Onaylanan</SelectItem>
                  <SelectItem value="ordered" className="dark:text-[oklch(0.92_0.00_0)]">Sipariş Verildi</SelectItem>
                  <SelectItem value="completed" className="dark:text-[oklch(0.92_0.00_0)]">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled" className="dark:text-[oklch(0.92_0.00_0)]">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Öncelik</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as PurchaseList['priority'])}>
                <SelectTrigger className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                  <SelectItem value="low" className="dark:text-[oklch(0.92_0.00_0)]">Düşük</SelectItem>
                  <SelectItem value="normal" className="dark:text-[oklch(0.92_0.00_0)]">Normal</SelectItem>
                  <SelectItem value="high" className="dark:text-[oklch(0.92_0.00_0)]">Yüksek</SelectItem>
                  <SelectItem value="urgent" className="dark:text-[oklch(0.92_0.00_0)]">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* İptal Nedeni - Sadece iptal durumunda göster */}
          {status === 'cancelled' && (
            <div className="space-y-1">
              <Label htmlFor="cancellationReason">
                İptal Nedeni
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="cancellationReason"
                type="text"
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value)
                  // Yazma başladığında hata mesajını kaldır
                  if (showCancellationError && e.target.value.trim()) {
                    setShowCancellationError(false)
                  }
                }}
                placeholder="İptal nedenini belirtiniz"
                className={cn(
                  "mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]",
                  showCancellationError && "border-red-500 dark:border-red-500 focus:ring-red-500"
                )}
              />
              {showCancellationError && (
                <p className="text-xs text-red-500 dark:text-red-400">İptal nedeni girilmesi zorunludur</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-3 py-3">
          <Button 
            onClick={handleSubmit}
            className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-[oklch(0.97_0.00_286)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_286)]"
          >
            Değişiklikleri Kaydet
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