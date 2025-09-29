'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import ListExportDialog from './list-export-dialog'
import type { ListItem } from '@/types/lists'

interface ListExportButtonProps {
  items: ListItem[]
  listName: string
  variant?: 'primary' | 'outline'
}

export default function ListExportButton({ items, listName, variant = 'outline' }: ListExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        size="sm" 
        variant="outline"
        className="h-8 bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] text-[oklch(0.20_0.00_0)] dark:text-[oklch(0.92_0.00_0)] transition-colors duration-200"
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Dışa Aktar
      </Button>
      
      <ListExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        items={items}
        listName={listName}
      />
    </>
  )
}