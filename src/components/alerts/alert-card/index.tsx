import React, { useState, memo } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import AlertCardHeader from './header'
import AlertProgressSection from './progress-section'
import AlertNotesSection from './notes-section'
import AlertCardActions from './actions'
import { AlertCardProps } from '../shared/types'
import { ALERT_STATUS } from '../shared/constants'

/**
 * Alert Card - Ana Component
 * Tek bir stok uyarısını gösteren kart
 */
const AlertCard = memo(function AlertCard({
  alert,
  onInspect,
  onMarkAsRead,
  onDismiss,
  onAddNote,
  onDeleteNote
}: AlertCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const isRead = alert.status === ALERT_STATUS.READ
  
  const handleInspect = () => {
    onInspect(alert.stokKodu, alert.anaGrupKodu)
  }

  const handleMarkAsRead = () => {
    onMarkAsRead(alert.id)
  }

  const handleDismiss = () => {
    onDismiss(alert.id)
  }

  const handleAddNote = (text: string) => {
    onAddNote(alert.id, text)
    setShowNoteInput(false)
  }

  const handleDeleteNote = (noteId: string) => {
    onDeleteNote(alert.id, noteId)
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border-gray-200",
      isRead && "opacity-75 hover:opacity-90"
    )}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <AlertCardHeader
          stokKodu={alert.stokKodu}
          stokIsmi={alert.stokIsmi}
          onInspect={handleInspect}
        />
      </div>
      
      {/* Content */}
      <div className="px-4 pb-3 space-y-3">
        {/* Progress bölümü */}
        <AlertProgressSection
          kalanMiktar={alert.data.kalanMiktar}
          aylikOrtalamaSatis={alert.data.aylikOrtalamaSatis}
          ortalamaAylikStok={alert.data.ortalamaAylikStok}
          onerilenSiparis={alert.data.onerilenSiparis}
          severity={alert.severity}
        />

        {/* Notlar bölümü - varsa göster */}
        {((alert.notes && alert.notes.length > 0) || showNoteInput) && (
          <div className="pt-1">
            <AlertNotesSection
              notes={alert.notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}
      </div>

      {/* Aksiyonlar - Alt kısım */}
      <div className="px-4 pb-3">
        <AlertCardActions
          alertId={alert.id}
          isRead={isRead}
          onMarkAsRead={handleMarkAsRead}
          onDismiss={handleDismiss}
          onToggleNoteInput={() => setShowNoteInput(!showNoteInput)}
        />
      </div>
    </Card>
  )
})

export default AlertCard