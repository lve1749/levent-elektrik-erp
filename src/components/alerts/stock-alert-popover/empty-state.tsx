import React from 'react'
import { Bell } from 'lucide-react'
import { TEXTS } from '../shared/constants'

interface EmptyStateProps {
  type: 'active' | 'read'
}

/**
 * Empty State - Uyarı olmadığında gösterilecek durum
 */
export default function EmptyState({ type }: EmptyStateProps) {
  const message = type === 'active' ? TEXTS.EMPTY_ACTIVE : TEXTS.EMPTY_READ

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <Bell className="h-14 w-14 text-gray-300 mb-4" />
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  )
}