import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCardHeaderProps } from '../shared/types'

/**
 * Alert Card Header Komponenti
 * Stok kodu, ismi ve incele butonunu gösterir
 */
export default function AlertCardHeader({
  stokKodu,
  stokIsmi,
  onInspect
}: AlertCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 space-y-0.5">
        <h3 className="text-[11px] font-semibold text-gray-900 tracking-tight">
          {stokKodu}
        </h3>
        <p className="text-[10px] text-gray-500 line-clamp-1 leading-tight" title={stokIsmi}>
          {stokIsmi}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[10px] px-2.5 font-medium"
        onClick={onInspect}
      >
        İncele
      </Button>
    </div>
  )
}