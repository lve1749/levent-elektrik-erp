'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/animated-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FolderOpen,
  Palette,
  Hash,
  X,
  AlertCircle,
  Lightbulb,
  Zap,
  FileText,
  Cable,
  Settings,
  Star,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder } from '@/types/lists'

interface CreateFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFolder: (folder: Partial<Folder>) => void
}

const folderColors = [
  { name: 'Kırmızı', value: '#ef4444' },
  { name: 'Turuncu', value: '#f97316' },
  { name: 'Sarı', value: '#eab308' },
  { name: 'Yeşil', value: '#22c55e' },
  { name: 'Mavi', value: '#3b82f6' },
  { name: 'Mor', value: '#8b5cf6' },
  { name: 'Pembe', value: '#ec4899' },
  { name: 'Gri', value: '#6b7280' }
]

const folderIcons = [
  { name: 'Klasör', value: 'FolderOpen', icon: FolderOpen },
  { name: 'Uyarı', value: 'AlertCircle', icon: AlertCircle },
  { name: 'Ampul', value: 'Lightbulb', icon: Lightbulb },
  { name: 'Yıldırım', value: 'Zap', icon: Zap },
  { name: 'Kablo', value: 'Cable', icon: Cable },
  { name: 'Dosya', value: 'FileText', icon: FileText },
  { name: 'Yıldız', value: 'Star', icon: Star },
  { name: 'Kalkan', value: 'Shield', icon: Shield }
]

export default function CreateFolderModal({
  open,
  onOpenChange,
  onCreateFolder
}: CreateFolderModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState('FolderOpen')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

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
    if (!name.trim()) return

    const newFolder: Partial<Folder> = {
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      listCount: 0,
      totalItems: 0
    }

    onCreateFolder(newFolder)
    
    // Formu sıfırla
    setName('')
    setDescription('')
    setColor('#3b82f6')
    setIcon('FolderOpen')
    setTags([])
    onOpenChange(false)
  }

  const SelectedIcon = folderIcons.find(i => i.value === icon)?.icon || FolderOpen

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]">
        <DialogHeader className="px-3 py-3">
          <DialogTitle>Yeni Klasör Oluştur</DialogTitle>
          <DialogDescription>
            Listelerinizi organize etmek için yeni bir klasör oluşturun
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-3">
          {/* Önizleme */}
          <div className="p-4 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color + '20' }}
              >
                <SelectedIcon 
                  className="h-6 w-6" 
                  style={{ color }}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-[oklch(0.92_0.00_0)]">
                  {name || 'Klasör Adı'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description || 'Klasör açıklaması'}
                </p>
              </div>
            </div>
          </div>

          {/* Klasör Adı */}
          <div>
            <Label htmlFor="folderName">Klasör Adı *</Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Acil Siparişler"
              className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
            />
          </div>

          {/* Açıklama */}
          <div>
            <Label htmlFor="folderDescription">Açıklama</Label>
            <Input
              id="folderDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Klasör hakkında kısa bir açıklama..."
              className="mt-1 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
            />
          </div>

          {/* Etiketler */}
          <div>
            <Label>Etiketler</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Etiket ekle..."
                className="flex-1 h-9 dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%]"
              />
              <Button 
                type="button" 
                onClick={handleAddTag} 
                className="h-9 px-3 bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-white dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)]"
              >
                <Hash className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                    style={{ 
                      backgroundColor: color + '20',
                      color: color,
                      border: `1px solid ${color}40`
                    }}
                  >
                    <Hash className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Renk Seçimi */}
          <div>
            <Label>Renk</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {folderColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "h-8 w-8 rounded-lg border-2 transition-all",
                    color === c.value 
                      ? "border-gray-900 dark:border-white scale-110" 
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* İkon Seçimi */}
          <div>
            <Label>İkon</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {folderIcons.map((i) => {
                const IconComponent = i.icon
                return (
                  <button
                    key={i.value}
                    onClick={() => setIcon(i.value)}
                    className={cn(
                      "h-11 w-full rounded-lg border-2 flex items-center justify-center transition-all",
                      icon === i.value 
                        ? "scale-105" 
                        : "border-gray-200 dark:border-[oklch(0.27_0.00_0)] hover:border-gray-300 dark:hover:border-[oklch(0.44_0.00_0)] hover:scale-105"
                    )}
                    style={{
                      borderColor: icon === i.value ? color : undefined,
                      backgroundColor: icon === i.value ? color + '20' : undefined
                    }}
                    title={i.name}
                  >
                    <IconComponent 
                      className={cn(
                        "h-5 w-5",
                        icon !== i.value && "text-gray-700 dark:text-gray-400"
                      )}
                      style={{ 
                        color: icon === i.value ? color : undefined 
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-3 py-3">
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim()}
            className="bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-[oklch(0.97_0.00_286)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_286)]"
          >
            Klasör Oluştur
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