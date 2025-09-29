import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, Check, X, StickyNote, Plus } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { AlertNotesProps } from '../shared/types'
import { StockAlertNote } from '@/types'

/**
 * Alert Card Notes Section
 * Not ekleme, düzenleme ve silme işlemleri
 */
export default function AlertNotesSection({
  notes = [],
  onAddNote,
  onDeleteNote
}: AlertNotesProps) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText.trim())
      setNoteText('')
      setShowNoteInput(false)
      setIsDialogOpen(false)
    }
  }

  const handleEditNote = (note: StockAlertNote) => {
    setEditingNoteId(note.id)
    setEditNoteText(note.text)
  }

  const handleSaveEdit = (noteId: string) => {
    if (editNoteText.trim()) {
      onDeleteNote(noteId)
      onAddNote(editNoteText.trim())
    }
    setEditingNoteId(null)
    setEditNoteText('')
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditNoteText('')
  }

  return (
    <div className="space-y-2">
      {/* Not ekleme butonu ve dialog */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StickyNote className="h-3 w-3 text-yellow-600" />
          <span className="text-[10px] font-medium text-gray-700">Notlar</span>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-1.5 text-[10px] text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            >
              <Plus className="h-3 w-3 mr-0.5" />
              Not Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Not Ekle</DialogTitle>
              <DialogDescription>
                Bu uyarı için not ekleyin. Notlar daha sonra düzenlenebilir veya silinebilir.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="note" className="text-sm font-medium">
                  Not İçeriği
                </label>
                <textarea
                  id="note"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Notunuzu buraya yazın..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAddNote()
                    }
                  }}
                />
                <p className="text-[11px] text-muted-foreground">
                  İpucu: Ctrl+Enter ile hızlı kaydet
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNoteText('')
                }}
              >
                İptal
              </Button>
              <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                Not Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mevcut notlar */}
      <div className="space-y-1.5">
        {notes.map(note => (
          <div key={note.id} className="group">
            {editingNoteId === note.id ? (
              <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1.5">
                <Input
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                  className="h-6 text-[10px] flex-1 bg-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(note.id)}
                  onKeyDown={(e) => e.key === 'Escape' && handleCancelEdit()}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  onClick={() => handleSaveEdit(note.id)}
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  onClick={handleCancelEdit}
                >
                  <X className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-1.5">
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 transition-colors flex-1 justify-start font-normal"
                >
                  <StickyNote className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{note.text}</span>
                </Badge>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 hover:bg-yellow-50"
                    onClick={() => handleEditNote(note)}
                  >
                    <Edit2 className="h-3 w-3 text-gray-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 hover:bg-red-50"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {notes.length === 0 && (
          <p className="text-[10px] text-gray-500 italic px-1">
            Henüz not eklenmemiş
          </p>
        )}
      </div>
    </div>
  )
}