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
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Folder, PurchaseList } from '@/types/lists'
import { cn } from '@/lib/utils'

interface AddToFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: PurchaseList | null
  folders: Folder[]
  onAddToFolder: (listId: string, folderId: string) => void
}

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

import { 
  FolderOpen, 
  AlertCircle, 
  Lightbulb, 
  Zap, 
  Cable,
  FileText,
  Star,
  Shield
} from 'lucide-react'

export default function AddToFolderModal({
  open,
  onOpenChange,
  list,
  folders,
  onAddToFolder
}: AddToFolderModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setSelectedFolderId('')
      setSearchTerm('')
    }
  }, [open])

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = () => {
    if (list && selectedFolderId) {
      onAddToFolder(list.id, selectedFolderId)
      onOpenChange(false)
    }
  }

  if (!list) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[oklch(0.20_0.00_0)] border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
        <DialogHeader>
          <DialogTitle>Klasöre Ekle</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">"{list.name}"</span> listesini hangi klasöre eklemek istersiniz?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Klasör ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[oklch(0.97_0.00_0)] border-[oklch(0.92_0.00_0)] text-[oklch(0.37_0.00_0)] placeholder:text-[oklch(0.37_0.00_0)]/50 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.87_0.00_0)] dark:placeholder:text-[oklch(0.87_0.00_0)]/50"
            />
          </div>

          {/* Klasör Listesi */}
          <ScrollArea className="h-[300px] pr-4">
            {filteredFolders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Klasör bulunamadı' : 'Henüz klasör oluşturulmamış'}
                </p>
              </div>
            ) : (
              <RadioGroup value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <div className="space-y-2">
                  {filteredFolders.map((folder) => {
                    const IconComponent = iconMap[folder.icon as keyof typeof iconMap] || FolderOpen
                    const isCurrentFolder = list.folderId === folder.id
                    
                    return (
                      <div
                        key={folder.id}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                          selectedFolderId === folder.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50",
                          isCurrentFolder && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <RadioGroupItem 
                          value={folder.id} 
                          id={folder.id} 
                          disabled={isCurrentFolder}
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={folder.id}
                          className={cn(
                            "flex flex-1 items-center gap-3 cursor-pointer",
                            isCurrentFolder && "cursor-not-allowed"
                          )}
                        >
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: folder.color + '20' }}
                          >
                            <IconComponent 
                              className="h-4 w-4" 
                              style={{ color: folder.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {folder.name}
                              </span>
                              {isCurrentFolder && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  (Mevcut klasör)
                                </span>
                              )}
                            </div>
                            {folder.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {folder.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {folder.listCount} liste
                              </span>
                              {folder.tags && folder.tags.length > 0 && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
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
                                </>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFolderId}
            className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Klasöre Ekle
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