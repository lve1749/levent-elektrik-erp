'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedDropdownMenuContentProps extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {
  children: React.ReactNode
  open?: boolean
}

export const AnimatedDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  AnimatedDropdownMenuContentProps
>(({ className, sideOffset = 4, children, open, ...props }, ref) => (
  <AnimatePresence>
    {open && (
      <DropdownMenuPrimitive.Portal forceMount>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          asChild
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className={cn(
              "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
              "bg-white dark:bg-[oklch(0.20_0.00_0)] border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]",
              className
            )}
          >
            {children}
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    )}
  </AnimatePresence>
))

AnimatedDropdownMenuContent.displayName = 'AnimatedDropdownMenuContent'