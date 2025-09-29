'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AnimatedAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  cancelText?: string
  actionText?: string
  onCancel?: () => void
  onAction?: () => void
  actionClassName?: string
  cancelClassName?: string
}

export function AnimatedAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'İptal',
  actionText = 'Sil',
  onCancel,
  onAction,
  actionClassName = 'bg-red-600 hover:bg-red-700 text-white',
  cancelClassName = 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 dark:bg-[oklch(0.20_0.00_0)] dark:hover:bg-[oklch(0.14_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:hover:text-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]'
}: AnimatedAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <AlertDialogContent asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="bg-white dark:bg-[oklch(0.20_0.00_0)]"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  {description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={onAction}
                  className={actionClassName}
                >
                  {actionText}
                </AlertDialogAction>
                <AlertDialogCancel 
                  onClick={onCancel}
                  className={cancelClassName}
                >
                  {cancelText}
                </AlertDialogCancel>
              </AlertDialogFooter>
            </motion.div>
          </AlertDialogContent>
        )}
      </AnimatePresence>
    </AlertDialog>
  )
}

// Backdrop animasyonu için özel overlay
export function AnimatedAlertDialogOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    />
  )
}