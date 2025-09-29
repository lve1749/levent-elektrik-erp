'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { StokAnalizRaporu } from '@/types'
import { TableColumn } from '@/components/filters/column-filter'
import { cn } from '@/lib/utils'
import ExportDialog from './export-dialog'

interface ExportButtonProps {
  data: StokAnalizRaporu[]
  selectedData?: StokAnalizRaporu[]
  columns?: TableColumn[]
  label?: string
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dashed" | "destructive" | "mono" | "dim" | "foreground" | "inverse"
  selectedGroup?: string | null
  className?: string
}

export default function ExportButton({ data, selectedData, columns, label, variant = "primary", selectedGroup, className = "" }: ExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Kısaltılmış label için
  const displayLabel = label ? (
    <>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">
        {label.includes('Seçili') ? `Seçili (${data.length})` : 'Aktar'}
      </span>
    </>
  ) : (
    <>
      <span className="hidden sm:inline">Dışa Aktar</span>
      <span className="sm:hidden">Aktar</span>
    </>
  )

  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        size="sm" 
        variant={variant === "outline" ? "outline" : undefined}
        className={cn(
          "h-[34px] rounded-lg text-[13px] whitespace-nowrap",
          variant === "primary" && "bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.62_0.19_260)] text-[oklch(0.97_0.00_286)] dark:bg-[oklch(0.55_0.22_263)] dark:hover:bg-[oklch(0.62_0.19_260)] dark:text-[oklch(0.97_0.00_286)] border-transparent",
          variant === "outline" && "bg-gradient-to-r from-[oklch(0.14_0.00_0)] to-[oklch(0.27_0.00_0)] hover:bg-[oklch(0.27_0.00_0)] hover:from-[oklch(0.27_0.00_0)] hover:to-[oklch(0.27_0.00_0)] text-[oklch(0.99_0.00_0)] hover:text-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:from-transparent dark:to-transparent dark:hover:bg-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:hover:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]",
          className
        )}
      >
        <Download className={cn(
          "mr-1.5 h-4 w-4 flex-shrink-0",
          variant === "primary" && "text-[oklch(0.97_0.00_286)]",
          variant === "outline" && "text-[oklch(0.99_0.00_0)] dark:text-[oklch(0.92_0.00_0)]"
        )} />
        {displayLabel}
      </Button>
      
      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
        selectedData={selectedData}
        initialColumns={columns}
        selectedGroup={selectedGroup}
      />
    </>
  )
}