import React from 'react'
import { cn } from '@/lib/utils'
import { SEVERITY_CONFIGS } from './constants'
import { SeverityIndicatorProps } from './types'

/**
 * Severity göstergesi komponenti
 * Uyarı seviyesini görsel olarak gösterir
 */
export default function SeverityIndicator({ 
  severity, 
  size = 'sm',
  showLabel = false 
}: SeverityIndicatorProps) {
  const config = SEVERITY_CONFIGS[severity]
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <div 
        className={cn(
          "rounded-full",
          sizeClasses[size],
          config.dotColor
        )} 
      />
      {showLabel && (
        <span className={cn(
          "text-xs font-medium",
          config.textColor
        )}>
          {config.label}
        </span>
      )}
    </div>
  )
}