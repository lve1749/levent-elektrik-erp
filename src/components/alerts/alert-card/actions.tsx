import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, StickyNote, CheckCircle2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AlertActionsProps } from '../shared/types'
import { TEXTS } from '../shared/constants'

/**
 * Alert Card Actions
 * Alt aksiyon butonları - Okundu, Not Ekle, Sil
 */
export default function AlertCardActions({
  alertId,
  isRead,
  onMarkAsRead,
  onDismiss,
  onToggleNoteInput
}: AlertActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    onDismiss()
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
      <div className="flex items-center gap-1">
        {!isRead && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] gap-1.5 text-gray-600 hover:text-gray-900"
            onClick={onMarkAsRead}
          >
            <CheckCircle2 className="h-3 w-3" />
            Okundu
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[10px] gap-1.5 text-gray-600 hover:text-gray-900"
          onClick={onToggleNoteInput}
        >
          <StickyNote className="h-3 w-3" />
          Not Ekle
        </Button>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uyarıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu uyarıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}